import {
  ArrowUpRight,
  BookOpen,
  Code,
  Cog,
  FileText,
  Folder,
  HelpCircle,
  Layers,
  LifeBuoy,
  type LucideIcon,
  Play,
  Rocket,
  Settings,
  Terminal,
  Wrench,
  Zap,
} from 'lucide-react';
import type React from 'react';
import SpotlightCard from '../SpotlightCard';

const iconMap: Record<string, LucideIcon> = {
  'arrow-up-right': ArrowUpRight,
  'book-open': BookOpen,
  code: Code,
  cog: Cog,
  'file-text': FileText,
  folder: Folder,
  'help-circle': HelpCircle,
  layers: Layers,
  'life-buoy': LifeBuoy,
  play: Play,
  rocket: Rocket,
  settings: Settings,
  terminal: Terminal,
  wrench: Wrench,
  zap: Zap,
};

interface LinkCardProps {
  href: string;
  title: string;
  description: string;
  icon?: keyof typeof iconMap;
  external?: boolean;
}

const LinkCard: React.FC<LinkCardProps> = ({
  href,
  title,
  description,
  icon,
  external = false,
}) => {
  const isExternal = external || href.startsWith('http');
  const IconComponent = icon ? iconMap[icon] : null;

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="block no-underline group"
    >
      <SpotlightCard
        className="h-full transition-colors hover:border-primary/30"
        spotlightColor="color-mix(in oklch, var(--primary) 15%, transparent)"
      >
        <div className="flex flex-col gap-3">
          {IconComponent && (
            <div className="text-primary">
              <IconComponent size={28} strokeWidth={1.5} />
            </div>
          )}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold text-card-foreground m-0 group-hover:text-primary transition-colors">
              {title}
            </h3>
            {isExternal && (
              <ArrowUpRight
                size={16}
                className="text-muted-foreground flex-shrink-0 mt-1"
              />
            )}
          </div>
          <p className="text-muted-foreground text-sm m-0 leading-relaxed">
            {description}
          </p>
        </div>
      </SpotlightCard>
    </a>
  );
};

export default LinkCard;
