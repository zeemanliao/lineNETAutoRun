'use strict';
let config = require('./config.json');

let cfg = require('../web/config.json');
let mongoose = require('mongoose');
let isDEV = process.env.NODE_ENV !== 'production';

if (isDEV) {
  cfg.db.mongodb.server="localhost";
}

//mongo db connect
mongoose.connect('mongodb://' + cfg.db.mongodb.server + '/' + cfg.db.mongodb.db,
  {
    user:cfg.db.mongodb.user,
    pass:cfg.db.mongodb.pass
  });
let Storage = require('../web/lib/storage')(mongoose);
let epa = require('./lib/epa')(config, Storage);

config.db = cfg.db;
epaRun();
function epaRun() {
	epa();
	setTimeout(epaRun, config.epa.reload * 1000);
}