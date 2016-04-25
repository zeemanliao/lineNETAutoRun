'use strict';

let cheerio = require('cheerio');
let request = require('request');
let epacodes = require('../data/epacode.json');
let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/linenet');

let Storage = require('../../lineweb/lib/Storage')(mongoose);

module.exports = function(config) {
	return function()
	{
		console.log('run');
		return;
		request(config.epa.url,  function (err, res, html) {
		if (err)
			return console.log(err);

		let $ = cheerio.load(html);
		let datas = [];

		$("#AreaPsi > area").each(function(i, element){
			let area = $(this);
			let json = area.attr("jtitle");
			let data = filter(json);
			if (data) {
				datas.push(data);
			}
		});
		if (datas.length >0){
			epaSave(datas);
		}
		
	});
	}
};
function filter(json) {
	let data = null;
	try {
		data = JSON.parse(json);
	} catch(err) {
		return null;
	}
	let County = null;
	for (let i in epacodes) {
		let epacode = epacodes[i];
		if (epacode.area == data.SiteName) {
			County = epacode.County;
		}
	}
	if (!County) {
		return null;
		console.log('Area No Match:[%s]', data.SiteName);
	}
	let publishTime = getPublishTime();

	let epaData = {
        "CO": data.CO,
        "County": County,
        "FPMI": data.FPMI || null,
        "NO2": data.NO2 || null,
        "NOx": data.NOx || null,
        "O3": data.O3 || null,
        "PM10": data.PM10 || null,
        "PM25": data.PM25 || null,
        "PSI": data.PSI || null,
        "SiteName": data.SiteName || null,
        "SO2": data.SO2 || null,
        "PSIStyle": data.PSIStyle || null,
        "MainPollutant":data.MainPollutant || null,
        "MainPollutantKey":data.MainPollutantKey || null,
        "SiteKey":data.SiteKey || null,
        "PM10_AVG":data.PM10_AVG || null,
        "PM25_AVG":data.PM25_AVG || null,
        "AreaKey":data.AreaKey || null,
        "PublishTime":publishTime
    };
    return epaData;
}

    function epaSave(datas) {
      Storage.EPAs.remove({}, function(err,removed) {

        for (let i in datas) {
            let data = datas[i];
            let epa = new Storage.EPAs();
            epa.tim = new Date().getTime();
            epa.data = data;
            epa.save(function(err) {
                if (err)
                    console.log(err);
            });
        }
      });

    }

    function getPublishTime() {
    	let d = new Date();
    	return	d.getFullYear() + '/' + 
    			chNum(d.getMonth()) + '/' + 
    			chNum(d.getDate()) + ' ' + 
    			chNum(d.getHours()) + ':00:00';
    }

    function chNum(s) {
    	if (s.length<2) {
    		return '0' + s;
    	}
    	return s;
    }