const netlify = require('callirhoe/lib/netlify');
const path = require('path');

(async function () {
  await netlify.freezeFile(
    path.resolve('lambda/lib/secrets.js'),
    path.resolve('dist-lambda/lib/secrets.js')
  );
})();
