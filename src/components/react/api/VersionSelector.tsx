'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  API_VERSIONS,
  type APIVersion,
  buildVersionedPath,
  getPageFromPath,
  getVersionFromPath,
} from '@/lib/api-versions';

const STORAGE_KEY = 'sprites-api-version';

interface VersionSelectorProps {
  currentPath: string;
}

function BadgeIcon({ badge }: { badge?: APIVersion['badge'] }) {
  if (!badge) return null;

  const colors = {
    dev: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
    stable: 'bg-green-500/20 text-green-600 dark:text-green-400',
    deprecated: 'bg-red-500/20 text-red-600 dark:text-red-400',
  };

  const labels = {
    dev: 'dev',
    stable: 'stable',
    deprecated: 'old',
  };

  return (
    <span
      className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${colors[badge]}`}
    >
      {labels[badge]}
    </span>
  );
}

export function VersionSelector({ currentPath }: VersionSelectorProps) {
  const currentVersionId = getVersionFromPath(currentPath);
  const currentPage = getPageFromPath(currentPath);
  const currentVersion = API_VERSIONS.find((v) => v.id === currentVersionId);

  if (!currentVersion || API_VERSIONS.length <= 1) {
    // Don't show selector if only one version or invalid path
    return null;
  }

  const handleVersionChange = (newVersionId: string) => {
    // Save preference and navigate
    localStorage.setItem(STORAGE_KEY, newVersionId);
    const newPath = buildVersionedPath(newVersionId, currentPage);
    window.location.href = newPath;
  };

  return (
    <Select value={currentVersionId || ''} onValueChange={handleVersionChange}>
      <SelectTrigger className="w-full h-9 text-sm bg-[var(--sl-color-bg)] border-[var(--sl-color-gray-5)]">
        <SelectValue>
          <div className="flex items-center gap-2">
            <span>{currentVersion.label}</span>
            <BadgeIcon badge={currentVersion.badge} />
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="min-w-[200px]">
        {API_VERSIONS.map((version) => (
          <SelectItem key={version.id} value={version.id} className="py-2">
            <div className="flex items-center gap-2">
              <span>{version.label}</span>
              <BadgeIcon badge={version.badge} />
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
