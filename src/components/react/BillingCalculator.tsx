import {
  AlertTriangle,
  Box,
  Check,
  Cpu,
  HardDrive,
  MemoryStick,
  Minus,
  Plus,
} from 'lucide-react';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// Fixed Sprite resources per active hour
const VCPUS = 8;
const RAM_GB = 4;

// Level 10 Plan included credits
const PLAN = {
  name: 'Level 10',
  price: 20,
  maxSprites: 10,
  cpuHours: 450,
  ramGBHours: 1800,
  storageGB: 50,
};

// Pay-as-you-go (no base price, no included credits)
const PAYG = {
  name: 'Pay As You Go',
  price: 0,
  maxSprites: 3,
  cpuHours: 0,
  ramGBHours: 0,
  storageGB: 0,
};

// Usage pricing (same for overage and PAYG)
const RATES = {
  cpuHour: 0.0275,
  ramGBHour: 0.04375,
  storageGB: 0.5,
};

type BillingMode = 'plan' | 'payg';

export function BillingCalculator() {
  const [billingMode, setBillingMode] = useState<BillingMode>('payg');
  const [sprites, setSprites] = useState(1);
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [storageGB, setStorageGB] = useState(10);
  const [perSecond, setPerSecond] = useState(true);

  const currentPlan = billingMode === 'plan' ? PLAN : PAYG;
  const isPAYG = billingMode === 'payg';
  const effectiveSprites = Math.min(sprites, currentPlan.maxSprites);

  // Calculate monthly usage
  const weeksPerMonth = 4.33;
  const activeHoursPerMonth =
    hoursPerDay * daysPerWeek * weeksPerMonth * effectiveSprites;

  // Usage in plan units
  const cpuHoursUsed = VCPUS * activeHoursPerMonth;
  const ramGBHoursUsed = RAM_GB * activeHoursPerMonth;
  const storageGBUsed = storageGB * effectiveSprites;

  // Calculate percentages of plan limits (for plan mode)
  const cpuPercent =
    currentPlan.cpuHours > 0
      ? (cpuHoursUsed / currentPlan.cpuHours) * 100
      : 100;
  const ramPercent =
    currentPlan.ramGBHours > 0
      ? (ramGBHoursUsed / currentPlan.ramGBHours) * 100
      : 100;
  const storagePercent =
    currentPlan.storageGB > 0
      ? (storageGBUsed / currentPlan.storageGB) * 100
      : 100;

  // Calculate usage costs (overage for plan, full cost for PAYG)
  const cpuCost =
    Math.max(0, cpuHoursUsed - currentPlan.cpuHours) * RATES.cpuHour;
  const ramCost =
    Math.max(0, ramGBHoursUsed - currentPlan.ramGBHours) * RATES.ramGBHour;
  const storageCost =
    Math.max(0, storageGBUsed - currentPlan.storageGB) * RATES.storageGB;
  const usageCost = cpuCost + ramCost + storageCost;

  const totalCost = currentPlan.price + usageCost;
  const withinPlan = !isPAYG && usageCost === 0;

  return (
    <div className="my-8 rounded-none border border-[var(--sl-color-hairline)] bg-[var(--sl-color-bg-nav)] overflow-hidden">
      <div className="border-b border-[var(--sl-color-hairline)] bg-[var(--sl-color-bg-sidebar)] px-5 py-3">
        <div
          className="flex justify-between items-center"
          style={{ minHeight: '36px' }}
        >
          <Select
            value={billingMode}
            onValueChange={(v) => setBillingMode(v as BillingMode)}
          >
            <SelectTrigger className="h-9 w-[240px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="payg">Pay As You Go</SelectItem>
              <SelectItem value="plan">Level 10 Plan ($20/mo)</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2.5 text-sm h-9">
            <span
              className={
                perSecond
                  ? 'text-[var(--sl-color-gray-3)]'
                  : 'text-[var(--sl-color-text)]'
              }
            >
              Hourly
            </span>
            <Switch checked={perSecond} onCheckedChange={setPerSecond} />
            <span
              className={
                perSecond
                  ? 'text-[var(--sl-color-text)]'
                  : 'text-[var(--sl-color-gray-3)]'
              }
            >
              Per Second
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Inputs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
          <NumberInput
            label="Sprites"
            value={effectiveSprites}
            onChange={setSprites}
            min={1}
            max={currentPlan.maxSprites}
            step={1}
            icon={Box}
          />
          <NumberInput
            label={perSecond ? 'Seconds / day' : 'Hours / day'}
            value={perSecond ? hoursPerDay * 3600 : hoursPerDay}
            onChange={(v) => setHoursPerDay(perSecond ? v / 3600 : v)}
            min={perSecond ? 1800 : 0.5}
            max={perSecond ? 86400 : 24}
            step={perSecond ? 1800 : 0.5}
          />
          <NumberInput
            label="Days / week"
            value={daysPerWeek}
            onChange={setDaysPerWeek}
            min={1}
            max={7}
            step={1}
          />
          <NumberInput
            label="Storage (GB)"
            value={storageGB}
            onChange={setStorageGB}
            min={1}
            max={100}
            step={1}
            icon={HardDrive}
          />
        </div>

        {/* Usage vs Plan */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--sl-color-gray-2)]">
              {isPAYG ? 'Monthly usage' : 'Monthly usage vs. included credits'}
            </span>
            <span className="text-xs text-[var(--sl-color-gray-2)]">
              ~{activeHoursPerMonth.toFixed(0)} active hours/mo
            </span>
          </div>

          <UsageBar
            icon={Cpu}
            label={perSecond ? 'CPU Seconds' : 'CPU Hours'}
            used={perSecond ? cpuHoursUsed * 3600 : cpuHoursUsed}
            included={
              perSecond ? currentPlan.cpuHours * 3600 : currentPlan.cpuHours
            }
            percent={cpuPercent}
            unit={perSecond ? 'sec' : 'hrs'}
            color="blue"
            isPAYG={isPAYG}
            cost={cpuCost}
          />
          <UsageBar
            icon={MemoryStick}
            label={perSecond ? 'RAM Seconds' : 'RAM Hours'}
            used={perSecond ? ramGBHoursUsed * 3600 : ramGBHoursUsed}
            included={
              perSecond ? currentPlan.ramGBHours * 3600 : currentPlan.ramGBHours
            }
            percent={ramPercent}
            unit={perSecond ? 'GB-sec' : 'GB-hrs'}
            color="violet"
            isPAYG={isPAYG}
            cost={ramCost}
          />
          <UsageBar
            icon={HardDrive}
            label="Storage"
            used={storageGBUsed}
            included={currentPlan.storageGB}
            percent={storagePercent}
            unit="GB"
            color="emerald"
            isPAYG={isPAYG}
            cost={storageCost}
          />
        </div>

        {/* Total */}
        <div className="pt-4 border-t border-[var(--sl-color-hairline)] space-y-3">
          {!isPAYG && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--sl-color-gray-2)]">
                {currentPlan.name} Plan
              </span>
              <span className="font-mono text-sm">
                ${currentPlan.price.toFixed(2)}
              </span>
            </div>
          )}
          {isPAYG ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--sl-color-gray-2)]">
                Usage charges
              </span>
              <span className="font-mono text-sm">${usageCost.toFixed(2)}</span>
            </div>
          ) : (
            usageCost > 0 && (
              <div className="flex items-center justify-between text-amber-500">
                <span className="text-sm">Estimated overage</span>
                <span className="font-mono text-sm">
                  +${usageCost.toFixed(2)}
                </span>
              </div>
            )
          )}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--sl-color-hairline)]">
            <div className="flex items-center gap-2">
              <span className="font-medium">Estimated total</span>
              {withinPlan && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <Check className="h-3 w-3" />
                  Within plan
                </span>
              )}
              {!isPAYG && usageCost > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="h-3 w-3" />
                  Overage
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-[var(--sl-color-accent)]">
                ${totalCost.toFixed(2)}
              </span>
              <span className="text-[var(--sl-color-gray-2)] text-sm">/mo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  icon: Icon,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  icon?: typeof Cpu;
}) {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);

  // Sync input when value changes externally (from buttons)
  const displayValue = step < 1 ? value.toFixed(1) : value.toString();
  const shownValue = isFocused ? inputValue : displayValue;

  const decrement = () => onChange(Math.max(min, value - step));
  const increment = () => onChange(Math.min(max, value + step));

  const handleFocus = () => {
    setInputValue(displayValue);
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const val = parseFloat(inputValue);
    if (!Number.isNaN(val)) {
      onChange(Math.min(max, Math.max(min, val)));
    } else {
      setInputValue(displayValue);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs text-[var(--sl-color-gray-2)] flex items-center gap-1.5 h-4">
        {Icon ? <Icon className="h-3 w-3" /> : <span className="w-3" />}
        {label}
      </label>
      <div className="flex w-full">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          className="shrink-0 w-7 h-7 flex items-center justify-center border border-[var(--sl-color-hairline)] bg-[var(--sl-color-bg)] hover:bg-[var(--sl-color-bg-sidebar)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus className="h-3 w-3" />
        </button>
        <input
          type="text"
          inputMode="decimal"
          value={shownValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="flex-1 h-7 bg-[var(--sl-color-bg)] border-y border-[var(--sl-color-hairline)] font-mono text-sm font-medium text-center min-w-[3rem] focus:outline-none focus:ring-1 focus:ring-[var(--sl-color-accent)]"
        />
        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          className="shrink-0 w-7 h-7 flex items-center justify-center border border-[var(--sl-color-hairline)] bg-[var(--sl-color-bg)] hover:bg-[var(--sl-color-bg-sidebar)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function UsageBar({
  icon: Icon,
  label,
  used,
  included,
  percent,
  unit,
  color,
  isPAYG = false,
  cost = 0,
}: {
  icon: typeof Cpu;
  label: string;
  used: number;
  included: number;
  percent: number;
  unit: string;
  color: 'blue' | 'violet' | 'emerald';
  isPAYG?: boolean;
  cost?: number;
}) {
  const isOver = !isPAYG && percent > 100;
  const displayPercent = isPAYG ? 100 : Math.min(percent, 100);

  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toFixed(0);
  };

  const colorClasses = {
    blue: {
      bar: 'bg-blue-500',
      icon: 'text-blue-500',
      overBar: 'bg-amber-500',
    },
    violet: {
      bar: 'bg-violet-500',
      icon: 'text-violet-500',
      overBar: 'bg-amber-500',
    },
    emerald: {
      bar: 'bg-emerald-500',
      icon: 'text-emerald-500',
      overBar: 'bg-amber-500',
    },
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-3.5 w-3.5', colorClasses[color].icon)} />
          <span className="text-[var(--sl-color-gray-2)]">{label}</span>
        </div>
        {isPAYG ? (
          <span className="font-mono text-xs">
            {formatNumber(used)} {unit} · ${cost.toFixed(2)}
          </span>
        ) : (
          <span className={cn('font-mono text-xs', isOver && 'text-amber-500')}>
            {formatNumber(used)} / {formatNumber(included)} {unit}
          </span>
        )}
      </div>
      {!isPAYG && (
        <div className="h-2 w-full rounded-full bg-[var(--sl-color-bg-sidebar)] overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-300 rounded-full',
              isOver ? colorClasses[color].overBar : colorClasses[color].bar,
            )}
            style={{ width: `${displayPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}
