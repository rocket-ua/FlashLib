/**
 * Created with WebStorm.
 * User: rocket
 * Date: 02.03.2018
 * Time: 00:16
 * To change this template use File | Settings | File Templates.
 */

/*var config = {
    basePath: '',
    libToJson: {
        sayResultToConsole: false,
        saveToFiles: true,
        buildForSelected: false,
        saveFileName: null,
        saveFilesPath: null
    },
    exportImages: {
        exportImages: false,
        exportImagesPath: null,
        overrideExistingFiles: false,
        addExtensions: false
    },
    createGraphicsList: {
        createImagesList: false,
        imagesListPath: null,
        sayResultToConsole: false,
        saveToFile: true
    }
};*/

function FlashLib($settings, $config) {
    var settings = {};
    var config = {
        basePath: '',
        libToJson: {
            saveToFile: true,
            sayResultToConsole: false,
            buildForSelected: false
        },
        exportImages: {
            exportImages: false,
            overrideExistingFiles: false,
            addExtensions: false
        },
        createGraphicsList: {
            saveToFile: false,
            createImagesList: false,
            sayResultToConsole: false
        }
    };
    var basePath = '';

    if(!fl.getDocumentDOM()) {
        fl.trace('No opened documents found!');
        return;
    }

    settings = $settings;

    function start() {
        fl.outputPanel.clear();

        basePath = fl.scriptURI.substr(0, fl.scriptURI.lastIndexOf("/")+1);
        if(settings && settings.basePath) {
            basePath = settings.basePath;
        }
        //fl.trace(basePath);

        eval(FLfile.read(basePath + 'JSON.jsfl'));
        //eval(FLfile.read(basePath + 'DEBUG.jsfl'));

        if(!document.pathURI) {
            fl.trace('This document do not saved yet.');
            fl.trace('Save document and try again.');
            return;
        }

        var configPath = document.pathURI.replace(document.name, 'FlashLibConfig.json');
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

        if(config && config.createGraphicsList) {
            startCreateGraphicsList();
        }
    }

    /**
     * Получить данные из библиотеки в виде json строки
     */
    function startLibToJson() {
        fl.runScript(basePath + 'LibToJson.jsfl', 'LibToJson', settings, config.libToJson);
    }

    /**
     * Экспортировать графику из проекта
     */
    function startExportImages() {
        fl.runScript(basePath + 'ExportImages.jsfl', 'ExportImages', settings, config.exportImages);
    }

    /**
     *  Создать файл с ссылками на импортированные ассеты
     */
    function startCreateGraphicsList() {
        fl.runScript(basePath + 'CreateGraphicsList.jsfl', 'CreateGraphicsList', settings, config.createGraphicsList);
    }

    start();
}