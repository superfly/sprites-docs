import { ArrowUpRight, Check, Copy, Ellipsis } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from '@/components/ui/button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CopyPageButtonProps {
  pageMarkdown: string;
  pageUrl: string;
  pageTitle: string;
}

// ChatGPT logo
const ChatGPTIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="size-4"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
  </svg>
);

// Claude logo
const ClaudeIcon = () => (
  <img src="/claude.svg" alt="" className="size-4 dark:invert" />
);

// Markdown logo
const MarkdownIcon = () => (
  <svg
    viewBox="0 0 208 128"
    className="size-4"
    fill="currentColor"
    aria-hidden="true"
  >
    <rect
      width="198"
      height="118"
      x="5"
      y="5"
      fill="none"
      stroke="currentColor"
      strokeWidth="10"
      rx="10"
    />
    <path d="M30 98V30h20l20 25 20-25h20v68H90V59L70 84 50 59v39zm125 0l-30-33h20V30h20v35h20z" />
  </svg>
);

// Cursor logo
const CursorIcon = () => (
  <img src="/cursor.svg" alt="" className="size-4 dark:invert" />
);

// Visually hidden text for screen readers
const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
  <span className="sr-only">{children}</span>
);

export function CopyPageButton({
  pageMarkdown,
  pageUrl,
  pageTitle,
}: CopyPageButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    const content = `# ${pageTitle}\n\nSource: ${pageUrl}\n\n${pageMarkdown}`;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenChatGPT = () => {
    const prompt = `I'm reading this documentation page: ${pageUrl}\n\nPlease help me understand it and answer any questions I have about it.`;
    window.open(
      `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`,
      '_blank',
    );
  };

  const handleOpenClaude = () => {
    const prompt = `I'm reading this documentation page: ${pageUrl}\n\nPlease help me understand it and answer any questions I have about it.`;
    window.open(
      `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
      '_blank',
    );
  };

  const handleOpenCursor = () => {
    const mdUrl = `${pageUrl.replace(/\/$/, '')}.md`;
    const prompt = `Load the contents of ${mdUrl} into this chat's context so we can discuss it.`;
    window.location.href =
      'cursor://anysphere.cursor-deeplink/prompt?text=' +
      encodeURIComponent(prompt);
  };

  const handleViewMarkdown = () => {
    const url = new URL(pageUrl);
    const path = url.pathname.replace(/\/$/, '');
    // Root path links to /index.md, otherwise append .md
    const mdPath = path === '' ? '/index.md' : `${path}.md`;
    window.open(`${url.origin}${mdPath}`, '_blank');
  };

  return (
    <ButtonGroup>
      <Button
        variant="outline"
        size="sm"
        className="gap-1 !text-xs h-7"
        onClick={handleCopy}
        aria-label={copied ? 'Copied to clipboard' : 'Copy page to clipboard'}
      >
        {copied ? (
          <Check className="size-3" aria-hidden="true" />
        ) : (
          <Copy className="size-3" aria-hidden="true" />
        )}
        <span className="hidden sm:inline" aria-hidden="true">
          Copy page
        </span>
        <span className="sr-only" aria-live="polite">
          {copied ? 'Copied to clipboard' : ''}
        </span>
      </Button>
      <ButtonGroupSeparator />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="px-1.5 h-7"
            aria-label="More options"
          >
            <Ellipsis className="size-3" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuItem
            onClick={handleOpenChatGPT}
            className="flex flex-col items-start gap-0.5 py-2"
          >
            <div className="flex items-center gap-2">
              <ChatGPTIcon />
              <span className="font-medium">
                Open in ChatGPT
                <VisuallyHidden> (opens in new tab)</VisuallyHidden>
              </span>
              <ArrowUpRight className="size-3 opacity-50" aria-hidden="true" />
            </div>
            <span
              className="text-xs text-muted-foreground pl-6"
              aria-hidden="true"
            >
              Ask questions about this page
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleOpenClaude}
            className="flex flex-col items-start gap-0.5 py-2"
          >
            <div className="flex items-center gap-2">
              <ClaudeIcon />
              <span className="font-medium">
                Open in Claude
                <VisuallyHidden> (opens in new tab)</VisuallyHidden>
              </span>
              <ArrowUpRight className="size-3 opacity-50" aria-hidden="true" />
            </div>
            <span
              className="text-xs text-muted-foreground pl-6"
              aria-hidden="true"
            >
              Ask questions about this page
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleOpenCursor}
            className="hidden sm:flex flex-col items-start gap-0.5 py-2"
          >
            <div className="flex items-center gap-2">
              <CursorIcon />
              <span className="font-medium">
                Open in Cursor
                <VisuallyHidden> (opens in Cursor app)</VisuallyHidden>
              </span>
              <ArrowUpRight className="size-3 opacity-50" aria-hidden="true" />
            </div>
            <span
              className="text-xs text-muted-foreground pl-6"
              aria-hidden="true"
            >
              Open page context in Cursor
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleViewMarkdown}
            className="flex flex-col items-start gap-0.5 py-2"
          >
            <div className="flex items-center gap-2">
              <MarkdownIcon />
              <span className="font-medium">
                View as Markdown
                <VisuallyHidden> (opens in new tab)</VisuallyHidden>
              </span>
              <ArrowUpRight className="size-3 opacity-50" aria-hidden="true" />
            </div>
            <span
              className="text-xs text-muted-foreground pl-6"
              aria-hidden="true"
            >
              Open raw markdown in new tab
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}
