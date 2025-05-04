import React from 'react';

export function Button({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'default', 
  className = '', 
  ...props 
}) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors';
  
  const variants = {
    default: 'bg-blue-500 text-white hover:bg-blue-600',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
    ghost: 'hover:bg-gray-100'
  };
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-12 px-8'
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
