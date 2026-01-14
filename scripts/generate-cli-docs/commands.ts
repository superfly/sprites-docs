import type { CommandDefinition } from './types.js';

/**
 * All CLI commands with their test configurations
 */
export const commands: CommandDefinition[] = [
  // Authentication Commands
  {
    name: 'sprite login',
    category: 'authentication',
    requiresSprite: false,
    requiresAuth: false,
    skipTest: true, // Interactive
  },
  {
    name: 'sprite logout',
    category: 'authentication',
    requiresSprite: false,
    requiresAuth: false,
    skipTest: true, // Destructive
  },
  {
    name: 'sprite org auth',
    aliases: ['sprite orgs', 'sprite organizations', 'sprite o'],
    category: 'authentication',
    requiresSprite: false,
    requiresAuth: false,
    skipTest: true, // Interactive
  },
  {
    name: 'sprite org list',
    category: 'authentication',
    requiresSprite: false,
    requiresAuth: true,
    testCase: {
      args: ['sprite', 'org', 'list'],
      expectSuccess: true,
    },
    helpCommand: ['sprite', 'org', 'list', '--help'],
  },
  {
    name: 'sprite org logout',
    category: 'authentication',
    requiresSprite: false,
    requiresAuth: true,
    skipTest: true, // Destructive
  },
  {
    name: 'sprite org keyring disable',
    category: 'authentication',
    requiresSprite: false,
    requiresAuth: false,
    skipTest: true, // Modifies config
  },
  {
    name: 'sprite org keyring enable',
    category: 'authentication',
    requiresSprite: false,
    requiresAuth: false,
    skipTest: true, // Modifies config
  },
  {
    name: 'sprite auth setup',
    category: 'authentication',
    requiresSprite: false,
    requiresAuth: false,
    skipTest: true, // Requires token arg
    helpCommand: ['sprite', 'auth', 'setup', '--help'],
  },

  // Sprite Management Commands
  {
    name: 'sprite create',
    category: 'sprite-management',
    requiresSprite: false,
    requiresAuth: true,
    // Test case handled specially - creates ephemeral sprite
    skipTest: true,
  },
  {
    name: 'sprite use',
    category: 'sprite-management',
    requiresSprite: false,
    requiresAuth: true,
    // Test case handled specially - uses ephemeral sprite
    skipTest: true,
  },
  {
    name: 'sprite list',
    aliases: ['sprite ls'],
    category: 'sprite-management',
    requiresSprite: false,
    requiresAuth: true,
    testCase: {
      args: ['sprite', 'list'],
      expectSuccess: true,
    },
  },
  {
    name: 'sprite destroy',
    category: 'sprite-management',
    requiresSprite: true,
    requiresAuth: true,
    // Test case handled specially - destroys ephemeral sprite
    skipTest: true,
  },

  // Command Execution
  {
    name: 'sprite exec',
    aliases: ['sprite x'],
    category: 'command-execution',
    requiresSprite: true,
    requiresAuth: true,
    testCase: {
      args: ['sprite', 'exec', 'echo', 'test'],
      expectSuccess: true,
      expectOutput: /test/,
    },
  },
  {
    name: 'sprite console',
    aliases: ['sprite c'],
    category: 'command-execution',
    requiresSprite: true,
    requiresAuth: true,
    skipTest: true, // Interactive
  },

  // Checkpoints
  {
    name: 'sprite checkpoint create',
    category: 'checkpoints',
    requiresSprite: true,
    requiresAuth: true,
    // Tested in dependent tests (captures checkpoint ID for subsequent tests)
    skipTest: true,
    helpCommand: ['sprite', 'checkpoint', 'create', '--help'],
  },
  {
    name: 'sprite checkpoint list',
    aliases: ['sprite checkpoint ls', 'sprite checkpoints ls'],
    category: 'checkpoints',
    requiresSprite: true,
    requiresAuth: true,
    testCase: {
      args: ['sprite', 'checkpoint', 'list'],
      expectSuccess: true,
    },
    helpCommand: ['sprite', 'checkpoint', 'list', '--help'],
  },
  {
    name: 'sprite checkpoint info',
    category: 'checkpoints',
    requiresSprite: true,
    requiresAuth: true,
    // Requires checkpoint ID - tested after create
    skipTest: true,
    helpCommand: ['sprite', 'checkpoint', 'info', '--help'],
  },
  {
    name: 'sprite checkpoint delete',
    aliases: ['sprite checkpoint rm'],
    category: 'checkpoints',
    requiresSprite: true,
    requiresAuth: true,
    skipTest: true, // Destructive
    helpCommand: ['sprite', 'checkpoint', 'delete', '--help'],
  },
  {
    name: 'sprite restore',
    aliases: ['sprite checkpoint restore'],
    category: 'checkpoints',
    requiresSprite: true,
    requiresAuth: true,
    skipTest: true, // Requires checkpoint ID
  },

  // Networking
  {
    name: 'sprite proxy',
    category: 'networking',
    requiresSprite: true,
    requiresAuth: true,
    skipTest: true, // Long-running
  },
  {
    name: 'sprite url',
    category: 'networking',
    requiresSprite: true,
    requiresAuth: true,
    testCase: {
      args: ['sprite', 'url'],
      expectSuccess: true,
    },
  },
  {
    name: 'sprite url update',
    category: 'networking',
    requiresSprite: true,
    requiresAuth: true,
    skipTest: true, // Modifies state
    helpCommand: ['sprite', 'url', 'update', '--help'],
  },

  // Utility
  {
    name: 'sprite api',
    category: 'utility',
    requiresSprite: false,
    requiresAuth: true,
    testCase: {
      args: ['sprite', 'api', '/v1/sprites'],
      expectSuccess: true,
    },
  },
  {
    name: 'sprite upgrade',
    category: 'utility',
    requiresSprite: false,
    requiresAuth: false,
    testCase: {
      args: ['sprite', 'upgrade', '--check'],
      expectSuccess: true,
    },
  },
];

/**
 * Get commands grouped by category
 */
export function getCommandsByCategory(): Map<string, CommandDefinition[]> {
  const byCategory = new Map<string, CommandDefinition[]>();

  for (const cmd of commands) {
    const existing = byCategory.get(cmd.category) || [];
    existing.push(cmd);
    byCategory.set(cmd.category, existing);
  }

  return byCategory;
}

/**
 * Get commands that should be tested
 */
export function getTestableCommands(): CommandDefinition[] {
  return commands.filter((cmd) => !cmd.skipTest && cmd.testCase);
}

/**
 * Get commands that require a sprite to exist
 */
export function getCommandsRequiringSprite(): CommandDefinition[] {
  return commands.filter((cmd) => cmd.requiresSprite);
}

/**
 * Category display names for docs
 */
export const categoryTitles: Record<string, string> = {
  authentication: 'Authentication Commands',
  'sprite-management': 'Sprite Management',
  'command-execution': 'Command Execution',
  checkpoints: 'Checkpoints',
  networking: 'Networking',
  utility: 'Utility Commands',
};

/**
 * Category order for docs
 */
export const categoryOrder = [
  'authentication',
  'sprite-management',
  'command-execution',
  'checkpoints',
  'networking',
  'utility',
];
