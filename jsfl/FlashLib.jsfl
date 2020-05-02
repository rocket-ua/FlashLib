/**
 *
 */
function CreateAssetsList($settings, $config) {
    var settings = {};
    var config = {};
    var scriptPath = '';
    var assetsList = {};

    if(!fl.getDocumentDOM()) {
        fl.trace('No opened documents found!');
        return;
    }

    settings = $settings;
    config = $config;

    if (!config || (!config.sayResultToConsole && !config.saveToFile)) {
        return;
    }

    /*assetsList = {
        baseUrl: './',
        libs: [
            { name: 'FlashLib', path: 'FlashLib.json', type: 'json' }
        ],
        assets: [],
        metaData: {
            type: 'FlashLib',
            date: new Date()
        }
    };*/
    getBaseAssetList();
    setAssetListDefaultParams();

    if(config.libSettings) {
        if(config.libSettings.basePath) {
            assetsList.baseUrl = config.libSettings.basePath;
        }
        if(config.libSettings.path) {
            assetsList.libs[0].path = config.libSettings.path;
        }
    }

    function getBaseAssetList() {
        var baseAssetListPath = document.pathURI.replace(document.name, 'BaseAssetsList.json');
        if (FLfile.exists(baseAssetListPath)) {
            fl.trace('Used BaseAssetsList.json');
            var configString = FLfile.read(baseAssetListPath);
            assetsList = JSON.decode(configString);
        } else {
            assetsList = createBaseAssetList();
        }
    }

    function createBaseAssetList() {
        return {
            baseUrl: './',
            libs: [
                { name: config.flashLibName || 'FlashLib', path: 'FlashLib.json', type: 'json' }
            ],
            assets: [],
            metaData: {
                type: 'FlashLibAssets',
                date: new Date()
            }
        };
    }

    function setAssetListDefaultParams() {
        assetsList.baseUrl = './';
        assetsList.libs[0].name = config.flashLibName || 'FlashLib';
        assetsList.libs[0].path = 'FlashLib.json';
        assetsList.libs[0].type = 'json';
        assetsList.metaData.type = 'FlashLibAssets';
        assetsList.metaData.date = new Date();
    }

    function start() {
        if(!config.exportImages) {
            return;
        }

        scriptPath = fl.scriptURI.substr(0, fl.scriptURI.lastIndexOf("/")+1);
        if(settings && settings.scriptPath) {
            scriptPath = settings.scriptPath;
        }
        
        eval(FLfile.read(scriptPath + 'JSON.js'));
        //eval(FLfile.read(basePath + 'DEBUG.js'));

        this.docPath = createSaveFilesPath();
        //добавляем папку в которую будем скрладывать графику
        //this.docPath += 'exported/';
        this.docPath += document.name + '_lib' + '/';

        var lib = document.library;
        var libItems = lib.items;
        //пробежать по всем элементам библиотеки и экспортировать графику
        libItems.forEach(function (item) {
            switch(item.itemType) {
                case 'bitmap':
                    getImagePath(item);
                    break;
                case 'sound':
                    getSoundPath(item);
                    break;
            }
        });
        /*for each(var item in libItems) {
            if (item.itemType !== 'bitmap') {
                continue;
            }
            getImagePath(item);
        }*/

        var jsonString = JSON.encode(assetsList);
        if(jsonString && config && config.sayResultToConsole) {
            fl.trace(jsonString);
        }
        if(jsonString && config && config.saveToFile) {
            saveResultToFile(jsonString);
        }
    }

    /**
     * Получить путь к файлу в который сохранить библиотеку
     * @returns {string}
     */
    function createSaveFilesPath() {
        var path = document.path.replace(document.name, '');
        if (config && config.basePath && config.basePath !== '') {
            path += config.basePath;
        }

        return FLfile.platformPathToURI(path);
    }

    /**
     * Получить путь к имени файла
     * @param $item
     */
    function getImagePath($item) {
        var name = $item.name.replace(/(.png|.jpg)/, '');
        var type = $item.hasValidAlphaLayer ? '.png' : '.jpg';
        if(config.usePng) {
            type = '.png';
        }

        var graphicData = {
            name : name,
            path : document.name + '_lib' + '/' + name + type,
            type : 'image'
        };
        assetsList.assets.push(graphicData);
    }

    function getSoundPath($item) {
        /*DEBUG.traceElementProperties($item);
        fl.trace('------------');*/
        var name = $item.name.replace(/(.mp3|.wav)/, '');
        var type = $item.compressionType === 'RAW' ? '.wav' : '.mp3';
        var graphicData = {
            name : name,
            path : document.name + '_lib' + '/' + name + type,
            //path : document.name + '_lib' + '/' + $item.name,
            type : 'sound'
        };
        assetsList.assets.push(graphicData);
    }

    /**
     * Сохранить данные библиотеки в файл
     * @param $result {string}
     */
    function saveResultToFile($result) {
        var path = createSaveFilesPath();
        var fileName = "FlashLibAssets.json";
        if(config && config.saveFileName) {
            fileName = config.saveFileName;
        }

        path += fileName;
        FLfile.write(path, $result);

        fl.trace("Assets list saved to " + path);
    }

    start();
}

