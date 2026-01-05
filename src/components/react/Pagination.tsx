import { Button } from '@/components/ui/button';

interface PaginationLink {
  href: string;
  label: string;
}

interface PaginationProps {
  prev?: PaginationLink;
  next?: PaginationLink;
  dir?: 'ltr' | 'rtl';
}

const PixelArrow = ({
  direction = 'right',
}: {
  direction?: 'left' | 'right';
}) => (
  <svg
    className={`size-2.5 shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5 ${
      direction === 'left' ? '-scale-x-100 group-hover:-translate-x-0.5' : ''
    }`}
    viewBox="0 0 36 60"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M24 48V36H12v12h12M0 48v12h12V48H0m12-24h12V12H12v12m24 0H24v12h12V24M12 12V0H0v12h12z" />
  </svg>
);

export function Pagination({ prev, next, dir = 'ltr' }: PaginationProps) {
  return (
    <div
      className="flex justify-between items-center gap-4 mt-8 print:hidden"
      dir={dir}
    >
      {prev && (
        <Button variant="outline" size="sm" asChild className="group mr-auto">
          <a href={prev.href} rel="prev">
            <PixelArrow direction="left" />
            <span className="leading-none">{prev.label}</span>
          </a>
        </Button>
      )}
      {next && (
        <Button variant="outline" size="sm" asChild className="group ml-auto">
          <a href={next.href} rel="next">
            <span className="leading-none">{next.label}</span>
            <PixelArrow direction="right" />
          </a>
        </Button>
      )}
    </div>
  );
}
