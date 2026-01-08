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
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';

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
    <Item asChild variant="outline">
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="no-underline"
      >
        {IconComponent && (
          <ItemMedia className="text-primary">
            <IconComponent size={16} strokeWidth={1.5} />
          </ItemMedia>
        )}
        <ItemContent>
          <ItemTitle>
            {title}
            {isExternal && (
              <ArrowUpRight size={12} className="text-muted-foreground" />
            )}
          </ItemTitle>
          <ItemDescription className="text-xs">{description}</ItemDescription>
        </ItemContent>
      </a>
    </Item>
  );
};

export default LinkCard;
