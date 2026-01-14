import { categoryOrder, categoryTitles, commands } from './commands.js';
import type { CommandDefinition, ParsedHelp, ParsedOption } from './types.js';

const AUTO_GEN_START =
  '{/* AUTO-GENERATED-CONTENT:START - Do not edit this section */}';
const AUTO_GEN_END = '{/* AUTO-GENERATED-CONTENT:END */}';

/**
 * Escape angle brackets in text to prevent MDX from interpreting them as JSX
 */
function escapeMdx(text: string): string {
  // Escape < and > that look like HTML/JSX tags
  // But preserve code blocks and backtick-wrapped content
  return text
    .replace(/<([a-zA-Z][a-zA-Z0-9-]*)>/g, '`<$1>`') // <name> -> `<name>`
    .replace(/<\/([a-zA-Z][a-zA-Z0-9-]*)>/g, '`</$1>`'); // </name> -> `</name>`
}

/**
 * Generate the full commands.mdx content
 */
export function generateCommandsMdx(
  helpOutputs: Map<string, ParsedHelp>,
  globalOptions: ParsedOption[],
  manualSections: string,
): string {
  const sections: string[] = [];

  // Frontmatter and imports
  sections.push(`---
title: CLI Commands Reference
description: Complete reference for all Sprites CLI commands
---

import { Callout, LinkCard, CardGrid } from '@/components/react';

Complete reference for all \`sprite\` CLI commands.

${AUTO_GEN_START}

${generateGlobalOptionsSection(globalOptions)}

${generateCommandSections(helpOutputs)}

${AUTO_GEN_END}

${manualSections}`);

  return sections.join('\n');
}

/**
 * Generate the global options section
 */
function generateGlobalOptionsSection(options: ParsedOption[]): string {
  if (options.length === 0) {
    return '';
  }

  const lines = [
    '## Global Options',
    '',
    'These options work with any command:',
    '',
  ];

  lines.push('| Option | Description |');
  lines.push('|--------|-------------|');

  for (const opt of options) {
    const optStr = formatOptionForTable(opt);
    lines.push(`| ${optStr} | ${escapeMdx(opt.description)} |`);
  }

  return lines.join('\n');
}

/**
 * Format an option for display in a table
 */
function formatOptionForTable(opt: ParsedOption): string {
  const parts: string[] = [];
  if (opt.short) {
    parts.push(`\`${opt.short}\``);
  }
  if (opt.long && opt.long !== opt.short) {
    parts.push(`\`${opt.long}\``);
  }
  if (opt.argument) {
    parts[parts.length - 1] += ` ${opt.argument}`;
  }
  return parts.join(', ');
}

/**
 * Generate all command sections grouped by category
 */
function generateCommandSections(helpOutputs: Map<string, ParsedHelp>): string {
  const sections: string[] = [];

  for (const category of categoryOrder) {
    const title = categoryTitles[category];
    const categoryCommands = commands.filter(
      (cmd) => cmd.category === category,
    );

    if (categoryCommands.length === 0) continue;

    sections.push(`## ${title}`);
    sections.push('');

    for (const cmd of categoryCommands) {
      const help = helpOutputs.get(cmd.name);
      sections.push(generateCommandSection(cmd, help));
    }
  }

  return sections.join('\n');
}

/**
 * Generate a section for a single command
 */
