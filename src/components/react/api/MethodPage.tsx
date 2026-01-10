'use client';

import { cn } from '@/lib/utils';

interface MethodPageProps {
  children: React.ReactNode;
  className?: string;
}

export function MethodPage({ children, className }: MethodPageProps) {
  return <div className={cn('method-page', className)}>{children}</div>;
}

interface MethodPageSideProps {
  children: React.ReactNode;
  className?: string;
}

export function MethodPageLeft({ children, className }: MethodPageSideProps) {
  return <div className={cn('method-page-left', className)}>{children}</div>;
}

export function MethodPageRight({ children, className }: MethodPageSideProps) {
  return <div className={cn('method-page-right', className)}>{children}</div>;
}
