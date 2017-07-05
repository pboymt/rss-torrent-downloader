"use strict";
var fs = require('fs');
var path = require('path');
var xml2js = require('xml2js');
var d2m = require('./d2m.js');
var parseXML = xml2js.parseString;
var http = require('http');
var responseText = '';
var xmlObj = {};
var downloadedNum = 0;
var base32to16 = function (dm) {
    return (new d2m(dm).base);
};
var date2str = function (x, y) {
    var z = {
        y: x.getFullYear(),
        M: x.getMonth() + 1,
        d: x.getDate(),
        h: x.getHours(),
        m: x.getMinutes(),
        s: x.getSeconds()
    };
    return y.replace(/(y+|M+|d+|h+|m+|s+)/g, function (v) {
        return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-(v.length > 2 ? v.length : 2));
    });
};
var resources = {
    nyaa: {
        url: 'http://www.nyaa.se/?page=rss',
        dir: 'nyaa/',
        run: function () {
            console.log('nyaa');
            if (!fs.existsSync('nyaa/')) {
                fs.mkdirSync('nyaa/');
            }
            var roundDownload = function (list, which) {
                console.log('正在下载第' + which + '个');
                downloadTorrent(list[which]['link'][0], list[which]['title'] + '.torrent', 'nyaa/', function (isDown) {
                    if (isDown) {
                        downloadedNum++;
                    }
                    if (which >= list.length - 1) {
                        console.log('下载完毕！下载了' + downloadedNum + '个文件');
                    } else {
                        roundDownload(list, which + 1);
                    }
                });
            };
            http.get('http://www.nyaa.se/?page=rss', function (res) {
                responseText = '';
                res.on('data', function (chunk) {
                    //console.log('BODY: ' + chunk);
                    responseText += chunk;
                });
                res.on('end', function () {
                    //console.log(responseText);
                    fs.writeFile('nyaa/' + 'result.xml', responseText);
                    parseXML(responseText, function (err, result) {
                        console.dir(result['rss']['channel'][0]['item'].length);
                        fs.writeFile('nyaa/' + 'result.json', JSON.stringify(result));
                        var items = result['rss']['channel'][0]['item'];
                        roundDownload(items, 0);
                    });
                });
            }).on('error', function () {
                console.log('Error');
            });
        }
    },
    dmhy: {
        run: function () {
            console.log('dmhy');
            var dirs = {
                home: path.join(__dirname, 'dmhy'),
                main: path.join(__dirname, 'dmhy', 'main'),
                year: path.join(__dirname, 'dmhy', 'main', new Date().getFullYear().toString()),
                month: path.join(__dirname, 'dmhy', 'main', new Date().getFullYear().toString(), (Array(2).join(0) + (new Date().getMonth() * 1 + 1)).slice(-2)),
                date: path.join(__dirname, 'dmhy', 'main', new Date().getFullYear().toString(), (Array(2).join(0) + (new Date().getMonth() * 1 + 1)).slice(-2), (Array(2).join(0) + new Date().getDate()).slice(-2)),
                predate: path.join(__dirname, 'dmhy', 'main', new Date().getFullYear().toString(), (Array(2).join(0) + (new Date().getMonth() * 1 + 1)).slice(-2), (Array(2).join(0) + (new Date().getDate() * 1 - 1)).slice(-2)),
            }
            if (!fs.existsSync(dirs.home)) {
                fs.mkdirSync(dirs.home);
            }
            if (!fs.existsSync(dirs.main)) {
                fs.mkdirSync(dirs.main);
            }
            if (!fs.existsSync(dirs.year)) {
                fs.mkdirSync(dirs.year);
            }
            if (!fs.existsSync(dirs.month)) {
                fs.mkdirSync(dirs.month);
            }
            if (!fs.existsSync(dirs.predate)) {
                fs.mkdirSync(dirs.predate);
            }
            if (!fs.existsSync(dirs.date)) {
                fs.mkdirSync(dirs.date);
            }
            var roundDownload = function (list, which) {
                console.log('正在下载第' + which + '个');
                downloadTorrent(list[which]['link'], list[which]['title'] + '.torrent', path.join(dirs.main, list[which]['dpath']), function (isDown) {
                    if (isDown) {
                        downloadedNum++;
                    }
                    if (which >= list.length - 1) {
                        fs.writeFileSync(path.join(__dirname, 'crontab.log'), '[' + date2str(new Date(), 'yyyy-MM-d h:m:s') + '] ' + downloadedNum + ' new torrent files.\n', {
                            flag: 'a'
                        });
                        console.log('下载完毕！下载了' + downloadedNum + '个文件');
                    } else {
                        roundDownload(list, which + 1);
                    }
                });
            };
            http.get('http://share.dmhy.org/topics/rss/rss.xml', function (res) {
                var resText = [];
                res.on('data', function (chunk) {
                    //console.log('BODY: ' + chunk);
                    resText.push(chunk);
                });
                res.on('end', function () {
                    var responseText = Buffer.concat(resText).toString();
                    fs.writeFile(path.join(dirs.main, 'result.xml'), responseText);
                    parseXML(responseText, function (err, result) {
                        var jsonObj = [];
                        console.dir(result['rss']['channel'][0]['item'].length);
                        for (var i in result['rss']['channel'][0]['item']) {
                            delete result['rss']['channel'][0]['item'][i]['description'];
                            result['rss']['channel'][0]['item'][i]['title'] = result['rss']['channel'][0]['item'][i]['title'][0].replace(/\//g, '-');
                            let hash = result['rss']['channel'][0]['item'][i]['enclosure'][0]['$']['url'].match(/[2-7A-Z]{32}/);
                            let d = new Date(Date.parse(result['rss']['channel'][0]['item'][i]['pubDate']));
                            let dpath = (d.getFullYear() + '/' +
                                (Array(2).join(0) + (d.getMonth() * 1 + 1)).slice(-2) + '/' +
                                (Array(2).join(0) + d.getDate()).slice(-2)) + '/';
                            result['rss']['channel'][0]['item'][i]['dpath'] = dpath;
                            result['rss']['channel'][0]['item'][i]['link'] = "http://dl.dmhy.org/" + dpath + base32to16(hash[0]) + ".torrent";
                            delete result['rss']['channel'][0]['item'][i]['enclosure'];
                            delete result['rss']['channel'][0]['item'][i]['author'];
                            delete result['rss']['channel'][0]['item'][i]['guid'];
                            delete result['rss']['channel'][0]['item'][i]['category'];
                            console.log(result['rss']['channel'][0]['item'][i]['title']);
                        }
                        //console.log(JSON.stringify(result));
                        fs.writeFile(path.join(dirs.main, 'result.json'), JSON.stringify(result));
                        var items = result['rss']['channel'][0]['item'];
                        roundDownload(items, 0);
                    });
                });
            }).on('error', function () {
                console.log('Error');
            });
        }
    },
    env: {
        run: function () {
            console.log(__dirname);
        }
    }
};
var downloadTorrent = function (url, filename, dir, callback) {
    console.log(url);
    console.log(dir);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    if (fs.existsSync(path.join(dir, filename))) {
        console.log('文件 "' + filename + '" 已存在');
        callback(false);
    } else {
        http.get(url, function (res) {
            var writeStream = fs.createWriteStream(path.join(dir, filename));
            writeStream.on('finish', function () {
                console.log('文件 "' + filename + '" 下载完成');
            });
            res.on('data', function (chunk) {
                writeStream.write(chunk);
            });
            res.on('end', function () {
                writeStream.end();
                callback(true);
            });
        });
    }
};
if (process.argv[2]) {
    resources[process.argv[2]].run();
} else {
    resources['nyaa'].run();
}