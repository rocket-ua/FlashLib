#!/usr/bin/env node
'use strict';

var exec = require('child_process').exec;
var path = require('path');
var minimist = require('minimist');

var startParams = minimist(process.argv.slice(2));

function open(target, appName, callback) {
    var opener;

    if (typeof(appName) === 'function') {
        callback = appName;
        appName = null;
    }

    switch (process.platform) {
        case 'darwin':
            if (appName) {
                opener = 'open -a "' + escape(appName) + '"';
            } else {
                opener = 'open';
            }
            break;
        case 'win32':
            // if the first parameter to start is quoted, it uses that as the title
            // so we pass a blank title so we can quote the file we are opening
            if (appName) {
                opener = 'start "" "' + escape(appName) + '"';
            } else {
                opener = 'start ""';
            }
            break;
        default:
            if (appName) {
                opener = escape(appName);
            } else {
                // use Portlands xdg-open everywhere else
                opener = path.join(__dirname, '../vendor/xdg-open');
            }
            break;
    }

    if (process.env.SUDO_USER) {
        opener = 'sudo -u ' + process.env.SUDO_USER + ' ' + opener;
    }
    return exec(opener + ' "' + escape(target) + '"', callback);
}

function escape(s) {
    return s.replace(/"/g, '\\\"');
}

//function pathTo(asset) {
//    return path.join(__dirname, 'support', asset);
//}

function onFlaOpened() {
    runJSFL();
}

function runJSFL() {
    var newPath = path.join(__dirname, '..', 'jsfl', 'FlashLib.jsfl');
    open(newPath, null, onJSFLComplete);
}

function onJSFLComplete(error, stdout, stderr) {
    console.log('JSFL Complete');
}


if(startParams.hasOwnProperty('open') && startParams['open']) {
    open(startParams['open'], null, onFlaOpened);
} else {
    runJSFL();
}
