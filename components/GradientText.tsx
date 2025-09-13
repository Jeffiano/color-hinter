import React from 'react';
import { getGradientTextStyle } from '@/lib/gradient-text';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'purple-blue';
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'div';
}

export function GradientText({ 
  children, 
  className = '', 
  variant = 'default',
  as: Component = 'span'
}: GradientTextProps) {
  const style = getGradientTextStyle(variant);

  return (
    <Component 
      className={`gradient-text ${variant === 'default' ? '' : 'gradient-text-purple-blue'} ${className}`}
      style={style}
    >
      {children}
    </Component>
  );
}
