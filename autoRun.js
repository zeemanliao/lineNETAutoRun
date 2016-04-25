'use strict';

let request = require("request");
let xml2js = require('xml2js')
let lastTime = {};

module.exports = function(app) {
    let cfg = app.locals.config;
    let Storage = app.Storage;


    Storage.runTimeLogs.find({}, function(err, datas) {
        if (err)
            return console.log(err);

        for (let i in datas) {
            let data = datas[i];
            lastTime[data.id] = {
                id: data.id,
                tim: data.tim
            };
        }

        let timLog = getRunTimeLogs("epa");

        let nowTime = new Date().getHours();

        if (timLog.tim != nowTime) {
          epaRun(cfg.api.epa);
        } else {
          let _tim = 65 - (new Date().getMinutes());
          setTimeout(function(){
            epaRun(cfg.api.epa);
          }, _tim * 1000 * 60);
        }
    });

    function getRunTimeLogs(id) {
        if (id in lastTime)
            return lastTime[id];

        let _tim = {
            id: id,
            tim: 0
        };


        updateRunTimeLogs(_tim.id, _tim.tim);
        return _tim;
    }

    function updateRunTimeLogs(id, tim) {
        let _tim = {
            id: id,
            tim: tim
        };


        Storage.runTimeLogs.update({ id: id }, _tim, { upsert: true }, function(err) {
            if (err)
                console.log(err);
        });
    }

    function epaRun(cfg) {
        setTimeout(
            function() {
                epaRun(cfg);
            }, cfg.reload * 1000 * 60);

        request({
            url: cfg.url,
            method: "GET"
        }, function(err, r, b) {
            if (err)
                return console.log(err);

            let datas = JSON.parse(b);
            epaSave(datas);
            updateRunTimeLogs('epa', new Date().getHours());

            console.log('API:%s reload..ticked:%s,Count:%s', cfg.desc, cfg.reload, datas.length);
        });


    }

    function epaSave(datas) {
      Storage.EPAs.remove({PublishTime:{$ne:datas[0].PublishTime}}, function(err,removed) {

        for (let i in datas) {
            let data = datas[i];
            let epa = new Storage.EPAs();
            epa.tim = new Date().getTime();
            epa.data = {
                "CO": data.CO,
                "County": data.County,
                "FPMI": data.FPMI,
                "MajorPollutant": data.MajorPollutant,
                "NO": data.NO,
                "NO2": data.NO2,
                "NOx": data.NOx,
                "O3": data.O3,
                "PM10": data.PM10,
                "PM25": data['PM2.5'],
                "PSI": data.PSI,
                "PublishTime": data.PublishTime,
                "SiteName": data.SiteName,
                "SO2": data.SO2,
                "Status": data.Status,
                "WindDirec": data.WindDirec,
                "WindSpeed": data.WindSpeed
            };
            epa.save(function(err) {
                if (err)
                    console.log(err);
            });
        }
      });

    }
};
