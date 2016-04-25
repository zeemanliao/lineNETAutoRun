'use strict';
let config = require('./config.json');
let epa = require('./lib/epa')(config);
epaRun();
function epaRun() {
	epa();
	setTimeout(epaRun, config.epa.reload * 1000);
}