import * as React from "react";
import { Link } from "react-router-dom";
import { LineChart } from "../../components";
import {
  CubeIcon,
  ChartBarIcon,
  ArrowsRightLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CircleStackIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

/**
 * Generates chart data for homepage activity chart
 */
const generateChartData = () => {
  const labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
  const transactionData = Array.from(
    { length: 30 },
    () => Math.floor(Math.random() * 5000) + 1000
  );
  const blockData = Array.from(
    { length: 30 },
    () => Math.floor(Math.random() * 500) + 100
  );

  return {
    labels,
    datasets: [
      {
        label: "Transactions",
        data: transactionData,
        borderColor: "#8C30F5", // Selendra primary purple
        backgroundColor: "rgba(140, 48, 245, 0.2)", // With opacity
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
      {
        label: "Blocks",
        data: blockData,
        borderColor: "#0CCBD6", // Selendra accent teal
        backgroundColor: "rgba(12, 203, 214, 0.2)", // With opacity
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
    ],
  };
}

const Home: React.FC = () => {
  return (
    <div className="page home-page">
      <div className="container">
      </div>
    </div>
  );
}

export default Home;