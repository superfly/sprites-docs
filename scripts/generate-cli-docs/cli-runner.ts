import { execSync, spawn } from 'node:child_process';
import type { CommandDefinition, CommandResult, TestResult } from './types.js';

const DEFAULT_TIMEOUT = 30000;
const TEST_SPRITE_PREFIX = 'docs-gen';

/**
 * Run a CLI command and capture output
 */
export async function runCommand(
  args: string[],
  options: { timeout?: number; env?: Record<string, string> } = {},
): Promise<CommandResult> {
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const startTime = Date.now();

  return new Promise<CommandResult>((resolve) => {
    const proc = spawn(args[0], args.slice(1), {
      env: { ...process.env, ...options.env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    const timer = setTimeout(() => {
      proc.kill('SIGTERM');
      resolve({
        success: false,
        stdout,
        stderr: `${stderr}\nCommand timed out`,
        exitCode: 124,
        duration: Date.now() - startTime,
      });
    }, timeout);

    proc.on('close', (code: number | null) => {
      clearTimeout(timer);
      resolve({
        success: code === 0,
        stdout,
        stderr,
        exitCode: code ?? 1,
        duration: Date.now() - startTime,
      });
    });

    proc.on('error', (error: Error) => {
      clearTimeout(timer);
      resolve({
        success: false,
        stdout,
        stderr: error.message,
        exitCode: 1,
        duration: Date.now() - startTime,
      });
    });
  });
}

/**
 * Check if the sprite CLI is installed
 */
export async function checkCliInstalled(): Promise<boolean> {
  try {
    execSync('sprite --help', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the CLI version
 */
export async function getCliVersion(): Promise<string> {
  const result = await runCommand(['sprite', 'upgrade', '--check']);
  // Parse version from output like "Current version: v1.2.3"
  const match = result.stdout.match(/Current version:\s*v?([\d.]+)/i);
  if (match) {
    return match[1];
  }
  // Fallback: try to get from --help or return unknown
  return 'unknown';
}

/**
 * Verify authentication is working
 */
export async function verifyAuthentication(): Promise<boolean> {
  const result = await runCommand(['sprite', 'org', 'list']);
  return result.success;
}

/**
 * Create a test sprite for running commands
 */
export async function createTestSprite(): Promise<string> {
  const spriteName = `${TEST_SPRITE_PREFIX}-${Date.now()}`;
  console.log(`Creating test sprite: ${spriteName}`);

  const result = await runCommand(['sprite', 'create', spriteName], {
    timeout: 120000, // Sprite creation can take a while
  });

  if (!result.success) {
    throw new Error(`Failed to create test sprite: ${result.stderr}`);
  }

  // Set as current sprite
  const useResult = await runCommand(['sprite', 'use', spriteName]);
  if (!useResult.success) {
    // Try to cleanup
    await runCommand(['sprite', 'destroy', '-s', spriteName]);
    throw new Error(`Failed to set test sprite: ${useResult.stderr}`);
  }

  return spriteName;
}

/**
 * Destroy the test sprite
 */
export async function destroyTestSprite(spriteName: string): Promise<void> {
  console.log(`Destroying test sprite: ${spriteName}`);

  const result = await runCommand(
    ['sprite', 'destroy', '-s', spriteName, '--force'],
    {
      timeout: 60000,
    },
  );

  if (!result.success) {
    console.warn(`Warning: Failed to destroy test sprite: ${result.stderr}`);
  }
}

/**
 * Run a test case for a command
 */
export async function runTestCase(
  command: CommandDefinition,
): Promise<TestResult> {
  if (!command.testCase) {
    return {
      command: command.name,
      success: true,
      duration: 0,
      error: 'No test case defined',
    };
  }

  const { args, expectSuccess, expectOutput, timeout } = command.testCase;

  console.log(`  Testing: ${args.join(' ')}`);

  const result = await runCommand(args, { timeout });

  let success = result.success === expectSuccess;
  let error: string | undefined;

  if (success && expectOutput && !expectOutput.test(result.stdout)) {
    success = false;
    error = `Output did not match expected pattern: ${expectOutput}`;
  }

  if (!success && !error) {
    error = result.stderr || result.stdout || 'Command failed';
  }

  return {
    command: command.name,
    success,
    duration: result.duration,
    error,
  };
}

/**
 * Get help output for a command
 */
export async function getHelpOutput(
  command: CommandDefinition,
): Promise<string> {
  // Use custom help command if defined, otherwise derive from name
  const helpArgs = command.helpCommand || [
    ...command.name.split(' '),
    '--help',
  ];

  const result = await runCommand(helpArgs);

  // Help commands might exit with non-zero but still produce output
  if (result.stdout) {
    return result.stdout;
  }

  if (result.stderr) {
    return result.stderr;
  }

  throw new Error(`No help output for ${command.name}`);
}

/**
 * Get the main CLI help output
 */
export async function getMainHelp(): Promise<string> {
  const result = await runCommand(['sprite', '--help']);
  return result.stdout || result.stderr;
}

/**
 * Clean up any orphaned test sprites
 */
export async function cleanupOrphanedTestSprites(): Promise<void> {
  const result = await runCommand(['sprite', 'list']);
  if (!result.success) return;

  const lines = result.stdout.split('\n');
  for (const line of lines) {
    if (line.includes(TEST_SPRITE_PREFIX)) {
      const match = line.match(new RegExp(`(${TEST_SPRITE_PREFIX}-\\d+)`));
      if (match) {
        console.log(`Cleaning up orphaned test sprite: ${match[1]}`);
        await runCommand(['sprite', 'destroy', '-s', match[1], '--force']);
      }
    }
  }
}

/**
 * Run dependent tests that require outputs from previous commands
 */
export async function runDependentTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Test 1: Create checkpoint and capture ID
  console.log('  Testing: sprite checkpoint create (capturing ID)');
  const createResult = await runCommand(['sprite', 'checkpoint', 'create'], {
    timeout: 60000,
  });

  if (!createResult.success) {
    results.push({
      command: 'sprite checkpoint create',
      success: false,
      duration: createResult.duration,
      error: createResult.stderr || 'Failed to create checkpoint',
    });
    return results;
  }

  results.push({
    command: 'sprite checkpoint create',
    success: true,
    duration: createResult.duration,
  });

  // Parse checkpoint ID from output (e.g., "Created checkpoint: v2" or just "v2")
  const checkpointMatch = createResult.stdout.match(/v\d+/);
  const checkpointId = checkpointMatch ? checkpointMatch[0] : null;

  if (!checkpointId) {
    console.log('    Could not parse checkpoint ID, skipping dependent tests');
    return results;
  }

  console.log(`    Captured checkpoint ID: ${checkpointId}`);

  // Test 2: checkpoint info <id>
  console.log(`  Testing: sprite checkpoint info ${checkpointId}`);
  const infoResult = await runCommand([
    'sprite',
    'checkpoint',
    'info',
    checkpointId,
  ]);
  results.push({
    command: 'sprite checkpoint info',
    success: infoResult.success,
    duration: infoResult.duration,
    error: infoResult.success ? undefined : infoResult.stderr,
  });
  console.log(
    `    ${infoResult.success ? 'PASS' : 'FAIL'}: sprite checkpoint info`,
  );

  // Test 3: url update --auth public
  console.log('  Testing: sprite url update --auth public');
  const publicResult = await runCommand([
    'sprite',
    'url',
    'update',
    '--auth',
    'public',
  ]);
  results.push({
    command: 'sprite url update --auth public',
    success: publicResult.success,
    duration: publicResult.duration,
    error: publicResult.success ? undefined : publicResult.stderr,
  });
  console.log(
    `    ${publicResult.success ? 'PASS' : 'FAIL'}: sprite url update --auth public`,
  );

  // Test 4: url update --auth default (restore)
  console.log('  Testing: sprite url update --auth default');
  const defaultResult = await runCommand([
    'sprite',
    'url',
    'update',
    '--auth',
    'default',
  ]);
  results.push({
    command: 'sprite url update --auth default',
    success: defaultResult.success,
    duration: defaultResult.duration,
    error: defaultResult.success ? undefined : defaultResult.stderr,
  });
  console.log(
    `    ${defaultResult.success ? 'PASS' : 'FAIL'}: sprite url update --auth default`,
  );

  // Test 5: restore from checkpoint
  console.log(`  Testing: sprite restore ${checkpointId}`);
  const restoreResult = await runCommand(['sprite', 'restore', checkpointId], {
    timeout: 120000, // Restore can take a while
  });
  results.push({
    command: 'sprite restore',
    success: restoreResult.success,
    duration: restoreResult.duration,
    error: restoreResult.success ? undefined : restoreResult.stderr,
  });
  console.log(`    ${restoreResult.success ? 'PASS' : 'FAIL'}: sprite restore`);

  return results;
}