function generateCommandSection(
  cmd: CommandDefinition,
  help: ParsedHelp | undefined,
): string {
  const lines: string[] = [];

  // Command heading
  lines.push(`### \`${cmd.name}\``);
  lines.push('');

  // Description
  if (help?.description) {
    lines.push(escapeMdx(help.description));
    lines.push('');
  }

  // Usage
  if (help?.usage) {
    lines.push('```bash');
    lines.push(help.usage);
    lines.push('```');
    lines.push('');
  } else {
    // Fallback usage from command name
    lines.push('```bash');
    lines.push(cmd.name);
    lines.push('```');
    lines.push('');
  }

  // Aliases
  if (cmd.aliases && cmd.aliases.length > 0) {
    const aliasStr = cmd.aliases.map((a) => `\`${a}\``).join(', ');
    lines.push(`**Aliases:** ${aliasStr}`);
    lines.push('');
  }

  // Options
  if (help?.options && help.options.length > 0) {
    lines.push('**Options:**');
    for (const opt of help.options) {
      const optStr = formatOptionInline(opt);
      lines.push(`- ${optStr} - ${escapeMdx(opt.description)}`);
    }
    lines.push('');
  }

  // Notes
  if (help?.notes && help.notes.length > 0) {
    for (const note of help.notes) {
      lines.push(`> ${escapeMdx(note)}`);
    }
    lines.push('');
  }

  // Examples
  if (help?.examples && help.examples.length > 0) {
    lines.push('**Examples:**');
    lines.push('```bash');
    for (const example of help.examples) {
      lines.push(example);
    }
    lines.push('```');
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Format an option for inline display
 */
function formatOptionInline(opt: ParsedOption): string {
  const parts: string[] = [];
  if (opt.short && opt.long && opt.short !== opt.long) {
    parts.push(`\`${opt.short}, ${opt.long}\``);
  } else {
    parts.push(`\`${opt.long || opt.short}\``);
  }
  if (opt.argument) {
    parts[0] = `${parts[0].slice(0, -1)} ${opt.argument}\``;
  }
  return parts.join('');
}

/**
 * Extract manual sections from existing commands.mdx
 */
export function extractManualSections(existingContent: string): string {
  // Find content after AUTO-GENERATED-CONTENT:END
  const endMarker = AUTO_GEN_END;
  const endIndex = existingContent.indexOf(endMarker);

  if (endIndex === -1) {
    // No auto-generated section, extract known manual sections
    return extractKnownManualSections(existingContent);
  }

  // Get everything after the end marker
  const afterEnd = existingContent.slice(endIndex + endMarker.length);
  return afterEnd.trim();
}

/**
 * Extract known manual sections from content without markers
 */
function extractKnownManualSections(content: string): string {
  const manualSectionHeaders = [
    '## Exit Codes',
    '## Environment Variables',
    '## Configuration Files',
    '## Examples',
    '## Related Documentation',
  ];

  let result = '';
  let inManualSection = false;
  let currentSection = '';

  const lines = content.split('\n');

  for (const line of lines) {
    // Check if we're entering a manual section
    for (const header of manualSectionHeaders) {
      if (line.startsWith(header)) {
        inManualSection = true;
        if (currentSection) {
          result += `${currentSection}\n`;
        }
        currentSection = `${line}\n`;
        break;
      }
    }

    // If in manual section, keep accumulating
    if (inManualSection) {
      // Check if we hit a new top-level header that's not manual
      if (
        line.startsWith('## ') &&
        !manualSectionHeaders.some((h) => line.startsWith(h))
      ) {
        // End of manual sections
        if (currentSection) {
          result += currentSection;
        }
        break;
      }
      if (!line.startsWith(currentSection.split('\n')[0])) {
        currentSection += `${line}\n`;
      }
    }
  }

  // Add final section
  if (currentSection) {
    result += currentSection;
  }

  return result.trim();
}

/**
 * Default manual sections if none exist
 */
export function getDefaultManualSections(): string {
  return `## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Command not found |
| 126 | Command cannot execute |
| 127 | Command not found (in sprite) |
| 128+ | Command terminated by signal |

## Environment Variables

| Variable | Description |
|----------|-------------|
| \`SPRITE_TOKEN\` | API token override (legacy; falls back if no stored token) |
| \`SPRITE_URL\` | Direct sprite URL (for local/dev direct connections) |
| \`SPRITES_API_URL\` | API URL override (default: \`https://api.sprites.dev\`) |

## Configuration Files

### Global Config

\`~/.sprites/sprites.json\` (managed by the CLI; format may evolve):
\`\`\`json
{
  "version": "1",
  "current_selection": {
    "url": "https://api.sprites.dev",
    "org": "personal"
  },
  "urls": {
    "https://api.sprites.dev": {
      "url": "https://api.sprites.dev",
      "orgs": {
        "personal": {
          "name": "personal",
          "keyring_key": "sprites-cli:<user-id>",
          "use_keyring": true,
          "sprites": {}
        }
      }
    }
  }
}
\`\`\`

### Local Context

\`.sprite\` (in project directory):
\`\`\`json
{
  "organization": "personal",
  "sprite": "my-project-sprite"
}
\`\`\`

## Related Documentation

<CardGrid client:load>
  <LinkCard
    href="/cli/installation"
    title="Installation"
    description="Install the Sprites CLI on your platform"
    icon="rocket"
    client:load
  />
  <LinkCard
    href="/cli/authentication"
    title="Authentication"
    description="Set up your Fly.io account and manage tokens"
    icon="settings"
    client:load
  />
  <LinkCard
    href="/working-with-sprites"
    title="Working with Sprites"
    description="Beyond the basics guide"
    icon="book-open"
    client:load
  />
  <LinkCard
    href="/concepts/checkpoints"
    title="Checkpoints"
    description="Save and restore sprite state"
    icon="folder"
    client:load
  />
</CardGrid>`;
}
