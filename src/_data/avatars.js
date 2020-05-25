const glob = require('firost/lib/glob');
const _ = require('golgoth/lib/lodash');
const path = require('path');

module.exports = async function() {
  const list = await glob(path.resolve('src/assets/portrait/*.jpg'));
  return _.chain(list)
    .map(item => {
      return path.basename(item, '.jpg');
    })
    .value();
};
