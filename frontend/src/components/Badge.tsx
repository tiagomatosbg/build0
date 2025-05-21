import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'indigo' | 'purple' | 'pink';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  color = 'gray',
  size = 'md',
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'red':
        return 'bg-red-100 text-red-800';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800';
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'blue':
        return 'bg-blue-100 text-blue-800';
      case 'indigo':
        return 'bg-indigo-100 text-indigo-800';
      case 'purple':
        return 'bg-purple-100 text-purple-800';
      case 'pink':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-3 py-1 text-sm';
      default:
        return 'px-2.5 py-0.5 text-xs';
    }
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${getColorClasses()} ${getSizeClasses()}`}
    >
      {children}
    </span>
  );
}; 