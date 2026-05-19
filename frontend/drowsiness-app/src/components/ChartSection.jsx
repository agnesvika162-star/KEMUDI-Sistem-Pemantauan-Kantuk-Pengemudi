// ChartSection.jsx
import { useEffect, useState, useRef } from "react";

// ─── Helpers ───────────────────────────────────────────────────────────────

function calcP90(values) {
  if (!values.length) return 10;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.floor(sorted.length * 0.9);
  return sorted[Math.min(idx, sorted.length - 1)];
}

function niceMax(val) {
  if (val <= 0) return 10;
  const mag = Math.pow(10, Math.floor(Math.log10(val)));
  return Math.ceil(val / mag) * mag;
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function formatDateFull(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Konstanta SVG ─────────────────────────────────────────────────────────

const SVG_W = 600;
const SVG_H = 200;
const PAD = { l: 20, r: 20, t: 24, b: 28 };
const CHART_W = SVG_W - PAD.l - PAD.r;
const CHART_H = SVG_H - PAD.t - PAD.b;
const Y_STEPS = 5;

// ─── Component ──────────────────────────────────────────────────────────────

export default function ChartSection() {
  const [fullData, setFullData] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [tooltip, setTooltip] = useState(null); // { item, isAnomaly, x, y }
  const svgWrapRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:8000/chart-data")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFullData(data);
          setStartIndex(Math.max(0, data.length - 7));
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // ─── Data slice & cap ──────────────────────────────────────────────────

  const visible = fullData.slice(startIndex, startIndex + 7);
  const values = visible.map((d) => Number(d.value));
  const cap = 100;
  const hasAnomalies = values.some((v) => v > cap);

  // ─── Koordinat helpers ─────────────────────────────────────────────────

  const xPos = (i) =>
    PAD.l +
    (visible.length > 1 ? (i / (visible.length - 1)) * CHART_W : CHART_W / 2);

  const yPos = (val) =>
    PAD.t + CHART_H - (Math.min(val, cap) / cap) * CHART_H;

  // ─── SVG path helpers ──────────────────────────────────────────────────

  function buildSmoothPath(points) {
    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const cx = (points[i - 1].x + points[i].x) / 2;
      d += ` C ${cx} ${points[i - 1].y} ${cx} ${points[i].y} ${points[i].x} ${points[i].y}`;
    }
    return d;
  }

  const chartPoints = visible.map((item, i) => ({
    x: xPos(i),
    y: yPos(Number(item.value)),
  }));

  const linePath = buildSmoothPath(chartPoints);

  const areaPath =
    chartPoints.length > 1
      ? `M ${chartPoints[0].x} ${PAD.t + CHART_H} ` +
        `L ${chartPoints[0].x} ${chartPoints[0].y} ` +
        linePath.replace(/^M \S+ \S+ /, "") +
        ` L ${chartPoints[chartPoints.length - 1].x} ${PAD.t + CHART_H} Z`
      : "";

  // ─── Tooltip handlers ─────────────────────────────────────────────────

  function handleNodeEnter(e, item, isAnomaly, svgX, svgY) {
    if (!svgWrapRef.current) return;
    const wrap = svgWrapRef.current;
    const svgEl = wrap.querySelector("svg");
    const svgRect = svgEl.getBoundingClientRect();
    const scaleX = svgRect.width / SVG_W;
    const scaleY = svgRect.height / SVG_H;

    let left = svgX * scaleX + 14;
    let top = svgY * scaleY - 56;
    if (left + 150 > wrap.clientWidth) left = svgX * scaleX - 160;
    if (top < 0) top = svgY * scaleY + 16;

    setTooltip({ item, isAnomaly, left, top });
  }

  function handleNodeLeave() {
    setTooltip(null);
  }

  // ─── Navigation ────────────────────────────────────────────────────────

  const canPrev = startIndex > 0;
  const canNext = startIndex + 7 < fullData.length;

  const navPrev = () => {
    if (canPrev) setStartIndex((i) => i - 1);
  };
  const navNext = () => {
    if (canNext) setStartIndex((i) => i + 1);
  };

  // ─── Y-axis ticks ─────────────────────────────────────────────────────
    const yTicks = [100, 80, 60, 40, 20, 0];

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-medium text-gray-800">
          Grafik Frekuensi Kantuk
        </h2>
        {hasAnomalies && (
          <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-0.5">
            ⚠ Ada anomali
          </span>
        )}
      </div>

      <p className="text-xs text-gray-400 mb-3 ml-9">Frekuensi (kali)</p>

      {/* Chart area */}
      <div className="flex gap-0 h-[220px] relative">

        {/* Y-axis */}
        <div className="w-9 flex-shrink-0 flex flex-col justify-between pb-7">
          {yTicks.map((tick, i) => (
            <span key={i} className="text-[10px] text-gray-400 text-right leading-none">
              {tick}
            </span>
          ))}
        </div>

        {/* SVG */}
        <div className="flex-1 relative" ref={svgWrapRef}>
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            preserveAspectRatio="none"
            className="w-full h-full overflow-visible"
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {Array.from({ length: Y_STEPS + 1 }, (_, i) => {
              const y = PAD.t + (i / Y_STEPS) * CHART_H;
              return (
                <line
                  key={i}
                  x1={PAD.l} y1={y}
                  x2={SVG_W - PAD.r} y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />
              );
            })}

            {/* Area */}
            {areaPath && (
              <path d={areaPath} fill="url(#areaGrad)" stroke="none" />
            )}

            {/* Line */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Nodes */}
            {visible.map((item, i) => {
              const val = Number(item.value);
              const isAnomaly = val > cap;
              const cx = xPos(i);
              const cy = isAnomaly ? PAD.t + 10 : yPos(val);

              return (
                <g key={item.date}>
                  {/* Dashed drop line untuk anomali */}
                  {isAnomaly && (
                    <line
                      x1={cx} y1={PAD.t + 16}
                      x2={cx} y2={PAD.t + CHART_H}
                      stroke="#F59E0B"
                      strokeWidth="1"
                      strokeDasharray="3,3"
                    />
                  )}

                  {/* Triangle indicator untuk anomali */}
                  {isAnomaly && (
                    <>
                      <polygon
                        points={`${cx},${PAD.t} ${cx - 7},${PAD.t + 14} ${cx + 7},${PAD.t + 14}`}
                        fill="#F59E0B"
                        opacity="0.9"
                      />
                      <text
                        x={cx} y={PAD.t + 11}
                        textAnchor="middle"
                        fontSize="8"
                        fill="white"
                        fontWeight="700"
                      >
                        !
                      </text>
                    </>
                  )}

                  {/* Node circle */}
                  <circle
                    cx={cx} cy={cy} r={7}
                    fill={isAnomaly ? "#FEF3C7" : "white"}
                    stroke={isAnomaly ? "#F59E0B" : "#3B82F6"}
                    strokeWidth="2"
                  />
                  <circle
                    cx={cx} cy={cy} r={3}
                    fill={isAnomaly ? "#F59E0B" : "#3B82F6"}
                  />

                  {/* Hit area */}
                  <circle
                    cx={cx} cy={cy} r={16}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={(e) => handleNodeEnter(e, item, isAnomaly, cx, cy)}
                    onMouseLeave={handleNodeLeave}
                  />

                  {/* X-axis label */}
                  <text
                    x={cx} y={SVG_H - 8}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#94A3B8"
                  >
                    {formatDateShort(item.date)}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute pointer-events-none bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg text-xs z-10 whitespace-nowrap"
              style={{ left: tooltip.left, top: tooltip.top }}
            >
              <div className="text-gray-400 mb-0.5">
                {formatDateFull(tooltip.item.date)}
              </div>
              <div
                className={`text-sm font-medium ${
                  tooltip.isAnomaly ? "text-amber-600" : "text-blue-600"
                }`}
              >
                {tooltip.item.value} kali
              </div>
              {tooltip.isAnomaly && (
                <div className="mt-1 text-[10px] bg-amber-50 text-amber-700 rounded px-1.5 py-0.5 inline-block">
                  Di atas batas normal (P90: {cap})
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cap note */}
      {hasAnomalies && (
        <p className="text-[10px] text-gray-400 mt-1.5 ml-9">
          Batas grafik: {cap} kali (P90). Node oranye menandai nilai di atas batas.
        </p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={navPrev}
          disabled={!canPrev}
          className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ←
        </button>
        <span className="text-xs text-gray-400">
          {visible.length > 0
            ? `${formatDateFull(visible[0].date)} – ${formatDateFull(visible[visible.length - 1].date)}`
            : "–"}
        </span>
        <button
          onClick={navNext}
          disabled={!canNext}
          className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          →
        </button>
      </div>
    </div>
  );
}