const { seed } = require('./fixtures');
require('../src/db');

/* WARNING THIS WILL DROP THE CURRENT DATABASE */
seed();
