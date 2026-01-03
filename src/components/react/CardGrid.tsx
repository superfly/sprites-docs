import type React from 'react';

interface CardGridProps {
  children: React.ReactNode;
  cols?: 2 | 3;
}

const CardGrid: React.FC<CardGridProps> = ({ children, cols = 2 }) => {
  const gridCols = cols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';

  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-4 not-content`}>
      {children}
    </div>
  );
};

export default CardGrid;
