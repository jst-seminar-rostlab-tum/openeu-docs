import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'OpenEU documentation',
  tagline: 'OpenEU is cool',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://openeu.csee.tech',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'csee', // Usually your GitHub org/user name.
  projectName: 'openeu', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/jst-seminar-rostlab-tum/openeu-frontend',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/jst-seminar-rostlab-tum/openeu-frontend',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'OpenEU',

      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documnetation',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/jst-seminar-rostlab-tum/openeu-frontend',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Frontend",
              to: "/category/frontend",
            },
            {
              label: "Chatbot",
              to: "/category/chatbot",
            },
            {
              label: "Email service",
              to: "/category/email-service",
            },
          ],
        },
        {
          title: "GitHub Repositories",
          items: [
            {
              label: "Frontend",
              href: "https://github.com/jst-seminar-rostlab-tum/wfp-hunger-map",
            },
            {
              label: "Chatbot & email service",
              href: "https://github.com/jst-seminar-rostlab-tum/wpf-chatbot-backend",
            },
            {
              label: "Backend",
              href: "https://github.com/org-wfp/hml-be",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "JavaScript Technology Practical course",
              href: "https://nutritious-request-5b4.notion.site/Practical-Course-JavaScript-Technology-55c4e3f51a3d4f86bc03f505fb0dc01a",
            },
            {
              label: "CSEE",
              href: "https://www.csee.tech/",
            },
            {
              label: "UN World Food Programme",
              href: "https://www.wfp.org/",
            },
            {
              label: "German Aerospace Center",
              href: "https://www.dlr.de/en",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Center for Software Engineering Excellence GmbH - Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
