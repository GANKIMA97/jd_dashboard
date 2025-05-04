import React, { useState } from 'react';

export function Tabs({ children, defaultValue, className = '' }) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <div className={className}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({ children, className = '' }) {
  return (
    <div className={`flex space-x-2 border-b mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ children, value, activeTab, setActiveTab, className = '' }) {
  return (
    <button
      className={`px-4 py-2 pb-3 ${
        activeTab === value
          ? 'border-b-2 border-blue-500 text-blue-500'
          : 'text-gray-500 hover:text-gray-700'
      } ${className}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, value, activeTab, className = '' }) {
  if (value !== activeTab) return null;
  return <div className={className}>{children}</div>;
}
