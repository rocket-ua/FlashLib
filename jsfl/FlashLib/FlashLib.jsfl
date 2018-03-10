/**
 * Created with WebStorm.
 * User: rocket
 * Date: 02.03.2018
 * Time: 00:16
 * To change this template use File | Settings | File Templates.
 */
function FlashLib($settings, $config) {
    var settings = {};
    var config = {};
    var scriptPath = '';

    if(!fl.getDocumentDOM()) {
        fl.trace('No opened documents found!');
        return;
    }

    settings = $settings;

    function start() {
        fl.outputPanel.clear();

        scriptPath = fl.scriptURI.substr(0, fl.scriptURI.lastIndexOf("/")+1);
        if(settings && settings.scriptPath) {
            scriptPath = settings.scriptPath;
        }

        //fl.trace(scriptPath);
        eval(FLfile.read(scriptPath + 'JSON.jsfl'));
        eval(FLfile.read(scriptPath + 'DEBUG.jsfl'));

        if(!document.pathURI) {
            fl.trace('This document do not saved yet.');
            fl.trace('Save document and try again.');
            return;
        }

        var configPath = document.pathURI.replace(document.name, 'FlashLibConfig.json');
        if (!FLfile.exists(configPath)) {
            createBaseConfig();
        }

        var configString = FLfile.read(configPath);
        config = JSON.decode(configString);

        if(config && config.libToJson) {
            startLibToJson();
        }

        if(config && config.exportImages) {
            startExportImages();
        }

        if(config && config.createAssetsList) {
            startCreateAssetsList();
        }
    }

    /**
     * Создать файл с базовой конфигурацией
     */
    function createBaseConfig() {
        var configPath = document.pathURI.replace(document.name, 'FlashLibConfig.json');
        var baseConfig = {
            basePath: document.pathURI.substr(0, document.pathURI.lastIndexOf("/")+1).replace('file:///Macintosh%20HD', ''),
            libToJson: {
                saveToFile: true,
                sayResultToConsole: false,
                buildForSelected: false
            },
            exportImages: {
                exportImages: true,
                overrideExistingFiles: false,
                addExtensions: false
            },
            createAssetsList: {
                saveToFile: true,
                sayResultToConsole: false
            }
        };
        var jsonBaseConfig = JSON.encode(baseConfig);
        FLfile.write(configPath, jsonBaseConfig);

        fl.trace('Created base config file.');
    }

    /**
     * Получить данные из библиотеки в виде json строки
     */
    function startLibToJson() {
        config.libToJson.basePath = config.basePath;
        eval(FLfile.read(scriptPath + 'LibToJson.jsfl'));
        LibToJson(settings, config.libToJson);
    }

    /**
     * Экспортировать графику из проекта
     */
    function startExportImages() {
        config.exportImages.basePath = config.basePath;
        eval(FLfile.read(scriptPath + 'ExportImages.jsfl'));
        ExportImages(settings, config.exportImages);
    }

    /**
     *  Создать файл с ссылками на импортированные ассеты
     */
    function startCreateAssetsList() {
        config.createAssetsList.basePath = config.basePath;
        eval(FLfile.read(scriptPath + 'CreateAssetsList.jsfl'));
        CreateAssetsList(settings, config.createAssetsList);
    }

    start();
}

function getConfigData() {
    var configPath = document.pathURI.replace(document.name, 'FlashLibConfig.json');
    var configString = FLfile.read(configPath);
    return configString;
}

if(fl.scriptURI !== 'unknown:') {
    FlashLib();
}

//FlashLib();