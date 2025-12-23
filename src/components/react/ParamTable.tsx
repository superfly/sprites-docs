import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

type ParamType = 'string' | 'integer' | 'boolean' | 'object' | 'array' | 'number'

const typeStyles: Record<ParamType, string> = {
  string: 'bg-violet-500/10 text-violet-400',
  integer: 'bg-blue-500/10 text-blue-400',
  number: 'bg-blue-500/10 text-blue-400',
  boolean: 'bg-amber-500/10 text-amber-400',
  object: 'bg-emerald-500/10 text-emerald-400',
  array: 'bg-pink-500/10 text-pink-400',
}

interface ParamProps {
  name: string
  type: ParamType
  required?: boolean
  default?: string
  description: string
  children?: ReactNode
}

export function Param({ name, type, required, default: defaultValue, description, children }: ParamProps) {
  return (
    <div className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0 border-b border-[var(--sl-color-hairline)] last:border-0">
      <div className="flex items-center gap-2 flex-wrap">
        <code className="font-mono text-sm font-medium text-[var(--sl-color-white)]">{name}</code>
        <span className={cn('px-1.5 py-0.5 text-xs font-medium', typeStyles[type] || typeStyles.string)}>
          {type}
        </span>
        {required && (
          <span className="px-1.5 py-0.5 text-xs font-medium bg-red-500/10 text-red-400">
            required
          </span>
        )}
        {defaultValue && (
          <span className="text-xs text-[var(--sl-color-gray-2)]">
            default: <code className="font-mono">{defaultValue}</code>
          </span>
        )}
      </div>
      <p className="text-sm text-[var(--sl-color-gray-2)] m-0">{description}</p>
      {children && (
        <div className="mt-1 text-sm text-[var(--sl-color-gray-2)] [&_code]:text-xs">
          {children}
        </div>
      )}
    </div>
  )
}

interface ParamTableProps {
  children: ReactNode
}

export function ParamTable({ children }: ParamTableProps) {
  return (
    <div className="param-table-wrapper my-4 border border-[var(--sl-color-hairline)] bg-[var(--sl-color-bg-nav)]">
      <div className="px-4 py-2 border-b border-[var(--sl-color-hairline)] bg-[var(--sl-color-bg-sidebar)]">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--sl-color-gray-2)]">
          Parameters
        </span>
      </div>
      <div className="px-4 py-3 divide-y divide-[var(--sl-color-hairline)]">
        {children}
      </div>
    </div>
  )
}

// Alternative: inline params for simple cases
interface ParamInlineProps {
  params: Array<{
    name: string
    type: ParamType
    required?: boolean
    default?: string
    description: string
  }>
}

export function ParamInline({ params }: ParamInlineProps) {
  return (
    <ParamTable>
      {params.map((param) => (
        <Param key={param.name} {...param} />
      ))}
    </ParamTable>
  )
}
