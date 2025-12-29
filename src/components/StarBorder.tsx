import type React from 'react';
import { cn } from '@/lib/utils';

type StarBorderProps<T extends React.ElementType> =
  React.ComponentPropsWithoutRef<T> & {
    as?: T;
    className?: string;
    children?: React.ReactNode;
    color?: string;
    speed?: React.CSSProperties['animationDuration'];
    thickness?: number;
    isAnimating?: boolean;
  };

const StarBorder = <T extends React.ElementType = 'div'>({
  as,
  className = '',
  color = 'white',
  speed = '6s',
  thickness = 1,
  isAnimating = true,
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = as || 'div';

  return (
    <Component
      className={cn('relative inline-block overflow-hidden', className)}
      {...(rest as React.ComponentPropsWithoutRef<T>)}
      style={{
        padding: `${thickness}px 0`,
        ...(rest as React.CSSProperties & { style?: React.CSSProperties })
          .style,
      }}
    >
      <div
        className={cn(
          'absolute w-[300%] h-[50%] bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0 transition-opacity duration-500',
          !isAnimating && 'opacity-0',
        )}
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
          animationPlayState: isAnimating ? 'running' : 'paused',
          opacity: isAnimating ? 0.7 : 0,
        }}
      />
      <div
        className={cn(
          'absolute w-[300%] h-[50%] top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0 transition-opacity duration-500',
          !isAnimating && 'opacity-0',
        )}
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
          animationPlayState: isAnimating ? 'running' : 'paused',
          opacity: isAnimating ? 0.7 : 0,
        }}
      />
      <div className="relative z-[1]">{children}</div>
    </Component>
  );
};

export default StarBorder;
