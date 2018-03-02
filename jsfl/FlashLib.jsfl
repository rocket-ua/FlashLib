/**
 * Created with WebStorm.
 * User: rocket
 * Date: 02.03.2018
 * Time: 00:16
 * To change this template use File | Settings | File Templates.
 */

var config = {
    libToJson: {
        sayResultToConsole: true,
        saveToFiles: true,
        buildForSelected: false,
        saveFileName: null,
        saveFilesPath: null
    },
    exportImages: {
        exportImages: false,
        exportImagesPath: null,
        overrideExistingFiles: false,
        addExtensions: false,
        removeExtensions: false
    }
};

var basePath = fl.scriptURI.substr(0, fl.scriptURI.lastIndexOf("/")+1);

function evalScripts() {
    eval(FLfile.read(basePath + 'JSON.jsfl'));
    eval(FLfile.read(basePath + 'DEBUG.jsfl'));
}

function start() {
    fl.outputPanel.clear();

    if(!fl.getDocumentDOM()) {
        fl.trace('No open documents found!');
        return;
    }

    //basePath = fl.scriptURI.substr(0, fl.scriptURI.lastIndexOf("/")+1);
    fl.trace(basePath);

    //eval(FLfile.read(basePath + 'JSON.jsfl'));
    //eval(FLfile.read(basePath + 'DEBUG.jsfl'));

    //fl.trace(basePath);
    //fl.trace(DEBUG.traceElementProperties(document));

    if(!document.pathURI) {
        fl.trace('This document do not save yet.');
        return;
    }

    var configPath = document.pathURI.replace(document.name, 'LibToJsonConfig.json');
    var configString = FLfile.read(configPath);

    if(configString) {
        config = JSON.decode(configString);
    } else {
        fl.trace('Config not found!');
        fl.trace('Used default config.');
    }

    if(config && config.libToJson) {
        startLibToJson();
    }

    if(config && config.exportImages) {
        startExportImages();
    }
}

/**
 * Получить данные из библиотеки в виде json строки
 */
function startLibToJson() {
    fl.runScript(basePath + 'LibToJson.jsfl', 'start', config.libToJson);
}

/**
 * Экспортировать графику из проекта
 */
function startExportImages() {
    fl.runScript(basePath + 'ExportImages.jsfl', 'start', config.exportImages);
}

evalScripts();
start();