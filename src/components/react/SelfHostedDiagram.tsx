import { cn } from '@/lib/utils';

/**
 * Static architecture diagram for the Claude Managed Agents integration.
 *
 * A 2×2 grid read as a clockwise lifecycle loop: the Claude Platform (top
 * left) ① enqueues a work item into the Work queue (top right) → a worker
 * you run (bottom right) ② claims it → the worker ③ launches a per-session
 * Sprite (bottom left) → ④ tool calls & results round-trip between the
 * Platform and the Sprite. The top row is Anthropic's zone, the bottom row
 * is yours, so both vertical connectors (claims, tool calls) visibly cross
 * the trust boundary.
 *
 * Big, chunky blocks and large labels so it stays legible when scaled down.
 * Connectors and labels are drawn ON TOP of the blocks so nothing is occluded.
 * All-SVG; colors adapt to Starlight light/dark via CSS variables scoped to
 * `.shd-root`. Fully static — no motion.
 */

type Tone = 'clay' | 'violet';

// Grid: columns at x=60/444 (centers 158/542), rows at y=70/360. Blocks 196×190.
const COL = [
  { x: 60, cx: 158 },
  { x: 444, cx: 542 },
];
const ROW = [70, 360];

// Trust zones behind the rows: Anthropic's on top, yours below.
const ZONES = [
  { y: 28, tone: 'clay' as Tone, label: 'ANTHROPIC RUNS THIS', labelY: 54 },
  { y: 340, tone: 'violet' as Tone, label: 'YOU RUN THIS', labelY: 576 },
];

// Tool-call round trip: gentle lens-shaped arcs between Platform and Sprite.
const CALL_DOWN = 'M 150 266 C 128 296 128 324 150 353';
const RESULT_UP = 'M 166 354 C 188 324 188 296 166 267';
const ENQUEUES = 'M 266 165 L 433 165';
const CLAIMS = 'M 542 266 L 542 352';
const LAUNCHES = 'M 434 455 L 267 455';