/**
 * Created with WebStorm.
 * User: rocket
 * Date: 02.03.2018
 * Time: 01:56
 * To change this template use File | Settings | File Templates.
 */

DEBUG = {
    /**
     * Вызов рекурсивной функции для трейса свойист в значений элемента
     * @param $element
     * @param $index
     */
    traceElementPropertysRecursivity: function ($element, $index) {
        this._traceElementPropertysRecursivity($element, $index);
        fl.trace("");
        fl.trace("=============================================");
        fl.trace("");
    },
    /**
     * Рекурсивная функция которая трейсит все свойства и значения элемента
     * @param $element
     * @param $index
     * @private
     */
    _traceElementPropertysRecursivity: function ($element, $index) {
        if($index > 10) {
            return;
        }

        var offset = "";
        for(var i = 0; i < $index; i++) {
            offset += "~~";
        }
        for (var property in $element) {
            try {
                fl.trace(offset + property + ": " + $element[property]);
                if(typeof($element[property]) === "object" && property !== "layer") {
                    this._traceElementPropertysRecursivity($element[property], $index + 1);
                }
            } catch ($error) {
                fl.trace(offset + property + ": " + $error);
            }
        }
    },
    traceElementProperties: function ($element) {
        fl.trace("------------------------------------");
        try {
            for(var property in $element) {
                try {
                    fl.trace(property + ": " + $element[property]);
                } catch ($error) {
                    fl.trace(property + ": " + $error);
                }
            }
        } catch ($errr) {
            fl.trace($errr);
        }

        fl.trace("------------------------------------");
    }
};
/**
 * Экспорт картинок из библиотеки FlashIDE с сохранением структуры как в библиотеке.
 * Если в функцию start передан объекр в котором есть поле exportImagesPath, то путь записаный в этом поле
 * будет корневой папкой для сохранения файлов, иначе коневой папкой будет папка в которой лежит fla файл
 * из библиотеки которого экспортируются картинки
 */
