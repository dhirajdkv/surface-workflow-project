"use client";

import React, { useState } from 'react';
import { CheckIcon } from './icons/CheckIcon'
import { Highlight, themes } from 'prism-react-renderer';
import { ExclamationCircleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const surfaceTagCode = `<script>
  (function(w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({
      'surface.start': new Date().getTime(),
      event: 'surface.js'
    });
    var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'surface' ? '&l=' + l : '';
    j.async = true;
    j.src = 'http://localhost:3000/api/analytics/tag.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
  })(window, document, 'script', 'surface', 'SURFACE_TAG_ID');
</script>`;

export function InstallSurfaceTag({ 
  onConnectionSuccess,
  tagId = 'SURFACE_TAG_ID'
}: { 
  onConnectionSuccess?: () => void,
  tagId?: string
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'checking' | 'connected' | 'failed'>('idle');

  // Generate script code with the specific tag ID
  const surfaceTagCodeWithId = surfaceTagCode.replace('SURFACE_TAG_ID', tagId);

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(surfaceTagCodeWithId);
  };

  const handleTestConnection = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Set to checking status
    setConnectionStatus('checking');
    
    // Check for events with the specific tag ID
    fetch(`/api/analytics/track?tagId=${encodeURIComponent(tagId)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const hasEvents = data.events && data.events.length > 0;
        
        if (hasEvents) {
          // If we have events for this tag ID, the connection is working
          setConnectionStatus('connected');
          if (onConnectionSuccess) {
            onConnectionSuccess();
          }
        } else {
          // If we don't have events, mark as failed
          setConnectionStatus('failed');
        }
      })
      .catch(error => {
        console.error('Connection test error:', error);
        setConnectionStatus('failed');
      });
  };

  const handleInstallTag = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(true); // Expand to show the snippet
  };

  const getConnectionStatusMessage = () => {
    switch (connectionStatus) {
      case 'checking':
        return (
          <div className="bg-[#F1F4FD] p-4 rounded-md flex gap-4 items-center">
            <div className="bg-[#4159CF] text-white rounded-full p-1">
              <InformationCircleIcon className="w-4 h-4" />
            </div>
            <div className="text-gray-600">
              Checking for Surface Tag...
            </div>
          </div>
        );
      case 'connected':
        return (
          <div className="bg-[#EFFAF6] p-4 rounded-md flex gap-4 items-center">
            <div className="bg-green-100 text-green-600 rounded-full p-1">
              <CheckCircleIcon className="w-4 h-4" />
            </div>
            <div className="text-gray-600">
              Connected successfully!
            </div>
          </div>
        );
      case 'failed':
        return (
          <div className="bg-[#FDEDF0] p-4 rounded-md flex gap-4 items-center">
            <div className="text-red-600 text-sm">
              <ExclamationCircleIcon className="w-5 h-5" />
            </div>
            <div>
            <div className="text-gray-800">We couldn't detect the Surface Tag on your website. Please ensure the snippet is added correctly.</div>
            <ul className="list-disc pl-5 text-sm text-gray-500">
              <li>Recheck the code snippet to ensure it's correctly placed before the closing &lt;/head&gt; tag.</li>
              <li>Ensure there are no blockers (like ad blockers) preventing the script from running.</li>
              <li>Try again once you've made the corrections.</li>
            </ul>
            </div>
            
          </div>
        );
      default:
        return null;
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
            <h2 className="text-lg font-medium text-gray-900">Install Surface Tag on your site</h2>
            <p className="text-gray-600">Enable tracking and analytics.</p>
          </div>
        </div>
        
        {!isExpanded && (
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors self-start sm:self-auto flex-shrink-0"
            onClick={handleInstallTag}
          >
            Install tag
          </button>
        )}
      </div>
      
      {isExpanded && (
        <div className="p-6 border-t border-gray-200">
          <div className="rounded-md overflow-hidden shadow relative">
            <div className="absolute top-2 right-2 z-10">
              <button 
                onClick={handleCopyClick}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Copy Snippet
              </button>
            </div>
            <Highlight
              theme={themes.vsDark}
              code={surfaceTagCodeWithId}
              language="html"
            >
              {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <pre className={`${className} p-4 overflow-auto text-sm`} style={{...style, backgroundColor: '#1e293b'}}>
                  {tokens.map((line, i) => (
                    <div key={i} {...getLineProps({ line })}>
                      <span className="text-gray-500 mr-4 select-none">{i + 1}.</span>
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </div>
                  ))}
                </pre>
              )}
            </Highlight>
          </div>
          
          <div className="mt-6">
            <h3 className="text-md font-medium text-gray-900 mb-2">Using the Surface Tag</h3>
            <p className="text-gray-600">Add this script to the &lt;head&gt; section of your HTML:</p>
            
            <p className="text-gray-600">For testing, use your website or create a sample HTML file with this script and open it in your browser.</p>
            <p className="text-gray-600">Make sure to interact with the page to generate some tracking events.</p>
          </div>
          
          <div className="flex flex-col mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div>
                {getConnectionStatusMessage()}
              </div>
              <button 
                onClick={handleTestConnection}
                className={`bg-blue-600 mt-2 sm:mt-0 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium ${connectionStatus === 'checking' ? 'opacity-75 cursor-wait' : ''}`}
                disabled={connectionStatus === 'checking'}
              >
                {connectionStatus === 'connected' ? 'Next step' : 'Test connection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 