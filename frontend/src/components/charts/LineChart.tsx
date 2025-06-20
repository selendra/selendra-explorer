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
  };
}

/**
 * LineChart component that renders a line chart based on the provided data
 * Supports animation and hover interactions
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
      const allValues = data.datasets.flatMap((dataset) => dataset.data);
      if (allValues.length === 0) {
        return { scaledMax: 100, scaledMin: 0 };
      }
      
      const maxValue = Math.max(...allValues);
      const minValue = Math.min(...allValues);
      
      // Add padding to the range
      const range = maxValue - minValue;
      const scaledMax = maxValue + range * 0.15;
      const scaledMin = Math.max(0, minValue - range * 0.05);

      return { scaledMax, scaledMin };
    }, [data.datasets]);

    // Format number for tooltip
    const formatNumber = useCallback((num: number) => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K";
      } else {
        return num.toFixed(1);
      }
    }, []);

    // Calculate point Y position
    const getPointCoordinates = useCallback(
      (value: number): number => {
        const range = scaledMax - scaledMin;
        if (range === 0) return 50; // Center if no range
        return 100 - ((value - scaledMin) / range) * 100;
      },
      [scaledMax, scaledMin]
    );

    // Memoize x-axis labels that should be shown
    const xAxisLabels = useMemo(() => {
      if (data.labels.length === 0) return [];
      
      const labelCount = Math.min(5, data.labels.length);
      const indices = [];
      
      for (let i = 0; i < labelCount; i++) {
        const index = Math.floor((i * (data.labels.length - 1)) / (labelCount - 1));
        indices.push(index);
      }
      
      return indices;
    }, [data.labels.length]);

    // Handle mouse move for hover detection
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
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
        if (dataset.data[pointIndex] !== undefined) {
          const dist = Math.abs(dataset.data[pointIndex] - yValue);
          if (dist < minDist) {
            minDist = dist;
            closestDatasetIndex = index;
          }
        }
      });

      setHoveredPoint({
        datasetIndex: closestDatasetIndex,
        pointIndex: pointIndex,
      });
    }, [data.datasets, data.labels.length, scaledMax, scaledMin]);

    const handleMouseLeave = useCallback(() => {
      setHoveredPoint(null);
    }, []);

    if (!data.datasets || data.datasets.length === 0 || !data.labels || data.labels.length === 0) {
      return (
        <div className="relative w-full flex items-center justify-center" style={{ height: `${height}px` }}>
          <p className="text-gray-500">No data available</p>
        </div>
      );
    }

    return (
      <div className="relative w-full" style={{ height: `${height}px` }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between py-6 text-xs text-gray-500 dark:text-gray-400 font-medium">
          <div>{formatNumber(scaledMax)}</div>
          <div>{formatNumber((scaledMax + scaledMin) / 2)}</div>
          <div>{formatNumber(scaledMin)}</div>
        </div>

        {/* Chart area */}
        <div className="absolute left-12 right-0 top-0 bottom-0">
          {/* Grid lines */}
          <div className="absolute inset-0 border-l border-gray-200 dark:border-gray-700">
            <div className="absolute left-0 right-0 top-0 h-px bg-gray-100 dark:bg-gray-800"></div>
            <div className="absolute left-0 right-0 top-1/4 h-px bg-gray-100 dark:bg-gray-800"></div>
            <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-100 dark:bg-gray-800"></div>
            <div className="absolute left-0 right-0 top-3/4 h-px bg-gray-100 dark:bg-gray-800"></div>
            <div className="absolute left-0 right-0 bottom-0 h-px bg-gray-100 dark:bg-gray-800"></div>
          </div>

          {/* Chart */}
          <div className="relative inset-0 h-full">
            {data.datasets.map((dataset, datasetIndex) => (
              <div key={datasetIndex} className="absolute inset-0">
                <svg
                  className="w-full h-full"
                  viewBox={`0 0 ${Math.max(1, data.labels.length - 1)} 100`}
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
                        stopOpacity="0.4"
                      />
                      <stop
                        offset="100%"
                        stopColor={dataset.borderColor}
                        stopOpacity="0.05"
                      />
                    </linearGradient>
                    <filter id={`glow-${datasetIndex}`}>
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Create smooth line path */}
                  {isVisible && dataset.data.length > 0 && (
                    <>
                      {/* Area under line */}
                      <path
                        d={(() => {
                          if (dataset.data.length === 0) return "";
                          
                          let path = `M 0 ${getPointCoordinates(dataset.data[0])}`;
                          
                          for (let i = 1; i < dataset.data.length; i++) {
                            const x = (i / Math.max(1, dataset.data.length - 1)) * (data.labels.length - 1);
                            const y = getPointCoordinates(dataset.data[i]);
                            
                            // Simple line for better performance and reliability
                            path += ` L ${x} ${y}`;
                          }
                          
                          path += ` L ${data.labels.length - 1} 100 L 0 100 Z`;
                          return path;
                        })()}
                        fill={`url(#gradient-${datasetIndex})`}
                        stroke="none"
                        className={`transition-all duration-1500 ${
                          isVisible ? "opacity-100" : "opacity-0"
                        }`}
                      />

                      {/* Line */}
                      <path
                        d={(() => {
                          if (dataset.data.length === 0) return "";
                          
                          let path = `M 0 ${getPointCoordinates(dataset.data[0])}`;
                          
                          for (let i = 1; i < dataset.data.length; i++) {
                            const x = (i / Math.max(1, dataset.data.length - 1)) * (data.labels.length - 1);
                            const y = getPointCoordinates(dataset.data[i]);
                            path += ` L ${x} ${y}`;
                          }
                          
                          return path;
                        })()}
                        fill="none"
                        stroke={dataset.borderColor}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter={`url(#glow-${datasetIndex})`}
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

                        const pointRadius = isHovered ? 6 : 0;
                        const x = (i / Math.max(1, dataset.data.length - 1)) * (data.labels.length - 1);
                        const y = getPointCoordinates(value);

                        return (
                          <g key={i} className={isVisible ? "opacity-100" : "opacity-0"} style={{ transition: "opacity 1.5s ease-in-out" }}>
                            <circle
                              cx={x}
                              cy={y}
                              r={pointRadius}
                              fill="white"
                              stroke={dataset.borderColor}
                              strokeWidth="2"
                              filter={`url(#glow-${datasetIndex})`}
                              className="transition-all duration-200"
                              opacity={isHovered ? 1 : i % 5 === 0 ? 0.8 : 0}
                            />
                            {isHovered && (
                              <g>
                                {/* Tooltip background */}
                                <rect
                                  x={x - 30}
                                  y={y - 35}
                                  width="60"
                                  height="25"
                                  rx="4"
                                  fill="rgba(0,0,0,0.75)"
                                  className="transition-all duration-200"
                                />
                                {/* Tooltip text */}
                                <text
                                  x={x}
                                  y={y - 18}
                                  textAnchor="middle"
                                  fill="white"
                                  fontSize="11"
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
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />

          {/* X-axis labels */}
          <div className="absolute left-0 right-0 bottom-0 flex justify-between px-4 pt-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
            {xAxisLabels.map((index) => (
              <div key={index} className="transform -translate-x-1/2" style={{ left: `${(index / Math.max(1, data.labels.length - 1)) * 100}%` }}>
                {data.labels[index]}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="absolute top-0 right-0 flex items-center space-x-6 px-4 text-sm">
          {data.datasets.map((dataset, index) => (
            <div key={index} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
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

LineChart.displayName = 'LineChart';

export default LineChart;