export function SelfHostedDiagram({ className }: { className?: string }) {
  const Block = ({
    x,
    cx,
    y,
    title,
    sub,
    subTone,
    children,
  }: {
    x: number;
    cx: number;
    y: number;
    title: string;
    sub: string;
    subTone?: Tone;
    children: React.ReactNode;
  }) => (
    <g>
      <rect
        x={x}
        y={y}
        width={196}
        height={190}
        rx="22"
        fill="url(#shd-card)"
        stroke="var(--shd-cardStroke)"
        strokeWidth="2"
        filter="url(#shd-shadow)"
      />
      {/* Icon content is positioned relative to the block's top-center. */}
      <g transform={`translate(${cx} ${y})`}>{children}</g>
      <text
        x={cx}
        y={y + 142}
        textAnchor="middle"
        fontSize="19"
        fontWeight="700"
        fill="var(--shd-ink)"
      >
        {title}
      </text>
      <text
        x={cx}
        y={y + 165}
        textAnchor="middle"
        fontSize="15"
        fill={subTone ? `var(--shd-${subTone}2)` : 'var(--shd-sub)'}
      >
        {sub}
      </text>
    </g>
  );

  const Badge = ({
    x,
    y,
    tone,
    n,
  }: {
    x: number;
    y: number;
    tone: Tone;
    n: number;
  }) => (
    <g>
      <circle cx={x} cy={y} r="11" fill={`url(#shd-${tone})`} />
      <text
        x={x}
        y={y + 5.3}
        textAnchor="middle"
        fontSize="15"
        fontWeight="800"
        fill="#fff"
      >
        {n}
      </text>
    </g>
  );

  return (
    <svg
      viewBox="0 0 700 604"
      className={cn(
        'shd-root mx-auto my-8 h-auto w-full max-w-2xl select-none',
        className,
      )}
      role="img"
      aria-label="Lifecycle loop: on Anthropic's side, the Claude Platform enqueues a work item; on your side, a worker claims it and launches a per-session Sprite, and tool calls round-trip between the Platform and the Sprite where everything the tools touch stays"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        .shd-root{
          --shd-clay1:#EBA184;--shd-clay2:#D97757;
          --shd-violet1:#9B7CF0;--shd-violet2:#7C3AED;
          --shd-line:#9aa6b8;--shd-ink:#334155;--shd-sub:#94a3b8;--shd-hair:#e2e8f0;
          --shd-card1:#ffffff;--shd-card2:#f6f8fb;--shd-cardStroke:#e6e9ef;--shd-chip:#f1f5f9;
          --shd-shadow:rgba(15,23,42,.12);
          --shd-zoneClayFill:rgba(217,119,87,.045);--shd-zoneClayStroke:rgba(217,119,87,.3);
          --shd-zoneVioletFill:rgba(124,58,237,.04);--shd-zoneVioletStroke:rgba(124,58,237,.26);
        }
        :is(.dark,[data-theme="dark"]) .shd-root{
          --shd-clay1:#F0AF97;--shd-clay2:#E89A7E;
          --shd-violet1:#B79BFB;--shd-violet2:#A98BFA;
          --shd-line:#5b667a;--shd-ink:#e2e8f0;--shd-sub:#8a94a6;--shd-hair:rgba(255,255,255,.14);
          --shd-card1:rgba(255,255,255,.06);--shd-card2:rgba(255,255,255,.025);--shd-cardStroke:rgba(255,255,255,.14);--shd-chip:rgba(255,255,255,.07);
          --shd-shadow:rgba(0,0,0,.5);
          --shd-zoneClayFill:rgba(232,154,126,.06);--shd-zoneClayStroke:rgba(232,154,126,.32);
          --shd-zoneVioletFill:rgba(169,139,250,.055);--shd-zoneVioletStroke:rgba(169,139,250,.3);
        }
      `}</style>

      <defs>
        <linearGradient id="shd-clay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--shd-clay1)" />
          <stop offset="1" stopColor="var(--shd-clay2)" />
        </linearGradient>
        <linearGradient id="shd-violet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--shd-violet1)" />
          <stop offset="1" stopColor="var(--shd-violet2)" />
        </linearGradient>
        <linearGradient id="shd-card" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--shd-card1)" />
          <stop offset="1" stopColor="var(--shd-card2)" />
        </linearGradient>
        {/* Two concretely-filled arrowheads (context-stroke is unsupported in
            Safari); each connector references the marker matching its tone. */}
        <marker
          id="shd-arrow-clay"
          markerWidth="12"
          markerHeight="12"
          refX="8"
          refY="5"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M0 0 L10 5 L0 10 z" fill="var(--shd-clay2)" />
        </marker>
        <marker
          id="shd-arrow-violet"
          markerWidth="12"
          markerHeight="12"
          refX="8"
          refY="5"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M0 0 L10 5 L0 10 z" fill="var(--shd-violet2)" />
        </marker>
        <filter id="shd-shadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow
            dx="0"
            dy="5"
            stdDeviation="9"
            floodColor="var(--shd-shadow)"
            floodOpacity="1"
          />
        </filter>
      </defs>

      <g>
        {/* ---- Trust zones (behind everything) ---- */}
        {ZONES.map((z) => (
          <g key={z.label}>
            <rect
              x="20"
              y={z.y}
              width="660"
              height="252"
              rx="26"
              fill={`var(--shd-zone${z.tone === 'clay' ? 'Clay' : 'Violet'}Fill)`}
              stroke={`var(--shd-zone${z.tone === 'clay' ? 'Clay' : 'Violet'}Stroke)`}
              strokeWidth="1.5"
              strokeDasharray="7 7"
            />
            <text
              x="350"
              y={z.labelY}
              textAnchor="middle"
              fontSize="15"
              fontWeight="700"
              letterSpacing="2.5"
              fill={`var(--shd-${z.tone}2)`}
              opacity="0.8"
            >
              {z.label}
            </text>
          </g>
        ))}

        {/* ---- Blocks (before connectors, so connectors sit on top) ---- */}

        {/* 1: Claude Platform (top left) */}
        <Block
          x={COL[0].x}
          cx={COL[0].cx}
          y={ROW[0]}
          title="Claude Platform"
          sub="agent loop + model"
        >
          <g transform="translate(0 66)">
            <circle
              r="32"
              fill="none"
              stroke="var(--shd-hair)"
              strokeWidth="2"
            />
            <g>
              <path
                d="M 5.6 -31.5 A 32 32 0 0 1 5.6 31.5"
                fill="none"
                stroke="url(#shd-clay)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M -5.6 31.5 A 32 32 0 0 1 -5.6 -31.5"
                fill="none"
                stroke="url(#shd-clay)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <circle cx="5.6" cy="31.5" r="4.5" fill="var(--shd-clay2)" />
              <circle cx="-5.6" cy="-31.5" r="4.5" fill="var(--shd-clay2)" />
            </g>
            <path
              d="M 0 -11 C 1.5 -3.5 3.5 -1.5 11 0 C 3.5 1.5 1.5 3.5 0 11 C -1.5 3.5 -3.5 1.5 -11 0 C -3.5 -1.5 -1.5 -3.5 0 -11 Z"
              fill="url(#shd-clay)"
            />
          </g>
        </Block>

        {/* 2: Work queue (top right) */}
        <Block
          x={COL[1].x}
          cx={COL[1].cx}
          y={ROW[0]}
          title="Work queue"
          sub="session work items"
        >
          {[0, 1, 2].map((i) => {
            const y = 42 + i * 24;
            return (
              <g key={i}>
                <rect
                  x={-60}
                  y={y}
                  width={120}
                  height={19}
                  rx="7"
                  fill="var(--shd-chip)"
                  stroke="var(--shd-cardStroke)"
                  strokeWidth="1.25"
                />
                <circle cx={-48} cy={y + 9.5} r="4" fill="var(--shd-violet2)" />
                <rect
                  x={-36}
                  y={y + 6.5}
                  width={82}
                  height={6}
                  rx="3"
                  fill="var(--shd-line)"
                  opacity="0.45"
                />
              </g>
            );
          })}
        </Block>

        {/* 3: Worker (bottom right) */}
        <Block
          x={COL[1].x}
          cx={COL[1].cx}
          y={ROW[1]}
          title="Worker"
          sub="polls · claims work"
        >
          <g transform="translate(0 66)">
            <circle r="15" fill="url(#shd-violet)" />
            <circle r="5" fill="#fff" opacity="0.92" />
          </g>
        </Block>

        {/* 4: Sprite (bottom left, stateful sandbox) */}
        <Block
          x={COL[0].x}
          cx={COL[0].cx}
          y={ROW[1]}
          title="Sprite"
          sub="stateful · checkpointed"
          subTone="violet"
        >
          <rect
            x={-55}
            y={34}
            width={110}
            height={68}
            rx="12"
            fill="var(--shd-chip)"
            stroke="var(--shd-cardStroke)"
            strokeWidth="1.5"
          />
          <circle cx={-38} cy={49} r="3.5" fill="var(--shd-clay2)" />
          <circle cx={-26} cy={49} r="3.5" fill="#f1c40f" opacity="0.9" />
          <circle cx={-14} cy={49} r="3.5" fill="var(--shd-violet2)" />
          <line
            x1={-55}
            y1={60}
            x2={55}
            y2={60}
            stroke="var(--shd-hair)"
            strokeWidth="1.25"
          />
          <text
            x={-39}
            y={87}
            fontSize="18"
            fontWeight="700"
            fontFamily="ui-monospace, monospace"
            fill="var(--shd-violet2)"
          >
            &gt;_
          </text>
        </Block>

        {/* ---- Connectors on top ---- */}

        <g>
          {/* ① enqueues: top gap, left to right */}
          <path
            d={ENQUEUES}
            fill="none"
            stroke="var(--shd-clay2)"
            strokeWidth="2.6"
            strokeLinecap="round"
            markerEnd="url(#shd-arrow-clay)"
          />
          <Badge x={350} y={127} tone="clay" n={1} />
          <text
            x="350"
            y="153"
            textAnchor="middle"
            fontSize="16"
            fontWeight="600"
            fill="var(--shd-sub)"
          >
            enqueues
          </text>

          {/* ② claims: right column, crosses the trust boundary */}
          <path
            d={CLAIMS}
            fill="none"
            stroke="var(--shd-clay2)"
            strokeWidth="2.6"
            strokeLinecap="round"
            markerEnd="url(#shd-arrow-clay)"
          />
          <Badge x={562} y={298} tone="clay" n={2} />
          <text
            x="576"
            y="303"
            textAnchor="start"
            fontSize="16"
            fontWeight="600"
            fill="var(--shd-sub)"
          >
            claims
          </text>

          {/* ③ launches: bottom gap, right to left */}
          <path
            d={LAUNCHES}
            fill="none"
            stroke="var(--shd-violet2)"
            strokeWidth="2.6"
            strokeLinecap="round"
            markerEnd="url(#shd-arrow-violet)"
          />
          <Badge x={350} y={417} tone="violet" n={3} />
          <text
            x="350"
            y="443"
            textAnchor="middle"
            fontSize="16"
            fontWeight="600"
            fill="var(--shd-sub)"
          >
            launches
          </text>

          {/* ④ tool calls & results: left column round trip across the boundary */}
          <path
            d={CALL_DOWN}
            fill="none"
            stroke="var(--shd-clay2)"
            strokeWidth="2.4"
            opacity="0.85"
            markerEnd="url(#shd-arrow-clay)"
          />
          <path
            d={RESULT_UP}
            fill="none"
            stroke="var(--shd-violet2)"
            strokeWidth="2.4"
            opacity="0.85"
            markerEnd="url(#shd-arrow-violet)"
          />
          <Badge x={204} y={298} tone="clay" n={4} />
          <text
            x="218"
            y="303"
            textAnchor="start"
            fontSize="16"
            fontWeight="700"
            fill="var(--shd-ink)"
          >
            tool calls &amp; results
          </text>
          <text
            x="218"
            y="323"
            textAnchor="start"
            fontSize="16"
            fontStyle="italic"
            fill="var(--shd-sub)"
          >
            everything the tools touch stays
          </text>
        </g>
      </g>
    </svg>
  );
}
