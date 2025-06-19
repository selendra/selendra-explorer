import React, { useState, useEffect, useMemo, useCallback } from "react";

/**
 * Props for the LineChart component
 */
interface LineChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      tension?: number;
      pointRadius?: number;
      pointHoverRadius?: number;
    }[];
  };
  height?: number;
  animated?: boolean;
  options?: {
    scales?: Record<string, unknown>;
    plugins?: Record<string, unknown>;
    [key: string]: unknown;
  }; // Optional chart configuration options
}

/**
 * LineChart component that renders a line chart based on the provided data
 * Supports animation and hover interactions
 *
 * This component is optimized with useMemo and useCallback to prevent
 * unnecessary calculations and re-renders.
 */
const LineChart: React.FC<LineChartProps> = React.memo(
  ({
    data,
    height = 300,
    animated = true,
  }) => {
    const [isVisible, setIsVisible] = useState(!animated);
    const [hoveredPoint, setHoveredPoint] = useState<{
      datasetIndex: number;
      pointIndex: number;
    } | null>(null);

    // For animation
    useEffect(() => {
      if (animated) {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 300);
        return () => clearTimeout(timer);
      }
    }, [animated]);

    // Memoize data processing to avoid recalculation on every render
    const { scaledMax, scaledMin } = useMemo(() => {
      // Calculate max and min values for scaling
      const maxValue = Math.max(
        ...data.datasets.flatMap((dataset) => dataset.data)
      );
      const minValue = Math.min(
        ...data.datasets.flatMap((dataset) => dataset.data)
      );
      // Add padding to the range
      const range = maxValue - minValue;
      const scaledMax = maxValue + range * 0.15; // Increased padding at the top
      const scaledMin = Math.max(0, minValue - range * 0.05);

      return { scaledMax, scaledMin };
    }, [data.datasets]);

    // Format number for tooltip, memoized to prevent recreation on each render
    const formatNumber = useCallback((num: number) => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K";
      } else {
        return num.toFixed(1);
      }
    }, []);

    // Calculate point Y position - memoized to prevent recreation
    const getPointCoordinates = useCallback(
      (value: number): number => {
        return 100 - ((value - scaledMin) / (scaledMax - scaledMin)) * 100;
      },
      [scaledMax, scaledMin]
    );

    // Memoize x-axis labels that should be shown
    const xAxisLabels = useMemo(
      () => [
        0,
        Math.floor(data.labels.length / 4),
        Math.floor(data.labels.length / 2),
        Math.floor((data.labels.length * 3) / 4),
        data.labels.length - 1,
      ],
      [data.labels.length]
    );

    return (
      <div className="relative w-full" style={{ height: `${height}px` }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between py-6 text-xs text-gray-600 dark:text-gray-400 font-medium">
          <div className="text-right pr-2">{formatNumber(scaledMax)}</div>
          <div className="text-right pr-2">{formatNumber((scaledMax + scaledMin) / 2)}</div>
          <div className="text-right pr-2">{formatNumber(scaledMin)}</div>
        </div>

        {/* Chart area */}
        <div className="absolute left-12 right-0 top-0 bottom-0">
          {/* Grid lines */}
          <div className="absolute inset-0 border-l border-gray-200/50 dark:border-gray-700/50">
            <div className="absolute left-0 right-0 top-0 h-px bg-gray-100/60 dark:bg-gray-800/60"></div>
            <div className="absolute left-0 right-0 top-1/4 h-px bg-gray-100/40 dark:bg-gray-800/40"></div>
            <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-100/60 dark:bg-gray-800/60"></div>
            <div className="absolute left-0 right-0 top-3/4 h-px bg-gray-100/40 dark:bg-gray-800/40"></div>
            <div className="absolute left-0 right-0 bottom-0 h-px bg-gray-200/80 dark:bg-gray-700/80"></div>
          </div>

          {/* Chart */}
          <div className="relative inset-0 h-full">
            {data.datasets.map((dataset, datasetIndex) => (
              <div key={datasetIndex} className="absolute inset-0">
                <svg
                  className="w-full h-full"
                  viewBox={`0 0 ${data.labels.length - 1} 100`}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id={`gradient-${datasetIndex}`}
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        stopColor={dataset.borderColor}
                        stopOpacity="0.25"
                      />
                      <stop
                        offset="100%"
                        stopColor={dataset.borderColor}
                        stopOpacity="0.02"
                      />
                    </linearGradient>
                  </defs>

                  {/* Create smooth line path */}
                  {isVisible && (
                    <>
                      {/* Area under line */}
                      <path
                        d={`
                        M 0 ${getPointCoordinates(dataset.data[0])}
                        ${dataset.data
                          .map((value, i) => {
                            const x = i;
                            const y = getPointCoordinates(value);

                            if (i === 0) return "";

                            // Calculate control points for smooth curve
                            const prevX = i - 1;
                            const prevY = getPointCoordinates(
                              dataset.data[i - 1]
                            );

                            // Calculate control points for cubic bezier curve
                            const cpx1 = prevX + (x - prevX) / 3;
                            const cpy1 = prevY;
                            const cpx2 = x - (x - prevX) / 3;
                            const cpy2 = y;

                            return `C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${x} ${y}`;
                          })
                          .join(" ")}
                        L ${data.labels.length - 1} 100
                        L 0 100
                        Z
                      `}
                        fill={`url(#gradient-${datasetIndex})`}
                        stroke="none"
                        className={`transition-all duration-1500 ${
                          isVisible ? "opacity-100" : "opacity-0"
                        }`}
                      />

                      {/* Line */}
                      <path
                        d={`
                        M 0 ${getPointCoordinates(dataset.data[0])}
                        ${dataset.data
                          .map((value, i) => {
                            const x = i;
                            const y = getPointCoordinates(value);

                            if (i === 0) return "";

                            // Calculate control points for smooth curve
                            const prevX = i - 1;
                            const prevY = getPointCoordinates(
                              dataset.data[i - 1]
                            );

                            // Calculate control points for cubic bezier curve
                            const cpx1 = prevX + (x - prevX) / 3;
                            const cpy1 = prevY;
                            const cpx2 = x - (x - prevX) / 3;
                            const cpy2 = y;

                            return `C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${x} ${y}`;
                          })
                          .join(" ")}
                      `}
                        fill="none"
                        stroke={dataset.borderColor}
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-all duration-1500 ${
                          isVisible ? "opacity-100" : "opacity-0"
                        }`}
                        style={{
                          strokeDasharray: animated ? "1000" : "0",
                          strokeDashoffset: isVisible ? "0" : "1000",
                          transition:
                            "stroke-dashoffset 2s ease-in-out, opacity 0.8s ease-in-out",
                        }}
                      />

                      {/* Data points */}
                      {dataset.data.map((value, i) => {
                        const isHovered =
                          hoveredPoint &&
                          hoveredPoint.datasetIndex === datasetIndex &&
                          hoveredPoint.pointIndex === i;

                        const pointRadius = isHovered ? 3 : 0;
                        const y = getPointCoordinates(value);

                        return (
                          <g key={i} className={isVisible ? "opacity-100" : "opacity-0"} style={{ transition: "opacity 1.5s ease-in-out" }}>
                            <circle
                              cx={i}
                              cy={y}
                              r={pointRadius}
                              fill="white"
                              stroke={dataset.borderColor}
                              strokeWidth="1"
                              className="transition-all duration-200 drop-shadow-sm"
                              opacity={isHovered ? 1 : 0}
                            />
                            {isHovered && (
                              <g>
                                {/* Tooltip background */}
                                <rect
                                  x={i - 25}
                                  y={y - 32}
                                  width="50"
                                  height="22"
                                  rx="6"
                                  fill="rgba(0,0,0,0.85)"
                                  className="transition-all duration-200 drop-shadow-lg"
                                />
                                {/* Tooltip text */}
                                <text
                                  x={i}
                                  y={y - 16}
                                  textAnchor="middle"
                                  fill="white"
                                  fontSize="10"
                                  fontWeight="200"
                                  className="transition-all duration-200"
                                >
                                  {formatNumber(value)}
                                </text>
                              </g>
                            )}
                          </g>
                        );
                      })}
                    </>
                  )}
                </svg>
              </div>
            ))}
          </div>

          {/* Hover detection overlay */}
          <div
            className="absolute inset-0 z-10"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const xRatio = x / rect.width;
              const pointIndex = Math.min(
                Math.floor(xRatio * data.labels.length),
                data.labels.length - 1
              );

              // Find closest dataset
              const y = e.clientY - rect.top;
              const yRatio = y / rect.height;
              const yValue = scaledMax - yRatio * (scaledMax - scaledMin);

              let closestDatasetIndex = 0;
              let minDist = Number.MAX_VALUE;

              data.datasets.forEach((dataset, index) => {
                const dist = Math.abs(dataset.data[pointIndex] - yValue);
                if (dist < minDist) {
                  minDist = dist;
                  closestDatasetIndex = index;
                }
              });

              setHoveredPoint({
                datasetIndex: closestDatasetIndex,
                pointIndex: pointIndex,
              });
            }}
            onMouseLeave={() => setHoveredPoint(null)}
          />

          {/* X-axis labels */}
          <div className="absolute left-0 right-0 -bottom-6 flex justify-between text-xs text-gray-600 dark:text-gray-400 font-medium">
            {xAxisLabels.map((index) => (
              <div 
                key={index} 
                className="absolute transform -translate-x-1/2" 
                style={{ left: `${(index / (data.labels.length - 1)) * 100}%` }}
              >
                {data.labels[index]}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="absolute top-2 right-2 flex items-center space-x-4 text-sm">
          {data.datasets.map((dataset, index) => (
            <div key={index} className="flex items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md px-2 py-1 shadow-sm">
              <div
                className="w-2.5 h-2.5 rounded-full mr-1.5"
                style={{ backgroundColor: dataset.borderColor }}
              />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {dataset.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

export default LineChart;
