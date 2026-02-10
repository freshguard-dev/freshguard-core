import {readFileSync} from 'node:fs';
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));
const versionLabel = pkg.version.replace(/\.\d+$/, '.x'); // 0.13.0 -> 0.13.x

const config: Config = {
  title: 'FreshGuard Core',
  tagline: 'Open source data pipeline freshness monitoring',
  favicon: 'img/favicon.ico',

  url: 'https://freshguard-dev.github.io',
  baseUrl: '/freshguard-core/',

  organizationName: 'freshguard-dev',
  projectName: 'freshguard-core',

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        entryPoints: ['../src/index.ts'],
        tsconfig: '../tsconfig.json',
        out: 'docs/api',
        sidebar: {
          autoConfiguration: true,
          pretty: true,
        },
        readme: 'none',
        indexFormat: 'table',
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/freshguard-dev/freshguard-core/tree/main/website/',
          lastVersion: 'current',
          versions: {
            current: {
              label: versionLabel,
            },
          },
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'FreshGuard Core',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/docs/api',
          label: 'API Reference',
          position: 'left',
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          href: 'https://www.npmjs.com/package/@freshguard/freshguard-core',
          label: 'npm',
          position: 'right',
        },
        {
          href: 'https://github.com/freshguard-dev/freshguard-core',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Getting Started', to: '/docs/getting-started/installation'},
            {label: 'Guides', to: '/docs/guides/freshness-monitoring'},
            {label: 'API Reference', to: '/docs/api'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'GitHub Issues', href: 'https://github.com/freshguard-dev/freshguard-core/issues'},
            {label: 'GitHub Discussions', href: 'https://github.com/freshguard-dev/freshguard-core/discussions'},
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'Changelog', to: 'https://github.com/freshguard-dev/freshguard-core/blob/main/CHANGELOG.md'},
            {label: 'npm', href: 'https://www.npmjs.com/package/@freshguard/freshguard-core'},
            {label: 'FreshGuard Cloud', href: 'https://freshguard.dev'},
          ],
        },
      ],
      copyright: `Copyright ${new Date().getFullYear()} FreshGuard. MIT Licensed.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'sql', 'docker', 'yaml'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
