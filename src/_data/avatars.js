const glob = require('firost/lib/glob');
const _ = require('golgoth/lib/lodash');
const path = require('path');

module.export = async function() {
  const list = await glob('src/assets/portraits/*.jpg');
  return _.map(list, item => {
    return path.basename(item, '.jpg');
  });
};
