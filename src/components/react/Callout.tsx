import type { ReactNode } from 'react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { Info, AlertTriangle, AlertCircle, Lightbulb } from 'lucide-react'

interface CalloutProps {
  type?: 'info' | 'warning' | 'danger' | 'tip'
  title?: string
  children: ReactNode
}

const icons = {
  info: Info,
  warning: AlertTriangle,
  danger: AlertCircle,
  tip: Lightbulb,
}

const styles = {
  info: 'border-blue-500/30 bg-blue-500/5 [&>svg]:text-blue-500',
  warning: 'border-amber-500/30 bg-amber-500/5 [&>svg]:text-amber-500',
  danger: 'border-red-500/30 bg-red-500/5 [&>svg]:text-red-500',
  tip: 'border-emerald-500/30 bg-emerald-500/5 [&>svg]:text-emerald-500',
}

const textStyles = {
  info: 'text-blue-400',
  warning: 'text-amber-400',
  danger: 'text-red-400',
  tip: 'text-emerald-400',
}

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const Icon = icons[type]

  return (
    <Alert className={cn('my-6 rounded-none', styles[type], textStyles[type])}>
      <Icon className="h-4 w-4" />
      {title && <AlertTitle className={textStyles[type]}>{title}</AlertTitle>}
      <AlertDescription className={cn('[&>p]:m-0', textStyles[type])}>
        {children}
      </AlertDescription>
    </Alert>
  )
}
