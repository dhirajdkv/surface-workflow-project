"use client";

import { useState } from 'react';
import { OnboardingHeader } from "./components/OnboardingHeader";
import { InstallSurfaceTag } from "./components/InstallSurfaceTag";
import { TestSurfaceTag } from "./components/TestSurfaceTag";
import { Sidebar } from "./components/Sidebar";
import { env } from "~/env";
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function OnboardingPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandTestSection, setExpandTestSection] = useState(false);
  
  // Get the tag ID from environment variables
  const tagId = env.NEXT_PUBLIC_SURFACE_TAG_ID;

  const handleConnectionSuccess = () => {
    setExpandTestSection(true);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      {/* Mobile Menu Button */}
      <div className="md:hidden p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white px-2 py-1 rounded font-bold">surface</div>
          <span className="text-gray-500">labs</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`text-gray-700 focus:outline-none ${isSidebarOpen ? 'hidden' : 'block'}`}
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>
      
      {/* Sidebar - Fixed Position */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block md:sticky md:top-0 md:self-start md:h-screen z-10 bg-white`}>
        <div className="md:hidden absolute top-0 right-0 p-4">
          <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <Sidebar />
      </div>
      
      {/* Main Content - Scrollable */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <OnboardingHeader />
        
        <div className="space-y-6 mt-6 md:mt-8">
          <InstallSurfaceTag 
            onConnectionSuccess={handleConnectionSuccess} 
            tagId={tagId}
          />
          <TestSurfaceTag 
            defaultExpanded={expandTestSection} 
            tagId={tagId}
          />
        </div>
      </div>
    </div>
  );
} 