function ExportImages($settings, $config) {
    var settings = {};
    var config = {};
    var scriptPath = '';

    if(!fl.getDocumentDOM()) {
        fl.trace('No opened documents found!');
        return;
    }

    settings = $settings;
    config = $config;

    if (!config || !config.exportImages) {
        return;
    }

    function start() {
        scriptPath = fl.scriptURI.substr(0, fl.scriptURI.lastIndexOf("/")+1);
        if(settings && settings.scriptPath) {
            scriptPath = settings.scriptPath;
        }

        //eval(FLfile.read(scriptPath + 'JSON.js'));
        //eval(FLfile.read(scriptPath + 'DEBUG.js'));

        this.docPath = createSaveFilesPath();
        //добавляем папку в которую будем скрладывать графику
        //this.docPath += 'exported/';
        this.docPath += document.name + '_lib' + '/';
        //fl.trace(this.docPath);

        var lib = document.library;
        var libItems = lib.items;
        //пробежать по всем элементам библиотеки и экспортировать графику
        /*for each(var item in libItems) {
            if (item.itemType !== 'bitmap') {
                continue;
            }
            //экспортируем битмапку
            exportImage(item);
        }*/

        libItems.forEach(function (item) {
            switch(item.itemType) {
                case 'bitmap':
                    exportImage(item);
                    break;
                case 'sound':
                    exportSound(item);
                    break;
            }
        }, this);
    }

    /**
     * Получение пути для сохранения файлов карт
     */
    /*function createSaveFilesPath() {
        var path = document.pathURI.replace(document.name, '');
        if (config && config.basePath && config.basePath !== '') {
            path = config.basePath;
        }

        if (path.search('file:///') !== 0) {
            path = 'file:///' + path;
            path = encodeURI(path);
        }

        return path;
    }*/

    function createSaveFilesPath() {
        var path = document.path.replace(document.name, '');
        if (config && config.basePath && config.basePath !== '') {
            path += config.basePath;
        }

        return FLfile.platformPathToURI(path);
    }

    function exportImage($item) {
        //переименовываем битмапку, убираем пробелы и добавляем разрешение
        //renameItem($item);

        //поучить локальный путь до файла картинки
        var path = $item.name.substr(0, $item.name.lastIndexOf('/'));

        //проверить наличие папки для экспорта файла.
        //если папки нет, она создасться
        checkFolder(path);

        //экспортировать файл в папку
        var filePath = createPathWithFileName($item);

        if (config.overrideExistingFiles) {
            exportCurrentFile($item, filePath);
        } else {
            if (FLfile.exists(filePath)) {
                fl.trace('File ' + filePath + ' already exists, rewriting is prohibited in the config file.')
            } else {
                exportCurrentFile($item, filePath);
            }
        }
    }

    function exportSound($item) {
        //переименовываем битмапку, убираем пробелы и добавляем разрешение
        //renameItem($item);

        //поучить локальный путь до файла картинки
        var path = $item.name.substr(0, $item.name.lastIndexOf('/'));

        //проверить наличие папки для экспорта файла.
        //если папки нет, она создасться
        checkFolder(path);

        //экспортировать файл в папку
        //var filePath = createPathWithFileName($item);
        var filePath = this.docPath + $item.name.replace(/(.wav|.mp3)/, '.mp3');

        if (config.overrideExistingFiles) {
            exportCurrentFile($item, filePath);
        } else {
            if (FLfile.exists(filePath)) {
                fl.trace('File ' + filePath + ' already exists, rewriting is prohibited in the config file.')
            } else {
                exportCurrentFile($item, filePath);
            }
        }
    }

    function createPathWithFileName($item) {
        var filePath = this.docPath;
        var fileName = $item.name;
        fileName = fileName.replace(/(.png|.jpg)/, '');

        var ext = $item.hasValidAlphaLayer ? '.png' : '.jpg';
        if(config.usePng) {
            ext = '.png';
        }

        /*if ($item.hasValidAlphaLayer) {
            fileName += ".png";
        } else {
            fileName += ".jpg";
        }*/

        fileName += ext;
        filePath += fileName;
        return filePath;
    }

    function exportCurrentFile($item, $filePath) {
        var result = $item.exportToFile($filePath);
        //показать сообщение при уданочм/неудачном экспорте
        if (result) {
            fl.trace('The file was successfully exported to ' + $filePath);
        } else {
            fl.trace('File not exported ' + $filePath);
        }
    }

    function renameItem($item) {
        document.library.selectItem($item.name);

        var tempArr = $item.name.split('/');
        var tempName = tempArr[tempArr.length - 1].replace(/\s/, '');
        //if (config.addExtensions) {
            tempName += tempName.search(/(.png|.jpg)/) > -1 ? '' : '.png';
        //}

        document.library.renameItem(tempName);
        document.library.selectNone();
    }

    function checkFolder($folderPath) {
        var arr = $folderPath.split('/');
        var temp = '';
        var index = 0;
        do {
            if (arr[index] !== '') {
                temp += arr[index] + '/';
                // если каталога нет, созадем его
                if (!FLfile.exists(this.docPath + temp)) {
                    var result = FLfile.createFolder(this.docPath + temp);
                    if(result) {
                        fl.trace('Created directory: ' + (this.docPath + temp));
                    } else {
                        fl.trace('Error created directory: ' + (this.docPath + temp));
                    }
                }
            }
            index++;
        } while (index < arr.length);
    }

    start();
}
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
            //basePath: document.pathURI.substr(0, document.pathURI.lastIndexOf("/")+1).replace('file:///Macintosh%20HD', '') + 'build/',
            basePath: './build/',
            libToJson: {
                flashLibName: 'FlashLib',
                saveToFile: true,
                sayResultToConsole: false,
                buildForSelected: false
            },
            exportImages: {
                flashLibName: 'FlashLib',
                exportImages: true,
                overrideExistingFiles: false,
                addExtensions: false,
                usePng: false
            },
            createAssetsList: {
                libName: document.name,
                saveToFile: true,
                sayResultToConsole: false,
                usePng: false,
                libSettings: {
                    path: "",
                    basePath: ""
                }
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
        LibToJson(settings, config.libToJson);
    }

    /**
     * Экспортировать графику из проекта
     */
    function startExportImages() {
        config.exportImages.basePath = config.basePath;
        ExportImages(settings, config.exportImages);
    }

    /**
     *  Создать файл с ссылками на импортированные ассеты
     */
    function startCreateAssetsList() {
        config.createAssetsList.basePath = config.basePath;
        config.createAssetsList.exportImages = config.exportImages.exportImages;
        CreateAssetsList(settings, config.createAssetsList);
    }

    start();
}

function getConfigData() {
    var configPath = document.pathURI.replace(document.name, 'FlashLibConfig.json');
    var configString = FLfile.read(configPath);
    return configString;
}

//FlashLib();
/**
 * Created with WebStorm.
 * User: rocket
 * Date: 02.03.2018
 * Time: 01:42
 * To change this template use File | Settings | File Templates.
 */
