'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  SimulationNodeDatum,
  SimulationLinkDatum,
} from 'd3-force';
import { BigramLink, BigramSummaryItem, TopKeyword } from '@/types/analyzer';
import { ZoomIn, ZoomOut, RotateCcw, Sparkles, Network, Share2, Move } from 'lucide-react';

interface BigramNetworkProps {
  bigrams: BigramLink[];
  bigramSummary: BigramSummaryItem[];
  topKeywords: TopKeyword[];
  selectedKeyword?: string | null;
  onSelectKeyword?: (word: string) => void;
}

interface SimNode extends SimulationNodeDatum {
  id: string;
  word: string;
  count: number;
  radius: number;
  pos?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  source: SimNode | string;
  target: SimNode | string;
  count: number;
  strength: number;
  contextSummary: string;
}

export function BigramNetwork({
  bigrams,
  bigramSummary,
  topKeywords,
  selectedKeyword,
  onSelectKeyword,
}: BigramNetworkProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 520 });
  const [nodes, setNodes] = useState<SimNode[]>([]);
  const [links, setLinks] = useState<SimLink[]>([]);
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null);
  const [hoveredLink, setHoveredLink] = useState<SimLink | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // 드래그 및 애니메이션 제어 ref
  const draggedNodeRef = useRef<SimNode | null>(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const simulationRef = useRef<any>(null);
  const rafIdRef = useRef<number | null>(null);

  // 컨테이너 크기 반응형 감지
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) {
          setDimensions({ width, height: Math.max(480, Math.min(580, width * 0.58)) });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 노드 및 링크 데이터 그래프 구조화 + 부드러운 물리 시뮬레이션
  useEffect(() => {
    if (!bigrams || bigrams.length === 0) return;

    const keywordMap = new Map<string, { count: number; pos: string }>();
    topKeywords.forEach((k) => keywordMap.set(k.word, { count: k.count, pos: k.pos }));

    const nodeMap = new Map<string, SimNode>();
    bigrams.forEach((b) => {
      const s = b.source.trim();
      const t = b.target.trim();
      if (!s || !t) return;

      if (!nodeMap.has(s)) {
        const info = keywordMap.get(s) || { count: b.count, pos: '명사' };
        nodeMap.set(s, {
          id: s,
          word: s,
          count: info.count,
          pos: info.pos,
          radius: Math.max(18, Math.min(34, 16 + info.count * 1.4)),
        });
      }
      if (!nodeMap.has(t)) {
        const info = keywordMap.get(t) || { count: b.count, pos: '명사' };
        nodeMap.set(t, {
          id: t,
          word: t,
          count: info.count,
          pos: info.pos,
          radius: Math.max(18, Math.min(34, 16 + info.count * 1.4)),
        });
      }
    });

    const initialNodes: SimNode[] = Array.from(nodeMap.values());
    const initialLinks: SimLink[] = bigrams
      .filter((b) => nodeMap.has(b.source.trim()) && nodeMap.has(b.target.trim()))
      .map((b) => ({
        source: b.source.trim(),
        target: b.target.trim(),
        count: b.count,
        strength: b.strength,
        contextSummary: b.contextSummary,
      }));

    const width = dimensions.width;
    const height = dimensions.height;

    // 부드러운 물리 감쇠(velocityDecay) 및 안정적인 인력 설정
    const simulation = forceSimulation<SimNode>(initialNodes)
      .velocityDecay(0.38) // 움직임을 부드럽고 끈끈하게 유지
      .alphaDecay(0.022)
      .force(
        'link',
        forceLink<SimNode, SimLink>(initialLinks)
          .id((d) => d.id)
          .distance((d) => Math.max(75, 130 - (d.count || 1) * 7))
          .strength((d) => Math.min(0.8, (d.strength || 0.5) * 0.7))
      )
      .force('charge', forceManyBody().strength(-200).distanceMax(300))
      .force('center', forceCenter(width / 2, height / 2))
      .force(
        'collide',
        forceCollide<SimNode>()
          .radius((d) => d.radius + 12)
          .iterations(2)
      );

    // 틱 이벤트: 화면 안쪽 안정적 배치 (바운딩 박스 클램핑)
    simulation.on('tick', () => {
      const pad = 30;
      initialNodes.forEach((node) => {
        if (node.x !== undefined) {
          node.x = Math.max(node.radius + pad, Math.min(width - node.radius - pad, node.x));
        }
        if (node.y !== undefined) {
          node.y = Math.max(node.radius + pad, Math.min(height - node.radius - pad, node.y));
        }
      });
      setNodes([...initialNodes]);
      setLinks([...initialLinks]);
    });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [bigrams, topKeywords, dimensions]);

  // 부드러운 드래그 핸들러 (Pointer Events + 부드러운 alpha 조절)
  const handlePointerDownNode = (e: React.PointerEvent, node: SimNode) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    draggedNodeRef.current = node;

    node.fx = node.x;
    node.fy = node.y;

    if (simulationRef.current) {
      // 살짝만 자극하여 다른 노드들이 요동치지 않고 부드럽게 반응하도록 설정
      simulationRef.current.alphaTarget(0.12).restart();
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggedNodeRef.current && simulationRef.current) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const rawX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
      const rawY = (e.clientY - rect.top - panOffset.y) / zoomLevel;
      const pad = 30;
      const clampedX = Math.max(
        draggedNodeRef.current.radius + pad,
        Math.min(dimensions.width - draggedNodeRef.current.radius - pad, rawX)
      );
      const clampedY = Math.max(
        draggedNodeRef.current.radius + pad,
        Math.min(dimensions.height - draggedNodeRef.current.radius - pad, rawY)
      );

      // requestAnimationFrame을 통한 부드러운 위치 갱신
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        if (draggedNodeRef.current) {
          draggedNodeRef.current.fx = clampedX;
          draggedNodeRef.current.fy = clampedY;
        }
      });
    } else if (isPanningRef.current) {
      setPanOffset({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggedNodeRef.current) {
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {}
      draggedNodeRef.current.fx = null;
      draggedNodeRef.current.fy = null;
      draggedNodeRef.current = null;

      if (simulationRef.current) {
        simulationRef.current.alphaTarget(0);
      }
    }
    isPanningRef.current = false;
  };

  const handlePointerDownSvg = (e: React.PointerEvent) => {
    isPanningRef.current = true;
    panStartRef.current = {
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y,
    };
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    if (simulationRef.current) {
      simulationRef.current.alpha(0.4).restart();
    }
  };

  // 호버 시 연결된 노드 ID 집합
  const connectedNodeIds = useMemo(() => {
    if (!hoveredNode) return new Set<string>();
    const ids = new Set<string>();
    ids.add(hoveredNode.id);
    links.forEach((l) => {
      const sId = typeof l.source === 'object' ? l.source.id : l.source;
      const tId = typeof l.target === 'object' ? l.target.id : l.target;
      if (sId === hoveredNode.id) ids.add(tId);
      if (tId === hoveredNode.id) ids.add(sId);
    });
    return ids;
  }, [hoveredNode, links]);

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
      {/* 헤더 */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
              <Network className="w-4 h-4" />
            </div>
            <h3 className="typo-h3 text-slate-900">
              바이그램(Bigram) 단어 쌍 네트워크 시각화
            </h3>
          </div>
          <p className="typo-caption text-slate-500 mt-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            한국어 형태소 분석을 거친 실질 단어 간의 동시 출현 및 문맥적 결합 강도를 연결망으로 표현합니다.
          </p>
        </div>

        {/* 줌/리셋 컨트롤 툴바 */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.min(2, prev + 0.15))}
            className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
            title="확대"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.max(0.5, prev - 0.15))}
            className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
            title="축소"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={resetView}
            className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 px-2"
            title="초기 뷰 복원"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px]">초기화</span>
          </button>
        </div>
      </div>

      {/* 네트워크 SVG 캔버스 영역 */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative w-full overflow-hidden bg-slate-50/60 select-none cursor-grab active:cursor-grabbing border-b border-slate-100 touch-none"
        style={{ height: `${dimensions.height}px` }}
      >
        <svg
          width={dimensions.width}
          height={dimensions.height}
          onPointerDown={handlePointerDownSvg}
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="primaryNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
            <linearGradient id="activeNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.12" />
            </filter>
          </defs>

          <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
            {/* 링크 라인 */}
            {links.map((link, idx) => {
              const s = link.source as SimNode;
              const t = link.target as SimNode;
              if (s.x === undefined || s.y === undefined || t.x === undefined || t.y === undefined)
                return null;

              const isLinkActive =
                (hoveredNode && (s.id === hoveredNode.id || t.id === hoveredNode.id)) ||
                hoveredLink === link;

              return (
                <g key={`link-${idx}`}>
                  <line
                    x1={s.x}
                    y1={s.y}
                    x2={t.x}
                    y2={t.y}
                    stroke={isLinkActive ? '#dc2626' : '#cbd5e1'}
                    strokeWidth={isLinkActive ? Math.max(3, link.count * 1.6) : Math.max(1.5, link.count * 0.9)}
                    strokeOpacity={isLinkActive ? 0.95 : 0.5}
                    className="transition-colors duration-200 cursor-pointer"
                    onPointerEnter={() => setHoveredLink(link)}
                    onPointerLeave={() => setHoveredLink(null)}
                  />
                  {link.count > 1 && (
                    <text
                      x={(s.x + t.x) / 2}
                      y={(s.y + t.y) / 2 - 4}
                      fill={isLinkActive ? '#991b1b' : '#64748b'}
                      fontSize={10}
                      fontWeight="700"
                      textAnchor="middle"
                      className="pointer-events-none select-none"
                    >
                      {link.count}
                    </text>
                  )}
                </g>
              );
            })}

            {/* 노드 원형 및 텍스트 */}
            {nodes.map((node) => {
              if (node.x === undefined || node.y === undefined) return null;
              const isHovered = hoveredNode?.id === node.id;
              const isConnected = connectedNodeIds.has(node.id);
              const isDimmed = hoveredNode !== null && !isConnected;
              const isSelected = selectedKeyword === node.word;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onPointerDown={(e) => handlePointerDownNode(e, node)}
                  onPointerEnter={() => setHoveredNode(node)}
                  onPointerLeave={() => setHoveredNode(null)}
                  onClick={() => onSelectKeyword && onSelectKeyword(node.word)}
                  className="cursor-pointer transition-opacity duration-150"
                  opacity={isDimmed ? 0.25 : 1}
                >
                  <circle
                    r={node.radius}
                    fill={isSelected ? '#991b1b' : isHovered ? 'url(#activeNodeGrad)' : 'url(#primaryNodeGrad)'}
                    stroke="#ffffff"
                    strokeWidth={isHovered || isSelected ? 3.5 : 2}
                    filter="url(#nodeShadow)"
                    className="transition-all duration-150"
                  />
                  <text
                    textAnchor="middle"
                    dy=".35em"
                    fill="#ffffff"
                    fontSize={node.radius > 26 ? 12 : 11}
                    fontWeight="700"
                    className="pointer-events-none select-none"
                  >
                    {node.word}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* 인터랙티브 호버 정보 툴팁 */}
        {(hoveredNode || hoveredLink) && (
          <div className="absolute top-4 right-4 z-20 max-w-xs p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl typo-sub animate-in fade-in duration-150">
            {hoveredNode && (
              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-900 pb-1.5 border-b border-slate-100">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  <span>단어: {hoveredNode.word}</span>
                  <span className="typo-caption text-slate-400 font-normal">({hoveredNode.pos || '형태소'})</span>
                </div>
                <div className="mt-2 text-slate-700">
                  출현 빈도: <span className="font-extrabold text-red-600">{hoveredNode.count}회</span>
                </div>
                <div className="mt-1 typo-caption text-slate-400">
                  마우스로 드래그하여 부드럽게 위치를 이동할 수 있습니다.
                </div>
              </div>
            )}
            {hoveredLink && !hoveredNode && (
              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-900 pb-1.5 border-b border-slate-100">
                  <Share2 className="w-3.5 h-3.5 text-red-600" />
                  <span>
                    {typeof hoveredLink.source === 'object' ? hoveredLink.source.word : hoveredLink.source} ↔{' '}
                    {typeof hoveredLink.target === 'object' ? hoveredLink.target.word : hoveredLink.target}
                  </span>
                </div>
                <div className="mt-2 text-slate-700">
                  동시 출현 빈도: <span className="font-extrabold text-red-600">{hoveredLink.count}회</span>
                </div>
                <p className="mt-1.5 typo-caption text-slate-500 leading-snug">
                  {hoveredLink.contextSummary}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 캔버스 하단 안내 */}
        <div className="absolute bottom-3 left-4 typo-caption text-slate-400 pointer-events-none flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5" />
          <span>단어 노드를 마우스로 부드럽게 드래그하거나 캔버스를 이동해 보세요. (화면 안쪽 자동 배치 제약 적용)</span>
        </div>
      </div>

      {/* 6. 바이그램에 대한 요약 정보 (바이그램 시각화 영역 바로 아래) */}
      <div className="p-6 bg-slate-50/70">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <h4 className="typo-h3 text-slate-900 text-sm sm:text-base">
              바이그램(Bigram) 핵심 단어 쌍 요약 정보
            </h4>
          </div>
          <span className="typo-caption text-slate-500">
            총 {bigramSummary.length || bigrams.length}개 핵심 연관 조합
          </span>
        </div>

        {bigramSummary.length === 0 ? (
          <div className="text-center py-6 typo-caption text-slate-400">
            도출된 바이그램 요약 정보가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {bigramSummary.map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-600 border border-red-200/60">
                      <span>{item.pair}</span>
                    </span>
                    <span className="typo-caption font-semibold text-slate-600">
                      동시 출현 {item.frequency}회
                    </span>
                  </div>

                  <p className="typo-sub text-slate-700 leading-relaxed mt-2">
                    {item.insight}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between typo-caption text-slate-400">
                  <span>연관 결합도</span>
                  <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-red-600 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(30, item.frequency * 20))}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
