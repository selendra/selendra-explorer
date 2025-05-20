import React, { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../../contexts/ThemeContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineChartProps {
  data: ChartData<'line'>;
  options?: ChartOptions<'line'>;
  title?: string;
  height?: number;
  className?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  options,
  title,
  height = 300,
  className = '',
}) => {
  const { theme } = useTheme();
  const chartRef = useRef<ChartJS<'line'>>(null);
  
  // Update chart colors based on theme
  useEffect(() => {
    if (chartRef.current) {
      const isDark = theme === 'dark';
      
      // Update grid lines
      chartRef.current.options.scales = {
        ...chartRef.current.options.scales,
        x: {
          ...chartRef.current.options.scales?.x,
          grid: {
            ...chartRef.current.options.scales?.x?.grid,
            color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            ...chartRef.current.options.scales?.x?.ticks,
            color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
          },
        },
        y: {
          ...chartRef.current.options.scales?.y,
          grid: {
            ...chartRef.current.options.scales?.y?.grid,
            color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            ...chartRef.current.options.scales?.y?.ticks,
            color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
          },
        },
      };
      
      // Update title
      if (chartRef.current.options.plugins?.title?.text) {
        chartRef.current.options.plugins.title = {
          ...chartRef.current.options.plugins.title,
          color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        };
      }
      
      // Update legend
      if (chartRef.current.options.plugins?.legend) {
        chartRef.current.options.plugins.legend = {
          ...chartRef.current.options.plugins.legend,
          labels: {
            ...chartRef.current.options.plugins.legend.labels,
            color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
          },
        };
      }
      
      chartRef.current.update();
    }
  }, [theme]);
  
  // Default options
  const defaultOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: theme === 'dark' ? 'rgba(50, 50, 50, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        bodyColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
        borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
        },
      },
      y: {
        grid: {
          display: true,
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
        },
        beginAtZero: true,
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };
  
  // Merge default options with provided options
  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };
  
  return (
    <div className={`card ${className}`}>
      <div style={{ height }}>
        <Line ref={chartRef} data={data} options={mergedOptions} />
      </div>
    </div>
  );
};

export default LineChart;
