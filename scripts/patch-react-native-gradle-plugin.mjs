import fs from 'node:fs';
import path from 'node:path';

const target = path.join(
  process.cwd(),
  'node_modules/@react-native/gradle-plugin/build.gradle.kts',
);

if (!fs.existsSync(target)) {
  throw new Error('React Native Gradle plugin source was not installed.');
}

const source = fs.readFileSync(target, 'utf8');
if (
  !source.includes('configurationcache.extensions.serviceOf') &&
  source.includes('allWarningsAsErrors = false')
) {
  console.log('React Native Gradle plugin is already compatible.');
  process.exit(0);
}

const patched = source
  .replace('import org.gradle.api.internal.classpath.ModuleRegistry\n', '')
  .replace('import org.gradle.configurationcache.extensions.serviceOf\n', '')
  .replace(
    /\n  testRuntimeOnly\(\n      files\(\n          serviceOf<ModuleRegistry>\(\)\n              \.getModule\("gradle-tooling-api-builders"\)\n              \.classpath\n              \.asFiles\n              \.first\(\)\)\)\n/,
    '\n',
  )
  .replace('allWarningsAsErrors = true', 'allWarningsAsErrors = false');

if (patched.includes('serviceOf<ModuleRegistry>')) {
  throw new Error(
    'React Native Gradle plugin compatibility patch did not apply.',
  );
}

if (!patched.includes('allWarningsAsErrors = false')) {
  throw new Error(
    'React Native Gradle warning compatibility patch did not apply.',
  );
}

fs.writeFileSync(target, patched);
console.log('Patched React Native 0.73 Gradle plugin for Gradle 8.11.1.');
