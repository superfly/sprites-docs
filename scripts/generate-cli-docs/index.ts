#!/usr/bin/env node
/**
 * CLI Documentation Generator
 *
 * Generates CLI documentation by:
 * 1. Verifying CLI is installed
 * 2. Authenticating with test credentials
 * 3. Creating an ephemeral test sprite
 * 4. Running command tests to validate they work
 * 5. Gathering --help output from all commands
 * 6. Generating MDX documentation
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  checkCliInstalled,
  cleanupOrphanedTestSprites,
  createTestSprite,
  destroyTestSprite,
  getCliVersion,
  getHelpOutput,
  getMainHelp,
  runDependentTests,
  runTestCase,
  verifyAuthentication,
} from './cli-runner.js';
import { commands, getTestableCommands } from './commands.js';
import {
  cleanParsedHelp,
  parseHelpOutput,
  parseMainHelp,
} from './help-parser.js';
import {
  extractManualSections,
  generateCommandsMdx,
  getDefaultManualSections,
} from './mdx-generator.js';
import type { GenerationReport, ParsedHelp } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '../..');

interface Config {
  skipTests: boolean;
  verbose: boolean;
  outputPath: string;
}

function getConfig(): Config {
  return {
    skipTests: process.env.SKIP_CLI_TESTS === 'true',
    verbose:
      process.env.VERBOSE === 'true' || process.argv.includes('--verbose'),
    outputPath: resolve(PROJECT_ROOT, 'src/content/docs/cli/commands.mdx'),
  };
}

async function main(): Promise<void> {
  const config = getConfig();

  console.log('=== Sprites CLI Documentation Generator ===\n');

  const report: GenerationReport = {
    timestamp: new Date().toISOString(),
    cliVersion: 'unknown',
    testsRun: 0,
    testsPassed: 0,
    testsFailed: 0,
    commandsGenerated: [],
    errors: [],
  };

  // Step 1: Check CLI is installed
  console.log('Checking CLI installation...');
  const cliInstalled = await checkCliInstalled();
  if (!cliInstalled) {
    console.error('ERROR: sprite CLI is not installed');
    console.error(
      'Install with: curl -fsSL https://sprites.dev/install.sh | sh',
    );
    process.exit(1);
  }
  console.log('  CLI is installed');

  // Step 2: Get CLI version
  const version = await getCliVersion();
  report.cliVersion = version;
  console.log(`  CLI version: ${version}`);

  // Step 3: Verify authentication (unless skipping tests)
  if (!config.skipTests) {
    console.log('\nVerifying authentication...');
    const token = process.env.SPRITES_TEST_TOKEN || process.env.SPRITE_TOKEN;

    if (token) {
      // Set the token for CLI to use
      process.env.SPRITE_TOKEN = token;
    }

    const authenticated = await verifyAuthentication();
    if (!authenticated) {
      console.error('ERROR: Authentication failed');
      console.error('Set SPRITES_TEST_TOKEN environment variable');
      process.exit(1);
    }
    console.log('  Authentication verified');

    // Cleanup any orphaned test sprites
    console.log('\nCleaning up orphaned test sprites...');
    await cleanupOrphanedTestSprites();
  }

  // Step 4: Create test sprite (if running tests)
  let testSprite: string | undefined;
  if (!config.skipTests) {
    console.log('\nSetting up test environment...');
    try {
      testSprite = await createTestSprite();
      console.log(`  Created test sprite: ${testSprite}`);
    } catch (error) {
      console.error('ERROR: Failed to create test sprite:', error);
      process.exit(1);
    }
  }

  try {
    // Step 5: Run command tests
    if (!config.skipTests) {
      console.log('\nRunning command tests...');
      const testableCommands = getTestableCommands();

      for (const cmd of testableCommands) {
        const result = await runTestCase(cmd);
        report.testsRun++;

        if (result.success) {
          report.testsPassed++;
          console.log(`    PASS: ${cmd.name}`);
        } else {
          report.testsFailed++;
          console.log(`    FAIL: ${cmd.name} - ${result.error}`);
          report.errors.push({
            command: cmd.name,
            phase: 'test',
            message: result.error || 'Unknown error',
          });
        }
      }

      // Run dependent tests (checkpoint info, url update, restore)
      console.log('\nRunning dependent tests...');
      const dependentResults = await runDependentTests();

      for (const result of dependentResults) {
        report.testsRun++;
        if (result.success) {
          report.testsPassed++;
        } else {
          report.testsFailed++;
          report.errors.push({
            command: result.command,
            phase: 'test',
            message: result.error || 'Unknown error',
          });
        }
      }

      console.log(`\n  Tests: ${report.testsPassed}/${report.testsRun} passed`);
    } else {
      console.log('\nSkipping command tests (SKIP_CLI_TESTS=true)');
    }

    // Step 6: Gather help output
    console.log('\nGathering help output...');
    const helpOutputs = new Map<string, ParsedHelp>();

    // Get main help for global options
    const mainHelp = await getMainHelp();
    const { globalOptions } = parseMainHelp(mainHelp);
    console.log(`  Parsed ${globalOptions.length} global options`);

    // Get help for each command
    for (const cmd of commands) {
      try {
        const helpText = await getHelpOutput(cmd);
        const parsed = parseHelpOutput(cmd.name, helpText);
        const cleaned = cleanParsedHelp(parsed);
        helpOutputs.set(cmd.name, cleaned);
        report.commandsGenerated.push(cmd.name);

        if (config.verbose) {
          console.log(
            `    ${cmd.name}: ${cleaned.options.length} options, ${cleaned.examples.length} examples`,
          );
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(
          `  Warning: Failed to get help for ${cmd.name}: ${message}`,
        );
        report.errors.push({
          command: cmd.name,
          phase: 'help',
          message,
        });
      }
    }

    console.log(
      `  Generated help for ${helpOutputs.size}/${commands.length} commands`,
    );

    // Step 7: Read existing manual sections
    console.log('\nReading existing manual sections...');
    let manualSections = getDefaultManualSections();

    if (existsSync(config.outputPath)) {
      const existingContent = readFileSync(config.outputPath, 'utf-8');
      const extracted = extractManualSections(existingContent);
      if (extracted.trim()) {
        manualSections = extracted;
        console.log('  Preserved existing manual sections');
      }
    }

    // Step 8: Generate MDX
    console.log('\nGenerating MDX...');
    const mdxContent = generateCommandsMdx(
      helpOutputs,
      globalOptions,
      manualSections,
    );

    // Step 9: Write output
    writeFileSync(config.outputPath, mdxContent);
    console.log(`  Written to: ${config.outputPath}`);

    // Step 10: Print report
    console.log('\n=== Generation Report ===');
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`CLI Version: ${report.cliVersion}`);
    console.log(`Commands Generated: ${report.commandsGenerated.length}`);
    if (!config.skipTests) {
      console.log(`Tests: ${report.testsPassed}/${report.testsRun} passed`);
    }
    if (report.errors.length > 0) {
      console.log(`Errors: ${report.errors.length}`);
      for (const error of report.errors) {
        console.log(`  - ${error.command} (${error.phase}): ${error.message}`);
      }
    }

    // Write report JSON for CI
    const reportPath = resolve(PROJECT_ROOT, 'cli-test-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\nReport written to: ${reportPath}`);

    // Exit with error if critical failures
    if (report.testsFailed > 0) {
      console.warn(`\nWarning: ${report.testsFailed} test(s) failed`);
      // Don't exit with error - tests failing shouldn't block doc generation
    }

    console.log('\nDone!');
  } finally {
    // Cleanup test sprite
    if (testSprite) {
      console.log('\nCleaning up test environment...');
      await destroyTestSprite(testSprite);
    }
  }
}

// Run
main().catch((error) => {
  console.error('Generation failed:', error);
  process.exit(1);
});
