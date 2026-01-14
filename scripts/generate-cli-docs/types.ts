/**
 * Types for CLI documentation generation
 */

export type CommandCategory =
  | 'authentication'
  | 'sprite-management'
  | 'command-execution'
  | 'checkpoints'
  | 'networking'
  | 'utility';

export interface CommandDefinition {
  /** Command name, e.g., "sprite exec" */
  name: string;
  /** Command aliases, e.g., ["sprite x"] */
  aliases?: string[];
  /** Category for grouping in docs */
  category: CommandCategory;
  /** Whether command requires an active sprite */
  requiresSprite: boolean;
  /** Whether command requires authentication */
  requiresAuth: boolean;
  /** Test case to validate command works */
  testCase?: TestCase;
  /** Skip testing (for interactive/destructive commands) */
  skipTest?: boolean;
  /** Help command to run (defaults to "{name} --help") */
  helpCommand?: string[];
}

export interface TestCase {
  /** Arguments to pass to the command */
  args: string[];
  /** Whether the command should succeed */
  expectSuccess: boolean;
  /** Expected output pattern (optional) */
  expectOutput?: RegExp;
  /** Timeout in ms (default: 30000) */
  timeout?: number;
}

export interface CommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}

export interface ParsedHelp {
  /** Raw command name */
  command: string;
  /** Usage line */
  usage: string;
  /** Command description */
  description: string;
  /** Parsed options */
  options: ParsedOption[];
  /** Notes section lines */
  notes: string[];
  /** Example commands */
  examples: string[];
}

export interface ParsedOption {
  /** Short flag, e.g., "-d" */
  short?: string;
  /** Long flag, e.g., "--dir" */
  long: string;
  /** Argument type, e.g., "<path>" */
  argument?: string;
  /** Option description */
  description: string;
}

export interface TestResult {
  command: string;
  success: boolean;
  duration: number;
  error?: string;
}

export interface GenerationReport {
  timestamp: string;
  cliVersion: string;
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  commandsGenerated: string[];
  errors: GenerationError[];
}

export interface GenerationError {
  command: string;
  phase: 'test' | 'help' | 'parse';
  message: string;
  stdout?: string;
  stderr?: string;
}

export interface GeneratorConfig {
  /** Skip running tests (just generate from help) */
  skipTests: boolean;
  /** Output directory for generated docs */
  outputDir: string;
  /** Verbose logging */
  verbose: boolean;
}
