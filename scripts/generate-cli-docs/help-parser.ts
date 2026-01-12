import type { ParsedHelp, ParsedOption } from './types.js';

/**
 * Parse CLI help output into structured data
 */
export function parseHelpOutput(command: string, output: string): ParsedHelp {
  const lines = output.split('\n');
  const result: ParsedHelp = {
    command,
    usage: '',
    description: '',
    options: [],
    notes: [],
    examples: [],
  };

  let currentSection: 'none' | 'usage' | 'options' | 'notes' | 'examples' =
    'none';
  let currentOption: Partial<ParsedOption> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Skip empty lines at the start
    if (!trimmedLine && currentSection === 'none' && !result.description) {
      continue;
    }

    // First non-empty line is the description
    if (currentSection === 'none' && !result.description && trimmedLine) {
      result.description = trimmedLine;
      continue;
    }

    // Detect section headers
    if (trimmedLine.startsWith('Usage:')) {
      currentSection = 'usage';
      // Usage might be on same line
      const usagePart = trimmedLine.replace('Usage:', '').trim();
      if (usagePart) {
        result.usage = usagePart;
      }
      continue;
    }

    if (trimmedLine === 'Options:' || trimmedLine.startsWith('Options:')) {
      // Save any pending option
      if (currentOption?.long) {
        result.options.push(currentOption as ParsedOption);
      }
      currentSection = 'options';
      currentOption = null;
      continue;
    }

    if (trimmedLine === 'Notes:' || trimmedLine.startsWith('Notes:')) {
      // Save any pending option
      if (currentOption?.long) {
        result.options.push(currentOption as ParsedOption);
      }
      currentSection = 'notes';
      currentOption = null;
      continue;
    }

    if (trimmedLine === 'Examples:' || trimmedLine.startsWith('Examples:')) {
      currentSection = 'examples';
      continue;
    }

    // Parse content based on current section
    switch (currentSection) {
      case 'usage':
        if (trimmedLine && !result.usage) {
          result.usage = trimmedLine;
        } else if (trimmedLine) {
          result.usage += ` ${trimmedLine}`;
        }
        break;

      case 'options':
        parseOptionLine(line, trimmedLine, result, currentOption, (opt) => {
          currentOption = opt;
        });
        break;

      case 'notes':
        if (trimmedLine) {
          result.notes.push(trimmedLine);
        }
        break;

      case 'examples':
        if (trimmedLine) {
          result.examples.push(trimmedLine);
        }
        break;
    }
  }

  // Save any final pending option
  if (currentOption?.long) {
    result.options.push(currentOption as ParsedOption);
  }

  return result;
}

/**
 * Parse a line in the options section
 * Go flag format: -flag or -flag type \n\t description
 */
function parseOptionLine(
  line: string,
  trimmedLine: string,
  result: ParsedHelp,
  currentOption: Partial<ParsedOption> | null,
  setCurrentOption: (opt: Partial<ParsedOption> | null) => void,
): void {
  // Check if this is a new option (starts with -)
  const optionMatch = trimmedLine.match(
    /^(-\w)(?:,\s*|\s+)(--[\w-]+)?(?:\s+(\S+))?(?:\s+(.+))?$/,
  );
  const longOnlyMatch = trimmedLine.match(
    /^(--[\w-]+)(?:\s+(\S+))?(?:\s+(.+))?$/,
  );
  const goStyleMatch = trimmedLine.match(/^-(\w+)(?:\s+(\w+))?$/);

  if (optionMatch) {
    // Save previous option
    if (currentOption?.long) {
      result.options.push(currentOption as ParsedOption);
    }

    setCurrentOption({
      short: optionMatch[1],
      long: optionMatch[2] || optionMatch[1],
      argument: optionMatch[3],
      description: optionMatch[4] || '',
    });
  } else if (longOnlyMatch) {
    // Save previous option
    if (currentOption?.long) {
      result.options.push(currentOption as ParsedOption);
    }

    setCurrentOption({
      long: longOnlyMatch[1],
      argument: longOnlyMatch[2],
      description: longOnlyMatch[3] || '',
    });
  } else if (goStyleMatch) {
    // Go-style flag: -flag or -flag type
    if (currentOption?.long) {
      result.options.push(currentOption as ParsedOption);
    }

    const flagName = goStyleMatch[1];
    const flagType = goStyleMatch[2];

    setCurrentOption({
      short: `-${flagName.charAt(0)}`,
      long: `--${flagName}`,
      argument: flagType ? `<${flagType}>` : undefined,
      description: '',
    });
  } else if (line.startsWith('\t') || line.startsWith('    ')) {
    // Continuation line (description)
    if (currentOption) {
      if (currentOption.description) {
        currentOption.description += ` ${trimmedLine}`;
      } else {
        currentOption.description = trimmedLine;
      }
    }
  }
}

/**
 * Parse the main CLI help output to extract global options
 */
export function parseMainHelp(output: string): {
  globalOptions: ParsedOption[];
  commands: string[];
} {
  const result = {
    globalOptions: [] as ParsedOption[],
    commands: [] as string[],
  };

  const lines = output.split('\n');
  let inGlobalOptions = false;
  let inCommands = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (
      trimmed === 'Global Options:' ||
      trimmed.startsWith('Global Options:')
    ) {
      inGlobalOptions = true;
      inCommands = false;
      continue;
    }

    if (trimmed === 'Commands:' || trimmed.startsWith('Commands:')) {
      inGlobalOptions = false;
      inCommands = true;
      continue;
    }

    // Empty line might end a section
    if (!trimmed) {
      continue;
    }

    if (inGlobalOptions) {
      // Parse global option
      const match = trimmed.match(
        /^(-\w)?,?\s*(--[\w-]+(?:\[=[^\]]+\])?)?\s+(.+)$/,
      );
      if (match) {
        result.globalOptions.push({
          short: match[1],
          long: match[2] || match[1],
          description: match[3],
        });
      }
    }

    if (inCommands) {
      // Parse command line
      const match = trimmed.match(/^(\w[\w\s]*?)(?:\s+\([^)]+\))?\s{2,}(.+)$/);
      if (match) {
        result.commands.push(match[1].trim());
      }
    }
  }

  return result;
}

/**
 * Clean up parsed help data
 */
export function cleanParsedHelp(parsed: ParsedHelp): ParsedHelp {
  return {
    ...parsed,
    description: parsed.description.trim(),
    usage: parsed.usage.trim(),
    options: parsed.options.map((opt) => ({
      ...opt,
      description: opt.description.trim(),
    })),
    notes: parsed.notes.filter((n) => n.trim()),
    examples: parsed.examples.filter((e) => e.trim()),
  };
}
