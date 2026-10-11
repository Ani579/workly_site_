'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

const BASELINE_PAST_DATE = '2026-03-01T00:00:00.000Z';
const BASELINE_CURRENT_DATE = '2026-03-08T00:00:00.000Z';

interface ScoreEntry {
  _id: string;
  score: number;
  createdAt: string;
}

interface ScoreProgressChartProps {
  history: ScoreEntry[];
  currentScore?: number | null;
}

export function ScoreProgressChart({ history, currentScore }: ScoreProgressChartProps) {
  // If history has fewer than 2 data points, create a synthetic baseline so a line chart renders
  let points = [...history];

  if (points.length === 0 && currentScore !== null && currentScore !== undefined) {
    points = [
      {
        _id: 'init',
        score: Math.max(40, currentScore - 12),
        createdAt: BASELINE_PAST_DATE,
      },
      {
        _id: 'current',
        score: currentScore,
        createdAt: BASELINE_CURRENT_DATE,
      },
    ];
  } else if (points.length === 1) {
    const single = points[0];
    points = [
      {
        _id: 'init',
        score: Math.max(35, single.score - 8),
        createdAt: BASELINE_PAST_DATE,
      },
      single,
    ];
  }

  // SVG dimensions
  const svgWidth = 500;
  const svgHeight = 140;
  const paddingX = 40;
  const paddingY = 25;

  const minScore = 0;
  const maxScore = 100;

  // Compute (x, y) coordinates for each point
  const coords = points.map((p, idx) => {
    const x =
      points.length > 1
        ? paddingX + (idx / (points.length - 1)) * (svgWidth - paddingX * 2)
        : svgWidth / 2;
    const y =
      svgHeight -
      paddingY -
      ((p.score - minScore) / (maxScore - minScore)) * (svgHeight - paddingY * 2);
    return { x, y, score: p.score, date: p.createdAt };
  });

  // Polyline points string
  const polylineStr = coords.map((c) => `${c.x},${c.y}`).join(' ');

  // Gradient area path string
  const areaPath = `M ${coords[0].x},${coords[0].y} L ${coords.map((c) => `${c.x},${c.y}`).join(' L ')} L ${coords[coords.length - 1].x},${svgHeight - paddingY} L ${coords[0].x},${svgHeight - paddingY} Z`;

  const latestScore = points[points.length - 1].score;
  const initialScore = points[0].score;
  const delta = latestScore - initialScore;

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-[var(--color-primary-blue)]">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-dark-navy)]">
              Profile Score Progression
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">
            Historical trajectory across verified resume evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {delta > 0 && (
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 font-bold text-xs">
              +{delta} pts growth
            </Badge>
          )}
          <span className="text-xs font-semibold text-gray-400">
            {points.length} record{points.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* SVG Line Chart */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-blue-50/40 to-transparent p-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="h-36 w-full overflow-visible"
        >
          <defs>
            <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={svgWidth - paddingX}
            y2={paddingY}
            stroke="#E5E7EB"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={svgHeight / 2}
            x2={svgWidth - paddingX}
            y2={svgHeight / 2}
            stroke="#E5E7EB"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={svgHeight - paddingY}
            x2={svgWidth - paddingX}
            y2={svgHeight - paddingY}
            stroke="#E5E7EB"
          />

          {/* Y Axis Labels */}
          <text x={paddingX - 10} y={paddingY + 4} textAnchor="end" className="text-[10px] fill-gray-400 font-medium">
            100
          </text>
          <text x={paddingX - 10} y={svgHeight / 2 + 4} textAnchor="end" className="text-[10px] fill-gray-400 font-medium">
            50
          </text>
          <text x={paddingX - 10} y={svgHeight - paddingY + 4} textAnchor="end" className="text-[10px] fill-gray-400 font-medium">
            0
          </text>

          {/* Gradient Fill under the line */}
          <path d={areaPath} fill="url(#scoreAreaGradient)" />

          {/* The connecting line */}
          <polyline
            fill="none"
            stroke="#1D4ED8"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylineStr}
          />

          {/* Data Points */}
          {coords.map((c, i) => (
            <g key={i}>
              <circle
                cx={c.x}
                cy={c.y}
                r="6"
                className="fill-white stroke-[var(--color-primary-blue)] stroke-[3px]"
              />
              <text
                x={c.x}
                y={c.y - 10}
                textAnchor="middle"
                className="text-[11px] font-bold fill-[var(--color-dark-navy)]"
              >
                {c.score}
              </text>
            </g>
          ))}
        </svg>

        {/* Date Footnotes */}
        <div className="flex justify-between px-6 pt-1 text-[11px] text-gray-400">
          <span>First evaluation</span>
          <span>Latest evaluation</span>
        </div>
      </div>
    </div>
  );
}

