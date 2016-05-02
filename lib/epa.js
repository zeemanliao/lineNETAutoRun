'use strict';

let cheerio = require('cheerio');
let request = require('request');
let epacodes = require('../data/epacode.json');


module.exports = function(config, Storage) {
	return function()
	{
        console.log('epa run tick...');
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
			epaSave(Storage, datas);
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
        "SiteName": data.SiteName || '',
        "SiteKey":data.SiteKey || '',
        "AreaKey":data.AreaKey || '',
        "PSI": data.PSI || '',
        "PSIStyle": data.PSIStyle || '',
        "MainPollutant":data.MainPollutant || '',
        "MainPollutantKey":data.MainPollutantKey || '',
        "PM10": data.PM10 || '',
        "PM25": data.PM25 || '',
        "O3": data.O3 || '',
        "SO2": data.SO2 || '',
        "CO": data.CO || '',
        "NO2": data.NO2 || '',
        "County": County,
        "FPMI": data.FPMI || '',
        "PM10_AVG":data.PM10_AVG || '',
        "PM25_AVG":data.PM25_AVG || '',
        "PublishTime":publishTime
    };
    return epaData;
}

    function epaSave(Storage, datas) {
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
    			chNum(d.getMonth() +1) + '/' + 
    			chNum(d.getDate()) + ' ' + 
    			chNum(d.getHours()) + ':00:00';
    }

    function chNum(s) {
    	if (s.length<2) {
    		return '0' + s;
    	}
    	return s;
    }