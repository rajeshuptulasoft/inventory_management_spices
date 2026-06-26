const { execSync, spawnSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const substDrive = 'Y:';

function runAndroid(cwd) {
  return spawnSync(
    'npx',
    ['react-native', 'run-android', '--no-packager', '--active-arch-only'],
    {
      stdio: 'inherit',
      cwd,
      shell: true,
    }
  );
}

function runFromRoot() {
  const result = runAndroid(root);
  process.exit(result.status ?? (result.error ? 1 : 0));
}

function unmapSubstDrive() {
  try {
    execSync(`subst ${substDrive} /d`, { stdio: 'ignore' });
  } catch (_) {
    // Drive may not be mapped.
  }
}

function mapSubstDrive() {
  unmapSubstDrive();
  execSync(`subst ${substDrive} "${root}"`, { stdio: 'inherit' });
}

if (process.platform !== 'win32') {
  runFromRoot();
}

try {
  mapSubstDrive();
  const result = runAndroid(`${substDrive}\\`);
  process.exit(result.status ?? (result.error ? 1 : 0));
} finally {
  unmapSubstDrive();
}
