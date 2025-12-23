import { useEffect, useState } from 'react'
import { Zap, Moon, HardDrive, Cloud, File, Database, GitBranch, Package, FolderOpen, Loader } from 'lucide-react'
import { cn } from '../../lib/utils'
import { DotPattern } from './DotPattern'

type Phase = 'active' | 'hibernating' | 'hibernated' | 'waking'

const dataItems = [
  { icon: File, label: 'Files', color: 'text-blue-500' },
  { icon: Database, label: 'SQLite', color: 'text-emerald-500' },
  { icon: GitBranch, label: 'Git', color: 'text-orange-500' },
  { icon: Package, label: 'Packages', color: 'text-violet-500' },
]

const phases: Phase[] = ['active', 'hibernating', 'hibernated', 'waking']

export function LifecycleDiagram() {
  const [phase, setPhase] = useState<Phase>('active')
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return

    const durations = {
      active: 3000,
      hibernating: 2000,
      hibernated: 2500,
      waking: 2000,
    }

    const timeout = setTimeout(() => {
      const currentIndex = phases.indexOf(phase)
      const nextIndex = (currentIndex + 1) % phases.length
      setPhase(phases[nextIndex])
    }, durations[phase])

    return () => clearTimeout(timeout)
  }, [phase, isPaused])

  const isTransferring = phase === 'hibernating' || phase === 'waking'

  return (
    <div
      className="my-8 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <style>{`
        @keyframes packet-right {
          0% {
            left: 20%;
            top: 50%;
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
          15% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          85% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            left: 80%;
            top: 50%;
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
        }
        @keyframes packet-left {
          0% {
            left: 80%;
            top: 50%;
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
          15% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          85% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            left: 20%;
            top: 50%;
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
        }
        .data-packet-right {
          animation: packet-right 1.4s ease-in-out infinite;
        }
        .data-packet-left {
          animation: packet-left 1.4s ease-in-out infinite;
        }
        @media (min-width: 1024px) {
          @keyframes packet-right {
            0% {
              left: 50%;
              top: 20%;
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.5);
            }
            15% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
            85% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
            100% {
              left: 50%;
              top: 80%;
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.5);
            }
          }
          @keyframes packet-left {
            0% {
              left: 50%;
              top: 80%;
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.5);
            }
            15% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
            85% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
            100% {
              left: 50%;
              top: 20%;
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.5);
            }
          }
        }
      `}</style>
      <div className="relative rounded-xl border border-[var(--sl-color-hairline)] bg-gradient-to-b from-[var(--sl-color-bg-nav)] to-[var(--sl-color-bg-sidebar)] overflow-hidden">
        {/* Dot pattern background */}
        <DotPattern
          className="text-stone-300/50 dark:text-stone-600/30"
          width={24}
          height={24}
          cr={1}
        />

        {/* Animated background gradient */}
        <div
          className={cn(
            "absolute inset-0 opacity-0 transition-opacity duration-1000",
            phase === 'active' && "opacity-100"
          )}
          style={{
            background: 'radial-gradient(ellipse at 30% 50%, oklch(0.648 0.2 131.684 / 0.08) 0%, transparent 50%)',
          }}
        />
        <div
          className={cn(
            "absolute inset-0 opacity-0 transition-opacity duration-1000",
            phase === 'hibernated' && "opacity-100"
          )}
          style={{
            background: 'radial-gradient(ellipse at 70% 50%, oklch(0.5 0.1 250 / 0.1) 0%, transparent 50%)',
          }}
        />

        <div className="relative p-6 md:p-8">
          {/* Phase timeline */}
          <div className="flex items-center justify-center gap-1 mb-8">
            {phases.map((p, i) => (
              <div key={p} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      'h-3 w-3 rounded-full border-2 transition-all duration-500',
                      phase === p
                        ? 'border-[var(--sl-color-accent)] bg-[var(--sl-color-accent)] scale-110 shadow-lg'
                        : phases.indexOf(phase) > i
                          ? 'border-[var(--sl-color-accent)]/50 bg-[var(--sl-color-accent)]/30'
                          : 'border-[var(--sl-color-gray-3)]/30 bg-transparent'
                    )}
                  />
                  <span className={cn(
                    'text-[10px] font-medium transition-colors duration-300 hidden sm:block',
                    phase === p ? 'text-[var(--sl-color-accent)]' : 'text-[var(--sl-color-gray-3)]/60'
                  )}>
                    {p === 'active' ? 'Active' : p === 'hibernating' ? 'Saving' : p === 'hibernated' ? 'Sleeping' : 'Waking'}
                  </span>
                </div>
                {i < 3 && (
                  <div className={cn(
                    'w-8 sm:w-12 h-0.5 mx-1 transition-colors duration-500',
                    phases.indexOf(phase) > i ? 'bg-[var(--sl-color-accent)]/50' : 'bg-[var(--sl-color-hairline)]'
                  )} />
                )}
              </div>
            ))}
          </div>

          {/* Main visualization */}
          <div className="relative flex flex-col lg:flex-row items-stretch justify-center gap-4 lg:gap-0">
            {/* Active Sprite */}
            <div className={cn(
              'relative flex-1 max-w-sm rounded-xl border-2 p-5 transition-all duration-700 bg-[var(--sl-color-bg-nav)]/80 backdrop-blur-sm',
              (phase === 'active' || phase === 'waking')
                ? 'border-[var(--sl-color-accent)] shadow-xl'
                : 'border-[var(--sl-color-hairline)]/50'
            )}>
              {/* Glow */}
              {(phase === 'active') && (
                <div className="absolute -inset-1 -z-10 rounded-xl bg-[var(--sl-color-accent)]/15 blur-2xl animate-pulse" />
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  'relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-500',
                  (phase === 'active' || phase === 'waking')
                    ? 'bg-[var(--sl-color-accent)] text-[var(--sl-color-text-accent)] shadow-lg'
                    : 'bg-[var(--sl-color-bg-sidebar)] text-[var(--sl-color-gray-2)]'
                )}>
                  <Zap className="h-5 w-5" />
                  {phase === 'active' && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--sl-color-accent)] opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--sl-color-accent)] border-2 border-[var(--sl-color-bg-nav)]" />
                    </span>
                  )}
                </div>
                <div>
                  <h4 className={cn(
                    'font-semibold transition-colors duration-300',
                    (phase === 'active' || phase === 'waking') ? 'text-[var(--sl-color-white)]' : 'text-[var(--sl-color-gray-2)]'
                  )}>
                    Active Sprite
                  </h4>
                  <p className="text-xs text-[var(--sl-color-gray-2)]">Running on compute</p>
                </div>
              </div>

              {/* Storage box */}
              <div className={cn(
                'rounded-lg border p-3 transition-all duration-500',
                phase === 'active'
                  ? 'border-[var(--sl-color-accent)]/30 bg-gradient-to-br from-[var(--sl-color-accent)]/10 to-transparent'
                  : 'border-[var(--sl-color-hairline)] bg-[var(--sl-color-bg-sidebar)]/30'
              )}>
                <div className="flex items-center gap-2 mb-3">
                  <HardDrive className={cn(
                    'h-4 w-4 transition-colors duration-300',
                    phase === 'active' ? 'text-[var(--sl-color-accent)]' : 'text-[var(--sl-color-gray-2)]'
                  )} />
                  <span className={cn(
                    'text-xs font-semibold transition-colors duration-300',
                    phase === 'active' ? 'text-[var(--sl-color-white)]' : 'text-[var(--sl-color-gray-2)]'
                  )}>
                    NVMe Storage
                  </span>
                </div>

                {/* Data items */}
                <div className="grid grid-cols-2 gap-2">
                  {dataItems.map((item, i) => (
                    <div
                      key={item.label}
                      className={cn(
                        'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-all duration-500',
                        phase === 'active'
                          ? 'bg-[var(--sl-color-bg)]/80 text-[var(--sl-color-white)]'
                          : phase === 'hibernating'
                            ? 'bg-[var(--sl-color-bg)]/40 text-[var(--sl-color-gray-2)] opacity-50'
                            : phase === 'waking'
                              ? 'bg-[var(--sl-color-bg)]/60 text-[var(--sl-color-white)] animate-pulse'
                              : 'bg-[var(--sl-color-bg)]/20 text-[var(--sl-color-gray-3)]/50'
                      )}
                      style={{
                        transitionDelay: phase === 'waking' ? `${i * 100}ms` : '0ms',
                      }}
                    >
                      <item.icon className={cn('h-3.5 w-3.5', item.color)} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className={cn(
                'mt-3 flex items-center justify-between text-xs transition-opacity duration-300',
                phase === 'active' ? 'opacity-100' : 'opacity-40'
              )}>
                <span className="text-[var(--sl-color-gray-2)]">Latency</span>
                <span className="font-mono text-[var(--sl-color-accent)]">&lt;1ms</span>
              </div>
            </div>

            {/* Transfer visualization */}
            <div className="relative flex items-center justify-center lg:w-32 py-4 lg:py-0">
              {/* Connection line */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={cn(
                  'h-0.5 lg:h-auto lg:w-0.5 w-full lg:h-full transition-colors duration-500',
                  isTransferring ? 'bg-[var(--sl-color-accent)]/30' : 'bg-[var(--sl-color-hairline)]'
                )} />
              </div>

              {/* Animated data packets */}
              {isTransferring && (
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(4)].map((_, i) => {
                    const ItemIcon = dataItems[i % dataItems.length].icon
                    return (
                      <div
                        key={i}
                        className={cn(
                          'absolute flex items-center justify-center w-6 h-6 rounded-md bg-[var(--sl-color-bg-nav)] border border-[var(--sl-color-accent)]/50 shadow-lg',
                          phase === 'hibernating' ? 'data-packet-right' : 'data-packet-left'
                        )}
                        style={{
                          animationDelay: `${i * 350}ms`,
                        }}
                      >
                        <ItemIcon className={cn('h-3 w-3', dataItems[i % dataItems.length].color)} />
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Center indicator */}
              <div className={cn(
                'relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 bg-[var(--sl-color-bg-nav)] transition-all duration-500',
                isTransferring
                  ? 'border-[var(--sl-color-accent)] shadow-lg'
                  : 'border-[var(--sl-color-hairline)]'
              )}>
                {isTransferring ? (
                  <Loader className={cn(
                    'h-5 w-5 animate-spin',
                    phase === 'hibernating' ? 'text-amber-500' : 'text-[var(--sl-color-accent)]'
                  )} />
                ) : (
                  <FolderOpen className="h-4 w-4 text-[var(--sl-color-gray-2)]" />
                )}
              </div>
            </div>

            {/* Hibernated Sprite */}
            <div className={cn(
              'relative flex-1 max-w-sm rounded-xl border-2 p-5 transition-all duration-700 bg-[var(--sl-color-bg-nav)]/80 backdrop-blur-sm',
              phase === 'hibernated'
                ? 'border-blue-500/50 shadow-xl'
                : 'border-[var(--sl-color-hairline)]/50'
            )}>
              {/* Glow */}
              {phase === 'hibernated' && (
                <div className="absolute -inset-1 -z-10 rounded-xl bg-blue-500/10 blur-2xl" />
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  'relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-500',
                  phase === 'hibernated'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : phase === 'hibernating'
                      ? 'bg-blue-500/50 text-white'
                      : 'bg-[var(--sl-color-bg-sidebar)] text-[var(--sl-color-gray-2)]'
                )}>
                  <Moon className={cn('h-5 w-5', phase === 'hibernated' && 'animate-pulse')} />
                </div>
                <div>
                  <h4 className={cn(
                    'font-semibold transition-colors duration-300',
                    phase === 'hibernated' ? 'text-[var(--sl-color-white)]' : 'text-[var(--sl-color-gray-2)]'
                  )}>
                    Hibernated
                  </h4>
                  <p className="text-xs text-[var(--sl-color-gray-2)]">Zero compute cost</p>
                </div>
              </div>

              {/* Storage box */}
              <div className={cn(
                'rounded-lg border p-3 transition-all duration-500',
                phase === 'hibernated'
                  ? 'border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent'
                  : 'border-[var(--sl-color-hairline)] bg-[var(--sl-color-bg-sidebar)]/30'
              )}>
                <div className="flex items-center gap-2 mb-3">
                  <Cloud className={cn(
                    'h-4 w-4 transition-colors duration-300',
                    phase === 'hibernated' ? 'text-blue-500' : 'text-[var(--sl-color-gray-2)]'
                  )} />
                  <span className={cn(
                    'text-xs font-semibold transition-colors duration-300',
                    phase === 'hibernated' ? 'text-[var(--sl-color-white)]' : 'text-[var(--sl-color-gray-2)]'
                  )}>
                    Object Storage
                  </span>
                </div>

                {/* Data items */}
                <div className="grid grid-cols-2 gap-2">
                  {dataItems.map((item, i) => (
                    <div
                      key={item.label}
                      className={cn(
                        'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-all duration-500',
                        phase === 'hibernated'
                          ? 'bg-[var(--sl-color-bg)]/80 text-[var(--sl-color-white)]'
                          : phase === 'hibernating'
                            ? 'bg-[var(--sl-color-bg)]/60 text-[var(--sl-color-white)] animate-pulse'
                            : 'bg-[var(--sl-color-bg)]/20 text-[var(--sl-color-gray-3)]/50'
                      )}
                      style={{
                        transitionDelay: phase === 'hibernating' ? `${i * 100}ms` : '0ms',
                      }}
                    >
                      <item.icon className={cn('h-3.5 w-3.5', item.color)} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className={cn(
                'mt-3 flex items-center justify-between text-xs transition-opacity duration-300',
                phase === 'hibernated' ? 'opacity-100' : 'opacity-40'
              )}>
                <span className="text-[var(--sl-color-gray-2)]">Redundancy</span>
                <span className="font-mono text-blue-500">3x geo</span>
              </div>
            </div>
          </div>

          {/* Status bar */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-500',
              phase === 'active' && 'bg-[var(--sl-color-accent)]/10 text-[var(--sl-color-accent)]',
              phase === 'hibernating' && 'bg-amber-500/10 text-amber-400',
              phase === 'hibernated' && 'bg-blue-500/10 text-blue-400',
              phase === 'waking' && 'bg-[var(--sl-color-accent)]/10 text-[var(--sl-color-accent)]',
            )}>
              {isTransferring && (
                <Loader className={cn(
                  'h-4 w-4 animate-spin',
                  phase === 'hibernating' ? 'text-amber-500' : 'text-[var(--sl-color-accent)]'
                )} />
              )}
              {!isTransferring && (
                <span className={cn(
                  'w-2 h-2 rounded-full',
                  phase === 'active' && 'bg-[var(--sl-color-accent)] animate-pulse',
                  phase === 'hibernated' && 'bg-blue-500',
                )} />
              )}
              {phase === 'active' && 'Running — fast NVMe access'}
              {phase === 'hibernating' && 'Saving state to durable storage...'}
              {phase === 'hibernated' && 'Hibernated — pay only for storage'}
              {phase === 'waking' && 'Restoring state — instant wake'}
            </div>
            <p className="text-xs text-[var(--sl-color-gray-3)]/50">
              Hover to pause
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
