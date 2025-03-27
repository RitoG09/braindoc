import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, className }) => {
  return (
    <div 
      className={cn(
        "opacity-0 animate-fade-in transition-all duration-500", 
        className
      )}
    >
      {children}
    </div>
  );
};

export default PageTransition;
