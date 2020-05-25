const helper = require('../lib/main.js');
const pMap = require('golgoth/lib/pMap');
const _ = require('golgoth/lib/lodash');
const sleep = require('firost/lib/sleep');

(async function() {
  const array = _.times(1, _.identity);
  await pMap(
    array,
    async index => {
      // The real portrait is regenerated every second, so we span the queries
      // await sleep(index * 1500);
      await helper.generate();
    },
    { concurrency: 1 }
  );
})();
