import { useState } from 'react';
import { Switch } from '@/components/ui/switch';

export const HOURLY_RATES = {
  cpu: 0.07,
  ram: 0.04375,
  storageHot: 0.5,
  storageCold: 0.02,
};

export function PricingRates() {
  const [perSecond, setPerSecond] = useState(true);

  const formatRate = (hourlyRate: number) => {
    if (perSecond) {
      return `$${(hourlyRate / 3600).toFixed(8)}`;
    }
    return `$${hourlyRate.toFixed(4)}`;
  };

  return (
    <div className="my-6 space-y-3">
      <div className="flex items-center justify-end gap-2 text-sm">
        <span
          className={
            perSecond
              ? 'text-[var(--sl-color-gray-2)]'
              : 'text-[var(--sl-color-white)] font-medium'
          }
        >
          Hourly
        </span>
        <Switch checked={perSecond} onCheckedChange={setPerSecond} />
        <span
          className={
            perSecond
              ? 'text-[var(--sl-color-white)] font-medium'
              : 'text-[var(--sl-color-gray-2)]'
          }
        >
          Per Second
        </span>
      </div>

      <div className="space-y-3">
        <RateCard
          title="CPU Time"
          rate={formatRate(HOURLY_RATES.cpu)}
          unit={perSecond ? '/vCPU-second' : '/vCPU-hour'}
        />
        <RateCard
          title="Memory Time"
          rate={formatRate(HOURLY_RATES.ram)}
          unit={perSecond ? '/GB-second' : '/GB-hour'}
        />
        <RateCard
          title="Hot Storage"
          rate={`$${HOURLY_RATES.storageHot.toFixed(2)}`}
          unit="/GB-month"
          description="Local NVMe cache for active working data, sampled every few seconds."
        />
        <RateCard
          title="Cold Storage"
          rate={`$${HOURLY_RATES.storageCold.toFixed(2)}`}
          unit="/GB-month"
          description="Object storage for persistent data, measured hourly."
        />
      </div>

      <p className="text-xs text-[var(--sl-color-gray-2)] pt-2 border-t border-[var(--sl-color-hairline)]">
        All compute resources are billed per second. Hot storage is sampled
        every few seconds while active; cold storage is measured hourly.
      </p>
    </div>
  );
}

function RateCard({
  title,
  rate,
  unit,
  description,
}: {
  title: string;
  rate: string;
  unit: string;
  description?: string;
}) {
  return (
    <div className="border border-[var(--sl-color-hairline)] bg-[var(--sl-color-bg-sidebar)] p-4">
      <div className="text-xs font-medium text-[var(--sl-color-gray-2)] uppercase tracking-wide">
        {title}
      </div>
      <div className="flex items-baseline gap-1.5 mt-1">
        <span className="text-2xl font-bold text-[var(--sl-color-accent)] font-mono tabular-nums">
          {rate}
        </span>
        <span className="text-sm text-[var(--sl-color-gray-2)]">{unit}</span>
      </div>
      {description && (
        <p className="text-xs text-[var(--sl-color-gray-2)] mt-2">
          {description}
        </p>
      )}
    </div>
  );
}
