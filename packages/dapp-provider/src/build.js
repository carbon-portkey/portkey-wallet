// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
const path = require('path');

const inpageContent = fs.readFileSync(path.join(__dirname, 'inpage.js')).toString();
fs.writeFileSync('./src/inpage_provider.js', `const inpage = \`${inpageContent}\`;\nexport default inpage;\n`, 'ascii');
console.log('inpage_provider.js generated succesfully');
