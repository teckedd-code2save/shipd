import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Shipd",
  tagline: "Repo-aware deployment planning for AI-first teams",
  favicon: "img/favicon.ico",

  future: {
    v4: true
  },

  url: "https://shipd.dev",
  baseUrl: "/",

  organizationName: "teckedd-code2save",
  projectName: "shipd",

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"]
  },

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
          editUrl: "https://github.com/teckedd-code2save/shipd/tree/main/docs/"
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css"
        }
      } satisfies Preset.Options
    ]
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true
    },
    navbar: {
      title: "Shipd",
      logo: {
        alt: "Shipd",
        src: "img/logo.svg"
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docs",
          position: "left",
          label: "Docs"
        },
        {
          href: "https://github.com/teckedd-code2save/shipd",
          label: "GitHub",
          position: "right"
        }
      ]
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            { label: "Getting started", to: "/" },
            { label: "Architecture", to: "/architecture" },
            { label: "Platforms", to: "/platforms" },
            { label: "Contributing", to: "/contributing" }
          ]
        },
        {
          title: "Project",
          items: [
            { label: "GitHub", href: "https://github.com/teckedd-code2save/shipd" }
          ]
        }
      ],
      copyright: `© ${new Date().getFullYear()} Shipd`
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["bash", "typescript", "sql"]
    }
  } satisfies Preset.ThemeConfig
};

export default config;
