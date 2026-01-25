const fs = require('fs');
const path = require('path');

const pkgPath = path.resolve(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version;
console.log('Injecting version', version);

const templates = [
  'src/environments/environment.ts.template',
  'src/environments/environment.prod.ts.template'
];

templates.forEach(template => {
  const tplPath = path.resolve(__dirname, '..', template);
  const outPath = tplPath.replace('.template', '');
  if (!fs.existsSync(tplPath)) {
    console.warn('Template not found:', tplPath);
    return;
  }
  let content = fs.readFileSync(tplPath, 'utf8');
  content = content.replace(/__APP_VERSION__/g, version);
  fs.writeFileSync(outPath, content, 'utf8');
  console.log('Wrote', outPath);
});
