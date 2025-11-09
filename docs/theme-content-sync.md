# Theme Content Sync

This SOP describes how to safely synchronize Shopify theme content (templates JSON and settings) to the local repository and publish updates without losing merchant edits.

## ⚠️ Important Warning

**The sync operation will overwrite these local files:**

- `src/config/settings_data.json`
- `src/components/templates/*.json`

## Prerequisites

Before starting, ensure you have:

- ✅ Saved your work and committed or stashed local changes
- ✅ Updated your local `dev` branch with the remote
- ✅ Verified you're logged into the correct Shopify store in the CLI

## Workflow

### 1. Setup

Create a branch from `dev` following the git workflow.

### 2. Initial Sync

Pull the latest live theme content:

```bash
gulp theme-sync
```

### 3. Development

Implement your feature on the branch.

### 4. Handle Customizer Changes

If edits are made in the Shopify customizer during development:

1. Open `gulpfile.js` and verify you're using your development theme ID
2. Re-run the sync to capture changes:
   ```bash
   gulp theme-sync
   ```
3. Commit the changes:
   ```bash
   git add .
   git commit -m "Sync customizer changes"
   ```

### 5. Preview Deployment

Push the theme to Shopify as an unpublished theme for preview:

```bash
# Navigate to dist/ directory
cd dist/
shopify theme push --unpublished
```

### 6. QA Process

1. After QA approval, verify there haven't been significant live-theme content changes
2. Double-check feature and content integrity
3. Update the theme version in `src/config/settings_schema.json`
   - Optionally update `package.json` version
4. Push the theme (unpublished) for final preview:
   ```bash
   shopify theme push --unpublished
   ```
5. Preview again to confirm everything is present and correct

### 7. Production Deployment

1. **Create a backup** of the live theme in Shopify (duplicate it)
2. Publish the new theme in Shopify (usually done by the store owner)

### 8. Update Master Branch

After the theme is published and confirmed working in production, update the `master` branch to reflect the live theme state.

**Note**: The specific git workflow (feature branches, pull requests, merges, etc.) depends on the nature of the changes. Refer to [git.md](git.md) for detailed branching procedures.

## Technical Notes

- **Important**: We cant use standard theme sync / pull process (ie. `shopify theme pull` directly) because the `dist/` folder holds compiled theme files that will be overwritten by the build process.
- The sync operation only pulls `config/settings_data.json` and `templates/*.json` from the selected Shopify theme
- Use small, focused commits to make content changes easy to review
- Always test thoroughly before publishing to production

## Troubleshooting

- **Sync fails**: Verify you're logged into the correct Shopify store
- **Missing changes**: Check that your development theme ID is correct in `gulpfile.js`
- **Conflicts**: Resolve any merge conflicts before proceeding with deployment
