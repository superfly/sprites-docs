import { motion } from 'motion/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number> },
    ) => void;
  }
}

const ThumbsUp = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
  </svg>
);

const ThumbsDown = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M17 14V2" />
    <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
  </svg>
);

export function PageFeedback() {
  const [submitted, setSubmitted] = useState<'yes' | 'no' | null>(null);

  const handleFeedback = (helpful: boolean) => {
    const path = window.location.pathname;
    window.plausible?.('Feedback', {
      props: { helpful: helpful ? 'yes' : 'no', path },
    });
    setSubmitted(helpful ? 'yes' : 'no');
  };

  if (submitted) {
    return (
      <div
        className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground"
        style={{ marginBottom: '2.5rem' }}
      >
        <motion.svg
          className="size-5 text-green-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <motion.path
            d="M5 12l5 5L20 7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          />
        </motion.svg>
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          Thanks for your feedback!
        </motion.span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center gap-4 py-4"
      style={{ marginBottom: '2.5rem' }}
    >
      <span className="text-sm text-muted-foreground">
        Was this page helpful?
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFeedback(true)}
          className="gap-1.5"
        >
          <ThumbsUp className="size-4" />
          Yes
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFeedback(false)}
          className="gap-1.5"
        >
          <ThumbsDown className="size-4" />
          No
        </Button>
      </div>
    </div>
  );
}
