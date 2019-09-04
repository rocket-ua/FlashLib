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
