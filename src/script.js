const lazyload = require('norska/frontend/lazyload');
const add = require('./_scripts/add.js');
lazyload.init();

window.onload = function() {
  if (!add.isEnabled()) {
    return;
  }
  add.init();
};
