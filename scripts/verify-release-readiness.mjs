import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const expected = {
  version: '2.4.0',
  androidApplicationId: 'com.matchdiary.origin',
  androidVersionCode: 26,
  iosBundleId: 'com.matchdirary.app',
  privacyUrl: 'https://hyeoz.github.io/privacy/matchdiary/',
  supportUrl: 'https://hyeoz.github.io/privacy/support/',
};

const failures = [];
const warnings = [];

const read = relativePath =>
  fs.readFileSync(path.join(root, relativePath), 'utf8');
const requireMatch = (label, value, pattern) => {
  if (!pattern.test(value)) failures.push(label);
};

const packageJson = JSON.parse(read('package.json'));
const androidRoot = read('android/build.gradle');
const androidApp = read('android/app/build.gradle');
const gradleWrapper = read('android/gradle/wrapper/gradle-wrapper.properties');
const xcodeProject = read('ios/matchdiary.xcodeproj/project.pbxproj');
const infoPlist = read('ios/matchdiary/Info.plist');
const privacyManifest = read('ios/matchdiary/PrivacyInfo.xcprivacy');
const appInfo = read('src/revival/appInfo.ts');

if (packageJson.version !== expected.version) {
  failures.push('package.json version');
}
if (!androidApp.includes(`applicationId "${expected.androidApplicationId}"`)) {
  failures.push('Android applicationId');
}
if (!androidApp.includes(`versionName "${expected.version}"`)) {
  failures.push('Android versionName');
}
if (!androidApp.includes(`versionCode ${expected.androidVersionCode}`)) {
  failures.push('Android versionCode');
}
requireMatch('Android compileSdk 36', androidRoot, /compileSdkVersion = 36/);
requireMatch('Android targetSdk 36', androidRoot, /targetSdkVersion = 36/);
requireMatch(
  'Android Gradle Plugin 8.9.1',
  androidRoot,
  /com\.android\.tools\.build:gradle:8\.9\.1/,
);
requireMatch('Gradle 8.11.1', gradleWrapper, /gradle-8\.11\.1-all\.zip/);
if (
  !xcodeProject.includes(`PRODUCT_BUNDLE_IDENTIFIER = ${expected.iosBundleId};`)
) {
  failures.push('iOS bundle identifier');
}

const marketingVersionMatches = [
  ...xcodeProject.matchAll(/MARKETING_VERSION = ([^;]+);/g),
].map(match => match[1]);
if (
  marketingVersionMatches.length < 2 ||
  marketingVersionMatches.some(value => value !== expected.version)
) {
  failures.push('iOS marketing version');
}

for (const [label, url] of [
  ['privacy policy URL', expected.privacyUrl],
  ['support URL', expected.supportUrl],
]) {
  if (!appInfo.includes(url)) failures.push(label);
}

for (const forbiddenPermission of [
  'NSCameraUsageDescription',
  'NSPhotoLibraryAddUsageDescription',
]) {
  if (infoPlist.includes(forbiddenPermission)) {
    failures.push(`unused iOS permission: ${forbiddenPermission}`);
  }
}

for (const requiredPrivacyType of [
  'NSPrivacyCollectedDataTypeCoarseLocation',
  'NSPrivacyCollectedDataTypeDeviceID',
  'NSPrivacyCollectedDataTypeProductInteraction',
  'NSPrivacyCollectedDataTypeAdvertisingData',
  'NSPrivacyCollectedDataTypePerformanceData',
  'NSPrivacyCollectedDataTypeCrashData',
  'NSPrivacyCollectedDataTypeOtherDiagnosticData',
]) {
  if (!privacyManifest.includes(requiredPrivacyType)) {
    failures.push(`privacy manifest: ${requiredPrivacyType}`);
  }
}

for (const requiredFile of [
  'store/app-store/app-info/ko.json',
  `store/app-store/version/${expected.version}/ko.json`,
  'store/google-play/ko-KR/title.txt',
  'store/google-play/ko-KR/short-description.txt',
  'store/google-play/ko-KR/full-description.txt',
  'store/google-play/ko-KR/release-notes.txt',
  'store/privacy-declarations.md',
]) {
  if (!fs.existsSync(path.join(root, requiredFile))) {
    failures.push(`missing store file: ${requiredFile}`);
  }
}

const recoveryUrl = process.env.MATCHDIARY_RECOVERY_API_BASE_URL ?? '';
const playProjectNumber =
  process.env.MATCHDIARY_PLAY_CLOUD_PROJECT_NUMBER ?? '';
if (!/^https:\/\//.test(recoveryUrl)) {
  warnings.push('production HTTPS recovery endpoint is not configured');
}
if (!/^\d+$/.test(playProjectNumber)) {
  warnings.push('Play Integrity cloud project number is not configured');
}

if (process.argv.includes('--production') && warnings.length) {
  failures.push(...warnings.map(warning => `production gate: ${warning}`));
}

if (failures.length) {
  console.error('Release readiness check failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `Release metadata and platform settings verified for ${expected.version}.`,
);
warnings.forEach(warning => console.warn(`Warning: ${warning}.`));
