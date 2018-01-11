const pkg = require('../package.json');
const manifest = require('../manifest.json');

manifest.version = pkg.version;

let str = JSON.stringify(manifest, null, 2);
console.log(str); // eslint-disable-line no-console
