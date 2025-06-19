import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface ChartData {
  name: string;
  value: number;
  timestamp?: string;
}

interface ModernLineChartProps {
  data: ChartData[];
  dataKey?: string;
  color?: string;
  height?: number;
  showArea?: boolean;
  strokeWidth?: number;
  animated?: boolean;
  formatValue?: (value: number) => string;
  formatLabel?: (label: string) => string;
}

const defaultFormatValue = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  } else {
    return value.toLocaleString();
  }
};

const ModernLineChart: React.FC<ModernLineChartProps> = ({
  data,
  dataKey = "value",
  color = "#8C30F5",
  height = 250,
  showArea = true,
  strokeWidth = 2,
  animated = true,
  formatValue = defaultFormatValue,
  formatLabel,
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatLabel ? formatLabel(label) : label}
          </p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            {`${payload[0].name}: ${formatValue(payload[0].value)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const ChartComponent = showArea ? AreaChart : LineChart;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent
        data={data}
        margin={{
          top: 10,
          right: 10,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="currentColor"
          className="opacity-20 dark:opacity-30"
        />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 12,
            fill: "currentColor",
            className: "fill-gray-600 dark:fill-gray-400",
          }}
          tickFormatter={formatLabel}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 12,
            fill: "currentColor",
            className: "fill-gray-600 dark:fill-gray-400",
          }}
          tickFormatter={formatValue}
        />
        <Tooltip content={<CustomTooltip />} />
        
        {showArea ? (
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={strokeWidth}
            fill={color}
            fillOpacity={0.1}
            dot={false}
            activeDot={{
              r: 4,
              stroke: color,
              strokeWidth: 2,
              fill: "white",
            }}
            animationDuration={animated ? 1500 : 0}
          />
        ) : (
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={strokeWidth}
            dot={false}
            activeDot={{
              r: 4,
              stroke: color,
              strokeWidth: 2,
              fill: "white",
            }}
            animationDuration={animated ? 1500 : 0}
          />
        )}
      </ChartComponent>
    </ResponsiveContainer>
  );
};

export default ModernLineChart;
