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

    assetsList = {
        baseUrl: './',
        libs: [
            { name: 'FlashLib', path: 'FlashLib.json', type: 'json' }
        ],
        assets: [],
        metaData: {
            type: 'FlashLib',
            date: new Date()
        }
    };

    if(config.libSettings && config.libSettings.path) {
        assetsList.libs[0].path = config.libSettings.path + assetsList.libs[0].path
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
        for each(var item in libItems) {
            if (item.itemType !== 'bitmap') {
                continue;
            }
            getImagePath(item);
        }

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
        var path = document.pathURI.replace(document.name, "");
        if(config && config.basePath && config.basePath !== '') {
            path = config.basePath;
        }

        if(path.search("file:///") !== 0) {
            path = "file:///" + path;
            path = encodeURI(path);
        }

        return path;
    }

    /**
     * Получить путь к имени файла
     * @param $item
     */
    function getImagePath($item) {
        var graphicData = {
            name : $item.name.replace(/(.png|.jpg)/, ''),
            path : document.name + '_lib' + '/' + $item.name,
            type : 'image'
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
