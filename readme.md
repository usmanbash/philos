# Philos Running Shopify Theme

Shopify theme built with Webpack, Tailwind CSS, and Alpine.js for Philos Running.

## Prerequisites

- Node.js
- npm
- Shopify CLI
- Access to the Shopify store

## Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment**

   - create a `.env` file in the root directory
     ```bash
     cp .env.example .env
     ```
   - update variables

3. **Build the theme in development mode**

   ```bash
   npm run dev
   ```

4. **Start Shopify dev server**

   - open another terminal
   - cd into `dist` directory
   - start Shopify dev server

   ```bash
   cd dist
   shopify theme dev
   ```

## Available Scripts

| Command                | Description                            |
| ---------------------- | -------------------------------------- |
| `npm run build`        | Production build                       |
| `npm run dev`          | Dev build (watch for changes)          |
| `npm run shopify:dev`  | Start Shopify theme development server |
| `npm run shopify:info` | Show theme information                 |
| `npm run shopify:list` | List available themes                  |
| `npm run themesync`    | Sync theme JSON files from Shopify     |

## Project Structure

```
src/
├── assets/           # Static assets (images, fonts, etc.)
├── components/       # Theme components
│   ├── common/       # Shared JavaScript modules
│   ├── layout/       # Layout components (theme.liquid, etc.)
│   ├── sections/     # Shopify sections
│   ├── snippets/     # Reusable Liquid snippets
│   └── templates/    # Page templates
├── config/           # Theme configuration
├── locales/          # Translation files
└── stores/           # Alpine.js stores

dist/                 # Built theme files
```

## Development Workflow

### Local Development

#### 1. Build files from src/

```bash
npm run dev
```

The `npm run dev` command:

- Compiles SCSS to CSS
- Bundles JavaScript
- Processes Liquid templates and copies them
- Outputs proccessed files to `dist/` directory, in the structure expected by Shopify
- Watches for file changes and rebuilds automatically

**Note**: After building (with either `npm run dev` or `npm run build`), the `dist/` directory contains a complete Shopify theme. From this directory, you can run any Shopify CLI command (`shopify theme dev`, `shopify theme info`, `shopify theme list`, etc.) as if it were a regular Liquid theme.

#### 2. In another terminal, start Shopify dev server

```bash
npm run shopify:dev
```

### 2. Theme Synchronization (content)

Refer to [theme-content-sync.md](docs/theme-content-sync.md) for detailed sync procedure.

### 3. Building for Production

```bash
npm run build
```

## Tech Stack

- **Build Tool**: Webpack 5
- **CSS Framework**: Tailwind CSS
- **JavaScript**: Alpine.js
- **Styling**: SCSS + PostCSS
- **Liquid**: Shopify's templating language
- **Package Manager**: npm

## Deployment

The `dist/` folder contains the built theme ready for Shopify deployment.

## Useful Links

- [Shopify CLI documentation](https://shopify.dev/themes/tools/cli)
- [Alpine.js documentation](https://alpinejs.dev/)
