import { defineConfig } from 'vitepress'
import { readFileSync } from 'fs'

const version = readFileSync('/.sprite/version.txt', 'utf-8').trim()

export default defineConfig({
  title: 'Sprites Docs',
  description: 'Sprite Environment Documentation',

  base: '/',
  cleanUrls: true,

  themeConfig: {
    nav: [
      { text: 'Docs', link: '/' },
      { text: 'API', link: '/api/' },
      { text: version, link: '/' }
    ],

    sidebar: [
      {
        text: 'Environment',
        items: [
          { text: 'Overview', link: '/' },
          { text: 'Lifecycle', link: '/lifecycle' },
          { text: 'Filesystem', link: '/filesystem' }
        ]
      },
      {
        text: 'Services',
        items: [
          { text: 'Overview', link: '/services' },
          { text: 'HTTP Routing', link: '/http-routing' }
        ]
      },
      {
        text: 'Checkpoints',
        link: '/checkpoints'
      },
      {
        text: 'Network Policy',
        link: '/network'
      },
      {
        text: 'Languages',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/languages/' },
          { text: 'Node.js', link: '/languages/nodejs' },
          { text: 'Python', link: '/languages/python' },
          { text: 'Ruby', link: '/languages/ruby' },
          { text: 'Rust', link: '/languages/rust' },
          { text: 'Go', link: '/languages/go' },
          { text: 'Erlang', link: '/languages/erlang' },
          { text: 'Elixir', link: '/languages/elixir' },
          { text: 'Java', link: '/languages/java' },
          { text: 'Bun & Deno', link: '/languages/bun-deno' }
        ]
      },
      {
        text: 'CLI Reference',
        link: '/cli'
      },
      {
        text: 'REST API',
        collapsed: false,
        items: [
          { text: 'Overview', link: '/api/' },
          { text: 'Sprites', link: '/api/sprites' },
          { text: 'Checkpoints', link: '/api/checkpoints' },
          { text: 'Execution', link: '/api/exec' },
          { text: 'Internal API', link: '/api/internal' }
        ]
      }
    ],

    outline: false,
    aside: false,

    search: {
      provider: 'local'
    }
  }
})
