"use client";

import React, { useState, useEffect } from 'react';
import { CheckIcon } from './icons/CheckIcon';

interface Event {
  type: string;
  visitor: string;
  timestamp: string;
  metadata: string;
}

interface TestSurfaceTagProps {
  defaultExpanded?: boolean;
  tagId?: string;
}

export function TestSurfaceTag({ defaultExpanded = false, tagId }: TestSurfaceTagProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  // Update isExpanded when defaultExpanded changes
  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  // Fetch events from the API, filtering by tagId if provided
  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Add tagId to the query params if provided
      const url = tagId ? `/api/analytics/track?tagId=${encodeURIComponent(tagId)}` : '/api/analytics/track';
      const response = await fetch(url);
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and polling setup when component is expanded
  useEffect(() => {
    if (isExpanded) {
      fetchEvents();
      
      // Poll for new events every 5 seconds
      const interval = setInterval(fetchEvents, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isExpanded]);

  // Format timestamp to a readable format
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Parse metadata to display it properly
  const parseMetadata = (metadataStr: string) => {
    try {
      return JSON.parse(metadataStr);
    } catch (e) {
      return metadataStr;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
      <div 
        className="p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
            <CheckIcon className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Test Surface Tag events</h2>
            <p className="text-gray-600">See your events as they are tracked in real-time.</p>
          </div>
        </div>
        <div>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(true);
            fetchEvents();
          }}
        >
          View events
        </button>
        </div>
        
      </div>
      
      {isExpanded && (
        <div className="p-6 border-t border-gray-200">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-md font-medium text-gray-900">Recent Events</h3>
            <button 
              onClick={fetchEvents}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh events'}
            </button>
          </div>
          
          {loading && events.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div className="text-center p-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
              <p>No events detected yet.</p>
              <p className="text-sm mt-1">
                Try adding the Surface Tag script to your website and interacting with the page to generate events.
              </p>
              <p className="text-sm mt-2">
                Once the script is installed and users interact with your website, events will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metadata</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.visitor.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <pre className="whitespace-pre-wrap break-words max-w-xs">
                          {JSON.stringify(parseMetadata(event.metadata), null, 2)}
                        </pre>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTimestamp(event.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="mt-6 text-sm text-gray-500">
            <p>
              Events are tracked in real-time. Interactions on your website will appear here
              once the Surface Tag script is properly installed and users interact with your pages.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 