var JSON = {
    /**
     * Encodes an Object as a JSON String
     * Non-integer/string keys are skipped in the object, as are keys that point to a function.
     *
     * @name    JSON.encode
     * @param    {Object}    obj        The json-serializble *thing* to be converted
     * @returns    {String}            A JSON String
     */
    encode: function (obj) {
        if (obj === null) {
            return 'null';
        }

        var type = typeof obj;

        if (type === 'undefined') {
            return undefined;
        }
        if (type === 'number' || type === 'boolean') {
            return '' + obj;
        }
        if (type === 'string') {
            return this.quoteString(obj);
        }
        if (type === 'object') {
            if (obj.constructor === Date) {
                var month = obj.getUTCMonth() + 1,
                    day = obj.getUTCDate(),
                    year = obj.getUTCFullYear(),
                    hours = obj.getUTCHours(),
                    minutes = obj.getUTCMinutes(),
                    seconds = obj.getUTCSeconds(),
                    milli = obj.getUTCMilliseconds();

                if (month < 10) {
                    month = '0' + month;
                }
                if (day < 10) {
                    day = '0' + day;
                }
                if (hours < 10) {
                    hours = '0' + hours;
                }
                if (minutes < 10) {
                    minutes = '0' + minutes;
                }
                if (seconds < 10) {
                    seconds = '0' + seconds;
                }
                if (milli < 100) {
                    milli = '0' + milli;
                }
                if (milli < 10) {
                    milli = '0' + milli;
                }
                return '"' + year + '-' + month + '-' + day + 'T' +
                    hours + ':' + minutes + ':' + seconds +
                    '.' + milli + 'Z"';
            }
            if (obj.constructor === Array) {
                var ret = [];
                for (var i = 0; i < obj.length; i++) {
                    ret.push(JSON.encode(obj[i]) || 'null');
                }
                return '[' + ret.join(',') + ']';
            }
            var name,
                val,
                pairs = [];

            for (var k in obj) {
                // Only include own properties,
                // Filter out inherited prototypes
                if (!Object.prototype.hasOwnProperty.call(obj, k)) {
                    continue;
                }

                // Keys must be numerical or string. Skip others
                type = typeof k;
                if (type === 'number') {
                    name = '"' + k + '"';
                } else if (type === 'string') {
                    name = this.quoteString(k);
                } else {
                    continue;
                }
                type = typeof obj[k];

                // Invalid values like these return undefined
                // from toJSON, however those object members
                // shouldn't be included in the JSON string at all.
                if (type === 'function' || type === 'undefined') {
                    continue;
                }
                val = JSON.encode(obj[k]);
                pairs.push(name + ':' + val);
            }
            return '{' + pairs.join(',') + '}';
        }

    },

    /**
     * Evaluates a given piece of json source.
     * @param    {String}    src
     * @name    JSON.decode
     */
    decode: function (src) {
        if (src != null && src != '' && src != undefined) {
            return eval('(' + src + ')');
        }
        return null;
    },

    toString: function () {
        return '[class JSON]';
    },

    /**
     * Helper function to correctly quote nested strings
     * @ignore
     */
    quoteString: function (string) {
        var escapeable = /["\\\x00-\x1f\x7f-\x9f]/g;
        var meta =
            {
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"': '\\"',
                '\\': '\\\\'
            };

        if (string.match(escapeable)) {
            return '"' + string.replace(escapeable, function (a) {
                var c = meta[a];
                if (typeof c === 'string') {
                    return c;
                }
                c = a.charCodeAt();
                return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
            }) + '"';
        }
        return '"' + string + '"';
    }

};
/**
 * Config example
 * {
 *      saveToFile: false,
 *      sayResultToConsole: true,
 *      buildForSelected: false
 * }
 */
function LibToJson($settings, $config) {
    var stageData = {};
    var libData = {};
    var jsonLib = {};
    var scriptPath = '';

    if (!fl.getDocumentDOM()) {
        fl.trace('No opened documents found!');
        return;
    }

    settings = $settings;
    config = $config;

    if (!config || (!config.sayResultToConsole && !config.saveToFile)) {
        return;
    }

    function start() {
        scriptPath = fl.scriptURI.substr(0, fl.scriptURI.lastIndexOf('/')+1);
        if(settings && settings.scriptPath) {
            scriptPath = settings.scriptPath;
        }

        createLibItems();
        createStage();

        jsonLib = {
            stage: stageData,
            lib: libData,
            metaData: {
                type: 'FlashLib',
                name: config.flashLibName || '',
                date: new Date().toDateString(),
            }
        };

        //Библиотека JSON подключается отдельно
        var jsonString = JSON.encode(jsonLib);

        if(jsonString && config && config.sayResultToConsole) {
            fl.trace(jsonString);
        }
        if(jsonString && config && config.saveToFile) {
            saveResultToFile(jsonString);
        }
    }

    /**
     * Сохранить данные библиотеки в файл
     * @param $result {string}
     */
    function saveResultToFile($result) {
        var path = createSaveFilesPath();
        var fileName = 'FlashLib.json';
        if(config && config.saveFileName) {
            fileName = config.saveFileName;
        }

        checkFolder(path);

        path = path + fileName;
        FLfile.write(path, $result);

        fl.trace('Library saved to ' + path);
    }

    /**
     *
     * @param $folderPath
     */
    function checkFolder($folderPath) {
        $folderPath = $folderPath.replace('file:///', '');
        var arr = $folderPath.split('/');
        var temp = '';
        var index = 0;
        do {
            if (arr[index] !== '') {
                temp += arr[index] + '/';
                // если каталога нет, созадем его
                if (!FLfile.exists('file:///' + temp)) {
                    var result = FLfile.createFolder('file:///' + temp);
                    if(result) {
                        fl.trace('Created directory: ' + ('file:///' + temp));
                    } else {
                        fl.trace('Error creating directory: ' + ('file:///' + temp));
                    }

                }
            }
            index++;
        } while (index < arr.length);
    }

    /**
     * Получить путь к файлу в который сохранить библиотеку
     * @returns {string}
     */
    function createSaveFilesPath() {
        var path = document.path.replace(document.name, '');
        if (config && config.basePath && config.basePath !== '') {
            path += config.basePath;
        }

        return FLfile.platformPathToURI(path);
    }

    function createStage() {
        stageData.width = document.width;
        stageData.height = document.height;
        stageData.backgroundColor = document.backgroundColor;
        stageData.timeline = {};
    }

    /**
     * Создать библиотеку
     * Если есть выбранные элменты библиотеки, то создаются только они
     * Если нет выбранных элементов, то создаются все элементы библиотеки
     */
    function createLibItems() {
        var lib = document.library;

        var items = lib.items;


        if(config.buildForSelected) {
            var selectedItems = lib.getSelectedItems();
            if(selectedItems && selectedItems.length > 0) {
                items = selectedItems;
            }
        }
        var jsonItem = {};
        /*for each(var item in items) {
            if(checkDataExist(item.name)) {
                continue;
            }
            jsonItem = createNewLibItem(item);
            putToFolder(item.name, jsonItem);
        }*/

        items.forEach(function (item) {
            if(!checkDataExist(item.name)) {
                jsonItem = createNewLibItem(item);
                putToFolder(item.name, jsonItem);
            }
        }, this);
    }

    /**
     * Положить новый элемент по такому пути как во флешовой библиотеке
     * @param $path
     * @param $item
     */
    function putToFolder($path, $item) {
        var pathArr = $path.split('/');
        var obj = libData;
        for(var i = 0; i < pathArr.length - 1; i++) {
            //if(!obj[pathArr[i]]) {
            if(!obj.hasOwnProperty(pathArr[i])) {
                obj[pathArr[i]] = {};
            }
            obj = obj[pathArr[i]];
        }
        obj[pathArr[pathArr.length - 1]] = $item;
    }

    /**
     * Проверить сущесвует ли элемент в json библиртеке
     * @param $path путь по которому должен находиться элемент
     * @returns {boolean}
     */
    function checkDataExist($path) {
        var pathArr = $path.split('/');
        var obj = libData;
        for(var i = 0; i < pathArr.length; i++) {
            //if(!obj[pathArr[i]]) {
            if(!obj.hasOwnProperty(pathArr[i])) {
                return false;
            }
            //obj = obj[pathArr[i]];
        }
        return true;
    }

    /**
     * Создать новый элемент библиотеке
     * Определение какой тип лемента нуно создать и создание элемента
     * Добавление свойств в созданный элемент
     * @param $itemData объект из флешовой библиотеки
     * @returns {*}
     */
    function createNewLibItem($itemData) {
        var item = null;
        switch ($itemData.itemType)
        {
            case 'folder':
                item = new LibItemFolder();
                break;
            case 'movie clip':
                item = new LibItemMovieClip();
                break;
            case 'graphic':
                item = new LibItemGraphic();
                break;
            case 'bitmap':
                item = new LibItemBitmap();
                break;
            case 'font':
                item = new LibItemFont();
                break;
            case 'button':
                item = new LibItemButton();
                break;
        }

        if(item) {
            item.parseData($itemData);
        }
        return item;
    }

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

    /**
     * Бановый класс всех элементов
     * @constructor
     */
    function BaseItem() {

    }

    /**
     * Назначение параметров объекта параметрами из флешового объекта
     * @param $data
     */
    BaseItem.prototype.parseData = function ($data) {
        for (var property in this) {
            try {
                if(property === 'parseData') {
                    continue;
                }
                if($data[property] !== undefined && this[property] !== undefined) {
                    /*if(this[property] != $data[property]) {
                        this[property] = $data[property];
                    } else {
                        delete this[property];
                    }*/
                    this[property] = $data[property];
                }
            } catch (err) {
                fl.trace(err);
            }

        }
    };

///////////////////////////////////////////////////////////

    /**
     * Базовый объект элеента библиотеки
     * Изначально имеет в себе все основные параметры элементов библиотеки
     * @constructor
     */
    function LibItemBase() {
        BaseItem.apply(this, arguments);

        this.itemType = '';
        this.name = '';
        this.linkageExportForAS = false;
        this.linkageClassName = '';
    }

    LibItemBase.prototype = new BaseItem();
    LibItemBase.constructor = LibItemBase;

///////////////////////////////////////////////////////////

    /**
     * Элемент библиотеки битмапка
     * @constructor
     */
    function LibItemBitmap() {
        LibItemBase.apply(this, arguments);

        //this.sourceFilePath = '';
        //this.sourceFileExists = false;
        //this.sourceFileIsCurrent = false;
    }

    LibItemBitmap.prototype = new LibItemBase();
    LibItemBitmap.constructor = LibItemBitmap;

///////////////////////////////////////////////////////////

    /**
     * Элемент библиотеки твин
     * @constructor
     */
    function LibItemTween() {
        LibItemBase.apply(this, arguments);

        this.startFrame = 0;
        this.duration = 0;
        this.tweenType = 'motion';
        this.geometricTransform = [];
    }

    LibItemTween.prototype = new LibItemBase();
    LibItemTween.constructor = LibItemTween;

    LibItemTween.prototype.parseData = function ($data) {
        BaseItem.prototype.parseData.apply(this, arguments);

        //DEBUG.traceElementPropertysRecursivity($data, 0);

        for(var i = 1; i < this.duration; i++) {
            this.geometricTransform.push($data.getGeometricTransform(i));
        }
    };

///////////////////////////////////////////////////////////

    /**
     * Элемент библиотеки мувиклип
     * @constructor
     */
    function LibItemMovieClip() {
        LibItemBase.apply(this, arguments);
        this.timeline = null;
        this.symbolType = 'movie clip';
        //this.scalingGrid = false;
        //this.scalingGridRect = null;
    }

    LibItemMovieClip.prototype = new LibItemBase();
    LibItemMovieClip.constructor = LibItemMovieClip;

    LibItemMovieClip.prototype.parseData = function ($data) {
        BaseItem.prototype.parseData.apply(this, arguments);

        this.timeline = new TimelineItem();
        this.timeline.parseData($data.timeline);
    };

///////////////////////////////////////////////////////////

    /**
     * Элемент библиотеки мувиклип
     * @constructor
     */
    function LibItemButton() {
        LibItemBase.apply(this, arguments);
        this.timeline = null;
        this.symbolType = 'button';
        //this.scalingGrid = false;
        //this.scalingGridRect = null;
    }

    LibItemButton.prototype = new LibItemBase();
    LibItemButton.constructor = LibItemButton;

    LibItemButton.prototype.parseData = function ($data) {
        BaseItem.prototype.parseData.apply(this, arguments);

        this.timeline = new TimelineItem();
        this.timeline.parseData($data.timeline);
    };

///////////////////////////////////////////////////////////

    /**
     * Элмент библиотеки графика
     * @constructor
     */
    function LibItemGraphic() {
        LibItemBase.apply(this, arguments);

        this.timeline = null;
        this.symbolType = 'graphic';
        //this.scalingGrid = false;
        //this.scalingGridRect = null;
    }

    LibItemGraphic.prototype = new LibItemBase();
    LibItemGraphic.constructor = LibItemGraphic;

    LibItemGraphic.prototype.parseData = function ($data) {
        BaseItem.prototype.parseData.apply(this, arguments);

        this.timeline = new TimelineItem();
        this.timeline.parseData($data.timeline);
    };

///////////////////////////////////////////////////////////

    /**
     * Элеиент библиотеки встроенный шрифт
     * @constructor
     */
    function LibItemFont() {
        LibItemBase.apply(this, arguments);

        this.itemType = '';
        this.name = '';
        this.linkageExportForAS = '';
        this.linkageClassName = '';
        this.font = 'Arial';
        this.bitmap = '';
        this.bold = false;
        this.italic = false;
        this.size = 14;
    }

    LibItemFont.prototype = new LibItemBase();
    LibItemFont.constructor = LibItemFont;

    LibItemFont.prototype.parseData = function ($data) {
        BaseItem.prototype.parseData.apply(this, arguments);

        /*fl.trace($data.itemType);
        fl.trace($data.name);
        fl.trace($data.linkageExportForAS);
        fl.trace($data.linkageClassName);*/

        /*fl.trace($data.bitmap);
        fl.trace($data.bold);
        fl.trace($data.embeddedCharacters);
        fl.trace($data.embedRanges);
        fl.trace($data.embedVariantGlyphs);
        fl.trace($data.font);
        fl.trace($data.isDefineFont4Symbol);
        fl.trace($data.italic);
        fl.trace($data.size);*/

        //BaseItem.prototype.parseData.apply(this, arguments);
    };

///////////////////////////////////////////////////////////

    /**
     * Элеиент библиотеки папка
     * @constructor
     */
    function LibItemFolder() {
        LibItemBase.apply(this, arguments);

        this.itemType = '';
        this.name = '';
        this.linkageExportForAS = '';
        this.linkageClassName = '';
    }

    LibItemFolder.prototype = new LibItemBase();
    LibItemFolder.constructor = LibItemFolder;

    LibItemFont.prototype.parseData = function ($data) {
        BaseItem.prototype.parseData.apply(this, arguments);


    };

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

    /**
     * Получение типа графического элемента
     * @param $item
     * @returns {*}
     */
    function getElementType($item) {
        var type = $item['elementType'];
        if(type === 'instance') {
            type = $item['instanceType'];
            if(type !== 'bitmap') {
                type = $item['symbolType'];
            }
        }
        return type;
    }

    /**
     * Создание графияеского элемента
     * @param $item
     * @returns {*}
     */
    function createElementLibItem($item) {
        var type = getElementType($item);
        var item = null;
        switch (type) {
            case 'text':
                item = new ElementTextFieldItem();
                break;
            case 'shape':
                item = new ElementShapeItem();
                break;
            default:
                item = new ElementItem();
        }

        item.parseData($item);

        return item;
    }

    /**
     * Таймлайн
     * @constructor
     */
    function TimelineItem() {
        BaseItem.apply(this, arguments);

        this.name = '';
        this.layers = null;
        this.frameCount = 0;
        this.layerCount = 0;
    }

    TimelineItem.prototype = new BaseItem();
    TimelineItem.constructor = Timeline;

    TimelineItem.prototype.parseData = function ($data) {
        BaseItem.prototype.parseData.apply(this, arguments);

        this.layers = [];
        var newLayer = null;
        $data.layers.reverse().forEach(function (layer) {
            if(layer.layerType === 'guide') {
                return;
            }
            newLayer = new LayerItem();
            newLayer.parseData(layer);
            this.layers.push(newLayer);
        }, this);
    };

///////////////////////////////////////////////////////////

    /**
     * Элемент слой на таймлайне
     * @constructor
     */
    function LayerItem() {
        BaseItem.apply(this, arguments);

        this.name = '';
        this.layerType = '';
        this.frameCount = 0;
        this.frames = null;
        this.parentLayer = null;
        this.visible = true;
        this.locked = false;
    }

    LayerItem.prototype = new BaseItem();
    LayerItem.constructor = LayerItem;

    LayerItem.prototype.parseData = function ($data) {
        BaseItem.prototype.parseData.apply(this, arguments);

        this.frames = [];
        var newFrame = null;
        $data.frames.forEach(function (frame, index) {
            newFrame = new FrameItem(index);
            newFrame.parseData(frame);
            this.frames.push(newFrame);
        }, this);

        if($data.parentLayer) {
            this.parentLayer = $data.parentLayer.name;
        }
    };

///////////////////////////////////////////////////////////

    /**
     * Кадр на слое на таймлайне конкретного элемента
     * @constructor
     */
    function FrameItem($index) {
        BaseItem.apply(this, arguments);

        this.name = '';
        this.elements = null;
        this.actionScript = null;
        this.startFrame = 0;
        this.duration = 1;
        this.index = $index;
        //this.soundLibraryItem = null;
        this.isEmpty = true;
        this.tweenType = 'none';
        this.tweenInstanceName = '';
        this.tweenObj = null;
    }

    FrameItem.prototype = new BaseItem();
    FrameItem.constructor = FrameItem;

    FrameItem.prototype.parseData = function ($data) {
        BaseItem.prototype.parseData.apply(this, arguments);

        if(this.index > this.startFrame && this.index <= this.startFrame + this.duration) {
            this.elements = null;
            return;
        }

        /*if(this.tweenType === 'motion') {
            DEBUG.traceElementPropertysRecursivity($data.tweenObj, 0);
        }*/

        this.elements = [];
        var newElement = null;
        $data.elements.forEach(function (element) {
            newElement = createElementLibItem(element);
            //newElement.parseData(element);
            this.elements.push(newElement);
        }, this);
    };

///////////////////////////////////////////////////////////

    /**
     * Базовый визуальный элемент
     * @constructor
     */
    function ElementItem() {
        BaseItem.apply(this, arguments);

        this.instanceType = '';
        //this.libraryItem = null; //[object BitmapItem]
        this.elementType = '';
        this.name = '';
        this.width = 0;
        this.height = 0;
        this.x = 0;
        this.y = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.skewX = 0;
        this.skewY = 0;
        this.rotation = 0;
        this.filters = null;
        this.visible = true;
    }

    ElementItem.prototype = new BaseItem();
    ElementItem.constructor = ElementItem;

    ElementItem.prototype.parseData = function ($data) {
        BaseItem.prototype.parseData.apply(this, arguments);

        if($data.libraryItem) {
            // Проверяем есть ли элемент библиотеки среди уже созданных, и если нет то создаем его
            var check = checkDataExist($data.libraryItem.name);
            if(!check) {
                var jsonItem = createNewLibItem($data.libraryItem);
                putToFolder($data.libraryItem.name, jsonItem);
            }
            this.libraryItem = $data.libraryItem.name;
        }
        if($data.filters) {
            this.filters = $data.filters;
        }

        if(isNaN(this.rotation)) {
            this.rotation = 0
        }
        //DEBUG.traceElementPropertys($data);
        //DEBUG.traceElementPropertysRecursivity($data, 0);
    };

///////////////////////////////////////////////////////////

    /**
     * Текстовое поле
     * @constructor
     */
    function ElementTextFieldItem() {
        ElementItem.apply(this, arguments);

        this.textType = '';
        this.border = false;
        this.length = 0;
        this.lineType = '';
        this.maxCharacters = 0;
        this.orientation = '';
        this.scrollable = false;
        this.selectable = false;
        this.textRuns = null;
        this.lineType = 'multiline'
    }

    ElementTextFieldItem.prototype = new ElementItem();
    ElementTextFieldItem.constructor = ElementTextFieldItem;

    ElementTextFieldItem.prototype.parseData = function ($data) {
        if($data.orientation !== 'horizontal') {
            return;
        }
        ElementItem.prototype.parseData.apply(this, arguments);

        DEBUG.traceElementPropertysRecursivity($data, 0);

        if($data.textRuns) {
            var textRun = null;
            var textRuns = [];
            for(var i = 0; i < $data.textRuns.length; i++) {
                textRun = new TextRunItem();
                textRun.parseData($data.textRuns[i]);
                textRuns.push(textRun);
            }
            this.textRuns = textRuns;
        }
    };

///////////////////////////////////////////////////////////

    /**
     * Описание для разных частей текста в текстовом поле
     * @constructor
     */
    function TextRunItem() {
        BaseItem.apply(this, arguments);

        this.startIndex = 0;
        this.length = 0;
        this.characters = '';
        this.textAttrs = null;
    }

    TextRunItem.prototype = new BaseItem();
    TextRunItem.constructor = TextRunItem;

    TextRunItem.prototype.parseData = function ($data) {
        BaseItem.prototype.parseData.apply(this, arguments);

        if($data.textAttrs) {
            this.textAttrs = new TextAttrsItem();
            this.textAttrs.parseData($data.textAttrs);
        }
    };

///////////////////////////////////////////////////////////

    /**
     * Параметры для конкретной части текстового поля
     * @constructor
     */
    function TextAttrsItem() {
        BaseItem.apply(this, arguments);

        this.alignment = 'left';
        this.autoKern = false;
        this.bold = false;
        this.characterPosition = 'normal';
        this.characterSpacing = 0;
        this.face = 'Arial';
        this.fillColor = '#CCCCCC';
        this.indent = 0;
        this.italic = false;
        this.leftMargin = 0;
        this.letterSpacing = 0;
        this.lineSpacing = 0;
        this.rightMargin = 0;
        this.rotation = false;
        this.size = 14;
        this.ascent = 0;
        this.descent = 0;
    }

    TextAttrsItem.prototype = new BaseItem();
    TextAttrsItem.constructor = TextAttrsItem;

    TextAttrsItem.prototype.parseData = function ($data) {
        BaseItem.prototype.parseData.apply(this, arguments);
    };

///////////////////////////////////////////////////////////

    /**
     * Шейп
     * @constructor
     */
    function ElementShapeItem() {
        ElementItem.apply(this, arguments);

        /*locked: false
        edges: [object Edge],[object Edge],[object Edge],[object Edge],[object Edge],[object Edge],[object Edge],[object Edge]
        vertices: [object Vertex],[object Vertex],[object Vertex],[object Vertex],[object Vertex],[object Vertex],[object Vertex],[object Vertex]
        contours: [object Contour],[object Contour]
        isGroup: false
        isDrawingObject: false
        isOvalObject: false
        isRectangleObject: false
        startAngle: undefined
        endAngle: undefined
        innerRadius: undefined
        closePath: undefined
        topLeftRadius: undefined
        bottomLeftRadius: undefined
        topRightRadius: undefined
        bottomRightRadius: undefined
        lockFlag: undefined
        numCubicSegments: 8
        members:
        isFloating: false*/

        //this.contours = [];
        //this.edges = [];
        //this.vertices = [];

        this.isDrawingObject = false;
        this.isFloating = false;
        this.isGroup =  false;
        this.isOvalObject = false;
        this.isRectangleObject = false;

        //this.members = [];
        //this.numCubicSegments = 0;
    }

    ElementShapeItem.prototype = new ElementItem();
    ElementShapeItem.constructor = ElementShapeItem;

    ElementShapeItem.prototype.parseData = function ($data) {
        ElementItem.prototype.parseData.apply(this, arguments);
        //DEBUG.traceElementPropertysRecursivity($data, 0);

        if(!$data.isOvalObject && !$data.isRectangleObject) {
            fl.trace('Now, we cant export Shapes :(');
        }

        if(isNaN(this.rotation)) {
            this.rotation = 0;
        }
        /*if($data.vertices) {
            this.vertices = [];
            $data.vertices.forEach(function (value) {
                this.vertices.push({x:value.x, y:value.y})
                //this.vertices.push(value)
            }, this);
        }*/
    };

    start();
}

FlashLib();