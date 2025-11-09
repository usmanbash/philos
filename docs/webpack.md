# Webpack Configuration

This webpack configuration is configured for building a Shopify theme with modern JavaScript and SCSS processing.

Inspired by https://github.com/3daddict/webpack-shopify-cli.

## Key Features

- Multi-entry point
- SCSS/CSS processing
- Asset copying (Copies Liquid templates, JSON configs, and static assets to appropriate directories
- Development/Production modes

## Entry Points

All JavaScript files in `src/` are automatically converted to entry points:

- `src/components/layout/theme.js` → `dist/assets/theme.js`
- `src/components/sections/hero.js` → `dist/assets/hero.js`

## Key Plugins

- **Dotenv**: Loads environment variables
- **MiniCssExtractPlugin**: Extracts CSS into separate files
- **CopyPlugin**: Copies Liquid templates and assets with proper directory structure
- **ESLintPlugin**: Lints JavaScript during build

## Build Commands

```bash
# Development with watch mode
npm run dev

# Production build
npm run build

```

## Development vs Production

- **Development**: Inline CSS, source maps, ESLint warnings
- **Production**: Minified CSS/JS, no source maps, ESLint errors fail build
