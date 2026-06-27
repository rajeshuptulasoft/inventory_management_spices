const { spawnSync, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const androidDir = path.join(root, 'android');
const shouldClean = process.argv.includes('--clean');
const WIN_SUBST_DRIVE = 'Y:';
const isWin = process.platform === 'win32';

function removeDirIfExists(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function cleanNativeCaches(projectRoot) {
  if (!isWin) return;

  const android = path.join(projectRoot, 'android');
  removeDirIfExists(path.join(android, 'app', '.cxx'));
  removeDirIfExists(path.join(android, 'app', 'build'));
  removeDirIfExists(path.join(android, 'build'));
  removeDirIfExists(path.join(android, '.gradle'));

  const nativeModules = [
    'react-native-reanimated',
    'react-native-worklets',
    'react-native-gesture-handler',
    'react-native-screens',
    '@react-native-async-storage/async-storage',
    '@react-native-community/geolocation',
  ];

  for (const pkg of nativeModules) {
    removeDirIfExists(path.join(projectRoot, 'node_modules', pkg, 'android', '.cxx'));
  }

  try {
    execSync('gradlew.bat --stop', { cwd: android, stdio: 'ignore', shell: true });
  } catch (_) {}
}

function ensureSubstDrive() {
  if (!isWin) return root;

  try {
    execSync(`subst ${WIN_SUBST_DRIVE} /d`, { stdio: 'ignore', shell: true });
  } catch (_) {}

  execSync(`subst ${WIN_SUBST_DRIVE} "${root}"`, { stdio: 'ignore', shell: true });
  return `${WIN_SUBST_DRIVE}\\`;
}

function clearSubstDrive() {
  if (!isWin) return;
  try {
    execSync(`subst ${WIN_SUBST_DRIVE} /d`, { stdio: 'ignore', shell: true });
  } catch (_) {}
}

function upgradeSdkNinja() {
  if (!isWin) return;

  const projectNinja = path.join(__dirname, 'tools', 'ninja.exe');
  if (!fs.existsSync(projectNinja)) return;

  const sdkRoot =
    process.env.ANDROID_HOME ||
    process.env.ANDROID_SDK_ROOT ||
    path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk');

  const cmakeRoot = path.join(sdkRoot, 'cmake');
  if (!fs.existsSync(cmakeRoot)) return;

  for (const versionDir of fs.readdirSync(cmakeRoot)) {
    const sdkNinja = path.join(cmakeRoot, versionDir, 'bin', 'ninja.exe');
    if (fs.existsSync(sdkNinja)) {
      fs.copyFileSync(projectNinja, sdkNinja);
    }
  }
}

function prepareAutolinking(projectRoot) {
  removeDirIfExists(path.join(projectRoot, 'android', 'build', 'generated', 'autolinking'));
}

if (shouldClean) {
  cleanNativeCaches(root);
}

upgradeSdkNinja();

const workRoot = ensureSubstDrive();
if (shouldClean) {
  prepareAutolinking(workRoot);
}

const result = spawnSync(
  'npx',
  ['react-native', 'run-android', '--no-packager', '--active-arch-only'],
  {
    stdio: 'inherit',
    cwd: workRoot,
    shell: true,
  }
);

clearSubstDrive();
process.exit(result.status ?? (result.error ? 1 : 0));
