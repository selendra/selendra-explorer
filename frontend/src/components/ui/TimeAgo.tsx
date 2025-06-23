import React from 'react';
import { formatRelativeTime } from '../../utils';

interface TimeAgoProps {
  timestamp: number;
  className?: string;
}

const TimeAgo: React.FC<TimeAgoProps> = ({ timestamp, className = "" }) => {
  return (
    <span className={`text-gray-500 dark:text-gray-400 ${className}`}>
      {formatRelativeTime(timestamp)}
    </span>
  );
};

export default TimeAgo;