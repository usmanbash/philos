const gulp = require('gulp');
const { exec } = require('child_process');
const fs = require('fs');
const { rm } = require('fs/promises');
const path = require('path');
const consola = require('consola');
const through2 = require('through2');
const util = require('util');

// ------------------------------------------------------------
// theme IDs

const LIVE_THEME_ID = '180843708749';

// @NOTE UPDATE DEV THEME ID
const DEV_THEME_ID = '';

// Switch between live and dev theme
const useLiveThemeId = false;

// ------------------------------------------------------------

const TEMP_DIR = 'temp';

// theme ID to use
const THEME_ID = useLiveThemeId ? LIVE_THEME_ID : DEV_THEME_ID;
// abort if no theme ID is provided
if (!THEME_ID) {
  consola.error('[gulpfile] Please provide a theme ID.');
  process.exit(1);
}

function getCliCommand() {
  return `shopify theme pull --theme=${THEME_ID} --path=${TEMP_DIR} --only=config/settings_data.json --only=templates/*.json`;
}

// Create temp directory if it doesn't exist
async function createTempDir() {
  try {
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
      consola.debug(`Created directory: ${TEMP_DIR}`);
    }
  } catch (error) {
    consola.error(`Error creating directory: ${TEMP_DIR}`, error);
    throw error;
  }
}

// Utilize Node's util.promisify to work with exec in an async manner
const execAsync = util.promisify(exec);

// Custom function to check if files are different
async function areFilesDifferent(source, target) {
  try {
    const sourceContent = fs.readFileSync(source);
    const targetContent = fs.existsSync(target) ? fs.readFileSync(target) : null;
    return !targetContent || !sourceContent.equals(targetContent);
  } catch (error) {
    consola.error(error);
    return true; // Assume different if there's an error reading files
  }
}

// Delete directory using fs.promises
async function deleteDirectory(directoryPath) {
  try {
    await rm(directoryPath, { recursive: true, force: true });
    consola.debug(`Deleted directory: ${directoryPath}`);
  } catch (error) {
    consola.error(`Error deleting directory: ${directoryPath}`, error);
  }
}

// Define a task for the user prompt
async function userPrompt(done) {
  // Short reminder before prompt: save and commit work to avoid unintended overwrites
  consola.box({
    title: '☝️ Reminder',
    message: [
      '- Save your work and commit or stash any local changes.',
      '- This task will overwrite local theme JSON files from the selected Shopify theme:',
      '  - src/config/settings_data.json',
      '  - src/components/templates/**/*.json',
    ].join('\n'),
    style: {
      padding: 1,
      borderColor: 'yellow',
      borderStyle: 'singleThick',
    },
  });

  // print cli command before executing it
  consola.info(`Following shopify cli command will be executed:`);
  consola.box(getCliCommand());

  // prompt user to confirm
  const confirmed = await consola.prompt('Do you want to continue?', {
    type: 'confirm',
  });

  if (!confirmed) {
    // Exit process or throw an error to abort the gulp series
    done(new Error('Aborted by the user.'));
  } else {
    done();
  }
}

// Pull theme using shopify CLI
async function pullTheme() {
  try {
    // shopify cli command
    const cmd = getCliCommand();

    // exec
    const { stdout, stderr } = await execAsync(cmd);

    // log output
    consola.info(stdout);
    if (stderr) {
      consola.warn(stderr);
    }
  } catch (error) {
    consola.error('Error pulling theme:', error);
    throw error; // Rethrow error to be caught by gulp's task system
  }
}

// Add-newline task integrated into the gulpfile
function addNewline() {
  return gulp
    .src('./temp/**/*.*', { base: './' })
    .pipe(
      through2.obj(function (file, enc, cb) {
        if (file.isNull() || file.isStream()) {
          return cb(null, file);
        }

        const content = file.contents.toString(enc);
        if (!content.endsWith('\n')) {
          consola.debug(`Adding newline to ${file.relative}`);
          file.contents = Buffer.from(content + '\n', enc);
        }

        cb(null, file);
      }),
    )
    .pipe(gulp.dest('./'));
}

// Task to copy settings_data.json specifically
function copySettingsJson() {
  return gulp
    .src(`${TEMP_DIR}/config/settings_data.json`, { base: `${TEMP_DIR}/config` })
    .pipe(gulp.dest('src/config'));
}

// Task to recursively copy .json files from templates
function copyTemplatesJson() {
  return gulp
    .src(`${TEMP_DIR}/templates/**/*.json`, { base: `${TEMP_DIR}/templates` })
    .pipe(
      through2.obj(async function (file, _, callback) {
        if (file.isDirectory()) {
          callback(null, file); // Pass directories through to ensure structure
        } else {
          const relativePath = path.relative(`${TEMP_DIR}/templates`, file.path);
          consola.debug(`relativePath: ${relativePath}`);

          const targetPath = path.join('src/components/templates', relativePath);
          consola.debug(`targetPath: ${targetPath}`);

          if (await areFilesDifferent(file.path, targetPath)) {
            consola.info(`Copying updated file: ${relativePath}`);
            callback(null, file);
          } else {
            // consola.info(`Skipping identical file: ${path.relative(TEMP_DIR, file.path)}`)
            callback();
          }
        }
      }),
    )
    .pipe(gulp.dest('src/components/templates'));
}

// Define public tasks
gulp.task('user-prompt', userPrompt);
gulp.task('create-temp', createTempDir);
gulp.task('pull-theme', pullTheme);
gulp.task('add-newline', addNewline);
gulp.task('copy-settings-json', copySettingsJson);
gulp.task('copy-templates-json', copyTemplatesJson);
gulp.task('clean', () => deleteDirectory(TEMP_DIR));

// Task for theme synchronization
gulp.task(
  'theme-sync',
  gulp.series(
    'user-prompt',
    'create-temp',
    'pull-theme',
    'add-newline',
    'copy-settings-json',
    'copy-templates-json',
    'clean',
    async () => {
      consola.success('Theme JSON synchronization completed successfully.');
    },
  ),
);
