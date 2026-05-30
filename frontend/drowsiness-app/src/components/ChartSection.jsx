import { useEffect, useState, useRef } from "react";
import { getAccessToken } from "../utils/auth";

// ─── Helpers ───────────────────────────────────────────────────────────────

function parseDate(dateStr) {
  if (!dateStr) return new Date();

  // format: 2026-05-06
  if (dateStr.includes("-")) {
    return new Date(dateStr);
  }

  // format: 20 May 2026
  return new Date(Date.parse(dateStr));
}

function formatDateShort(dateStr) {
  const d = parseDate(dateStr);

  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

function formatDateFull(dateStr) {
  const d = parseDate(dateStr);

  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Konstanta SVG ─────────────────────────────────────────────────────────

const SVG_W = 600;
const SVG_H = 260;
const PAD = { l: 20, r: 20, t: 24, b: 28 };
const CHART_W = SVG_W - PAD.l - PAD.r;
const CHART_H = SVG_H - PAD.t - PAD.b;
const Y_STEPS = 5;
const ITEMS_PER_PAGE = 7;

// MAX Y AXIS
const MAX_Y = 100;

// ─── Component ──────────────────────────────────────────────────────────────

export default function ChartSection() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [fullData, setFullData] = useState([]);
  const [tooltip, setTooltip] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const svgWrapRef = useRef(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/dashboard-history`,{
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // urutkan berdasarkan tanggal lama -> baru
          const sorted = [...data].sort(
            (a, b) => parseDate(a.tanggal) - parseDate(b.tanggal),
          );

          setFullData(sorted);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // ─── Pagination ─────────────────────────────────────────────────────────

  const totalPages = Math.ceil(fullData.length / ITEMS_PER_PAGE);

  const startIndex = Math.max(
    fullData.length - currentPage * ITEMS_PER_PAGE,
    0,
  );

  const endIndex = fullData.length - (currentPage - 1) * ITEMS_PER_PAGE;

  const visible = fullData.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // ─── Data ───────────────────────────────────────────────────────────────

  const values = visible.map((d) => Number(d.frekuensi || 0));

  // FIXED MAX 100
  const cap = MAX_Y;

  // anomaly jika > 100
  const hasAnomalies = values.some((v) => v > MAX_Y);

  // ─── Koordinat helpers ─────────────────────────────────────────────────

  const xPos = (i) =>
    PAD.l +
    (visible.length > 1 ? (i / (visible.length - 1)) * CHART_W : CHART_W / 2);

  const yPos = (val) => {
    const capped = Math.min(val, MAX_Y);

    let scaled;
    if (capped <= 60) {
      scaled = (capped / 60) * 80;
    } else {
      scaled = 80 + ((capped - 60) / 40) * 20;
    }

    return PAD.t + CHART_H - (scaled / 100) * CHART_H;
  };

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
    y: yPos(Number(item.frekuensi || 0)),
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

  function handleNodeEnter(item, isAnomaly, svgX, svgY) {
    if (!svgWrapRef.current) return;

    const wrap = svgWrapRef.current;
    const svgEl = wrap.querySelector("svg");
    const svgRect = svgEl.getBoundingClientRect();

    const scaleX = svgRect.width / SVG_W;
    const scaleY = svgRect.height / SVG_H;

    let left = svgX * scaleX + 14;
    let top = svgY * scaleY - 56;

    if (left + 150 > wrap.clientWidth) {
      left = svgX * scaleX - 160;
    }

    if (top < 0) {
      top = svgY * scaleY + 16;
    }

    setTooltip({
      item,
      isAnomaly,
      left,
      top,
    });
  }

  function handleNodeLeave() {
    setTooltip(null);
  }

  // ─── Y-axis ticks ─────────────────────────────────────────────────────

  const yTicks = [100, 80, 60, 40, 20, 0];

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm md:text-base font-medium text-gray-800">
          Grafik Frekuensi Kantuk
        </h2>

        {hasAnomalies && (
          <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-0.5">
            ⚠ Ada anomali
          </span>
        )}
      </div>

      <p className="text-[10px] md:text-xs text-gray-400 mb-2 md:mb-3 ml-7 md:ml-9">
        Frekuensi (kali)
      </p>

      {/* Chart area */}
      <div className="flex gap-0 h-[220px] sm:h-[260px] md:h-[300px] relative">
        {/* Y-axis */}
        <div className="w-7 md:w-9 flex-shrink-0 flex flex-col justify-between pb-7">
          {yTicks.map((tick, i) => (
            <span
              key={i}
              className="text-[8px] md:text-[10px] text-gray-400 text-right leading-none"
            >
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
                  x1={PAD.l}
                  y1={y}
                  x2={SVG_W - PAD.r}
                  y2={y}
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
              const val = Number(item.frekuensi || 0);

              const isAnomaly = val > MAX_Y;

              const cx = xPos(i);

              const cy = isAnomaly ? PAD.t + 10 : yPos(val);

              return (
                <g key={`${item.tanggal}-${i}`}>
                  {/* Dashed line anomaly */}
                  {isAnomaly && (
                    <line
                      x1={cx}
                      y1={PAD.t + 16}
                      x2={cx}
                      y2={PAD.t + CHART_H}
                      stroke="#F59E0B"
                      strokeWidth="1"
                      strokeDasharray="3,3"
                    />
                  )}

                  {/* Triangle */}
                  {isAnomaly && (
                    <>
                      <polygon
                        points={`${cx},${PAD.t} ${cx - 7},${
                          PAD.t + 14
                        } ${cx + 7},${PAD.t + 14}`}
                        fill="#F59E0B"
                        opacity="0.9"
                      />

                      <text
                        x={cx}
                        y={PAD.t + 11}
                        textAnchor="middle"
                        fontSize="8"
                        fill="white"
                        fontWeight="700"
                      >
                        !
                      </text>
                    </>
                  )}

                  {/* Node */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={7}
                    fill={isAnomaly ? "#FEF3C7" : "white"}
                    stroke={isAnomaly ? "#F59E0B" : "#3B82F6"}
                    strokeWidth="2"
                  />

                  <circle
                    cx={cx}
                    cy={cy}
                    r={3}
                    fill={isAnomaly ? "#F59E0B" : "#3B82F6"}
                  />

                  {/* Hit area */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={16}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() =>
                      handleNodeEnter(item, isAnomaly, cx, cy)
                    }
                    onMouseLeave={handleNodeLeave}
                  />

                  {/* X-axis label */}
                  <text
                    x={cx}
                    y={SVG_H - 8}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#94A3B8"
                  >
                    {formatDateShort(item.tanggal)}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute pointer-events-none bg-white border border-gray-200 rounded-xl px-2 md:px-3 py-2 shadow-lg text-[10px] md:text-xs z-10 whitespace-nowrap max-w-[160px]"
              style={{
                left: tooltip.left,
                top: tooltip.top,
              }}
            >
              <div className="text-gray-400 mb-0.5">
                {formatDateFull(tooltip.item.tanggal)}
              </div>

              <div
                className={`text-xs md:text-sm font-medium ${
                  tooltip.isAnomaly ? "text-amber-600" : "text-blue-600"
                }`}
              >
                {tooltip.item.frekuensi} kali
              </div>

              <div className="mt-1 text-[10px] text-gray-500">
                Status: {tooltip.item.status}
              </div>

              <div className="text-[10px] text-gray-500">
                Durasi: {tooltip.item.durasi}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={handlePrevPage}
          disabled={currentPage >= totalPages}
          className="text-[10px] md:text-xs text-gray-500 border border-gray-200 rounded-lg px-2 md:px-3 py-1 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ←
        </button>

        <span className="text-[10px] md:text-xs text-gray-400 text-center">
          {visible.length > 0
            ? `${formatDateFull(visible[0].tanggal)} – ${formatDateFull(
                visible[visible.length - 1].tanggal,
              )}`
            : "–"}
        </span>

        <button
          onClick={handleNextPage}
          disabled={currentPage === 1}
          className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          →
        </button>
      </div>
    </div>
  );
}