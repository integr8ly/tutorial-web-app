const sync = require('i18next-json-sync').default;
const path = require('path');

const check = process.argv.includes('--check');
const srcDir = path.resolve(__dirname, '../src');

sync({
  check,
  files: path.join(srcDir, '../public/locales/*.json'),
  primary: 'en',
  createResources: [],
  space: 2,
  lineEndings: 'LF',
  finalNewline: true
});
