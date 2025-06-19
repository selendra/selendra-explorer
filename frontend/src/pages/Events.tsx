import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  SparklesIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { formatDistance } from 'date-fns';
import { useSubstrateEvents } from '../contexts/ApiContext';
import Pagination from '../components/ui/Pagination';

const Events: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const pageSize = 20;
  
  const { data, isLoading, error } = useSubstrateEvents(page, pageSize);
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;
  
  // Get unique modules for filtering
  const modules = data ? Array.from(new Set(data.items.map(event => event.module))).sort() : [];
  
  // Filter events based on selected module
  const filteredEvents = data?.items.filter(event => {
    if (selectedModule && event.module !== selectedModule) return false;
    return true;
  }) || [];

  // Helper to parse event name and method from the event string
  const parseEventInfo = (eventString: string) => {
    // Example: "System::ExtrinsicSuccess (weight: 284906000, class: DispatchClass::Mandatory)"
    const parts = eventString.split('::');
    if (parts.length >= 2) {
      const module = parts[0];
      const rest = parts[1];
      const methodMatch = rest.match(/^([^(]+)/);
      const method = methodMatch ? methodMatch[1].trim() : rest;
      return { module, method };
    }
    return { module: 'Unknown', method: eventString };
  };

  // Helper to get event status/type icon
  const getEventIcon = (eventString: string) => {
    if (eventString.includes('Success')) {
      return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
    } else if (eventString.includes('Error') || eventString.includes('Failed')) {
      return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
    }
    return <SparklesIcon className="h-4 w-4 text-blue-500" />;
  };

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Error Loading Events</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <SparklesIcon className="h-8 w-8 mr-3 text-primary-500 dark:text-primary-400" />
            Substrate Events
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View and explore Substrate events on the Selendra blockchain
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button className="flex items-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <ArrowPathIcon className="h-4 w-4 mr-1.5" />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1.5" />
            Filters
          </button>
        </div>
      </div>
      
      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Module
            </label>
            <select
              value={selectedModule || ''}
              onChange={(e) => setSelectedModule(e.target.value || null)}
              className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm w-40"
            >
              <option value="">All Modules</option>
              {modules.map(module => (
                <option key={module} value={module}>{module}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Events Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Event
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Block
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Age
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Module
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Phase
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                // Loading state
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </td>
                  </tr>
                ))
              ) : filteredEvents.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      <SparklesIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No events found</p>
                      <p className="text-sm">Try adjusting your filters or check back later.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => {
                  const { method } = parseEventInfo(event.event);
                  const eventKey = `${event.block_number}-${event.event_index}`;
                  
                  return (
                    <tr key={eventKey} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getEventIcon(event.event)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {method}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              Index: {event.event_index}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/blocks/${event.block_number}`}
                          className="text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          {event.block_number.toLocaleString()}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1 opacity-60" />
                          {formatDistance(new Date(event.timestamp), new Date(), { addSuffix: true })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {event.module}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {event.phase}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                          {event.data && event.data !== '[]' ? (
                            <pre className="whitespace-pre-wrap break-words">{event.data}</pre>
                          ) : (
                            <span className="italic">No data</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {data && data.totalCount > pageSize && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{((page - 1) * pageSize) + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(page * pageSize, data.totalCount)}</span> of{' '}
                  <span className="font-medium">{data.totalCount.toLocaleString()}</span> events
                </p>
              </div>
              <div>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
