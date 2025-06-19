import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface ModernBarChartProps {
  data: ChartData[];
  dataKey?: string;
  color?: string;
  height?: number;
  formatValue?: (value: number) => string;
}

interface ModernPieChartProps {
  data: ChartData[];
  colors?: string[];
  height?: number;
}

interface ModernAreaChartProps {
  data: ChartData[];
  dataKey?: string;
  color?: string;
  height?: number;
  gradient?: boolean;
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

const CustomTooltip = ({ active, payload, label, formatValue = defaultFormatValue }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${formatValue(entry.value)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const ModernBarChart: React.FC<ModernBarChartProps> = ({
  data,
  dataKey = "value",
  color = "#8C30F5",
  height = 300,
  formatValue = defaultFormatValue,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
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
        <Tooltip content={<CustomTooltip formatValue={formatValue} />} />
        <Bar 
          dataKey={dataKey} 
          fill={color}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const ModernPieChart: React.FC<ModernPieChartProps> = ({
  data,
  colors = ["#8C30F5", "#0CCBD6", "#FF6B6B", "#4CAF50", "#FFA726"],
  height = 300,
}) => {
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const ModernAreaChart: React.FC<ModernAreaChartProps> = ({
  data,
  dataKey = "value",
  color = "#8C30F5",
  height = 300,
  gradient = true,
}) => {
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={color} stopOpacity={0.05}/>
          </linearGradient>
        </defs>
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
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 12,
            fill: "currentColor",
            className: "fill-gray-600 dark:fill-gray-400",
          }}
          tickFormatter={defaultFormatValue}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fillOpacity={1}
          fill={gradient ? `url(#${gradientId})` : color}
          dot={false}
          activeDot={{
            r: 4,
            stroke: color,
            strokeWidth: 2,
            fill: "white",
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
