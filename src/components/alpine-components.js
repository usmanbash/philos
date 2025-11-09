import Alpine from 'alpinejs';
const { camelCase } = require('lodash');

/**
 * Automatically imports all alpine components from ./components/
 */
const requireModule = require.context(
  // Look for files in the components directory
  '.',

  // look in subdirectories
  true,

  // Only include ".alpine.js" files
  /\.alpine\.js$/,
);

requireModule.keys().forEach(filename => {
  let basename = filename.split('/').pop();
  const moduleName = camelCase(
    basename
      .replace(/(\.\/|\.alpine\.js)/g, '')
      .replace(/^\w/, c => c.toLowerCase()),
  );

  Alpine.data(
    moduleName,
    requireModule(filename).default || requireModule(filename),
  );
});
