import { ArrowUpRight, Check, Copy, Ellipsis, Github } from 'lucide-react';
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
  githubUrl: string;
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
  <svg
    viewBox="0 0 24 24"
    className="size-4"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" />
  </svg>
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
  <svg
    viewBox="0 0 466.73 532.09"
    className="size-4"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M457.43,125.94L244.42,2.96c-6.84-3.95-15.28-3.95-22.12,0L9.3,125.94c-5.75,3.32-9.3,9.46-9.3,16.11v247.99c0,6.65,3.55,12.79,9.3,16.11l213.01,122.98c6.84,3.95,15.28,3.95,22.12,0l213.01-122.98c5.75-3.32,9.3-9.46,9.3-16.11v-247.99c0-6.65-3.55-12.79-9.3-16.11h-.01ZM444.05,151.99l-205.63,356.16c-1.39,2.4-5.06,1.42-5.06-1.36v-233.21c0-4.66-2.49-8.97-6.53-11.31L24.87,145.67c-2.4-1.39-1.42-5.06,1.36-5.06h411.26c5.84,0,9.49,6.33,6.57,11.39h-.01Z" />
  </svg>
);

// Visually hidden text for screen readers
const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
  <span className="sr-only">{children}</span>
);

export function CopyPageButton({
  pageMarkdown,
  pageUrl,
  pageTitle,
  githubUrl,
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
        variant="secondary"
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
            variant="secondary"
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
          <DropdownMenuItem
            onClick={() => window.open(githubUrl, '_blank')}
            className="flex flex-col items-start gap-0.5 py-2"
          >
            <div className="flex items-center gap-2">
              <Github className="size-4" aria-hidden="true" />
              <span className="font-medium">
                View on GitHub
                <VisuallyHidden> (opens in new tab)</VisuallyHidden>
              </span>
              <ArrowUpRight className="size-3 opacity-50" aria-hidden="true" />
            </div>
            <span
              className="text-xs text-muted-foreground pl-6"
              aria-hidden="true"
            >
              View source on GitHub
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}
