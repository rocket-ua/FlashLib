/**
 *
 */

function CreateGraphicsList($settings, $config) {
    var settings = {};
    var config = {};
    var graphicsList = {};
    var basePath = '';

    if(!fl.getDocumentDOM()) {
        fl.trace('No opened documents found!');
        return;
    }

    settings = $settings;       
    config = $config;

    if (!config || !config.createImagesList) {
        return;
    }

    function start() {
        basePath = fl.scriptURI.substr(0, fl.scriptURI.lastIndexOf("/")+1);
        if(settings && settings.basePath) {
            basePath = settings.basePath;
        }
        
        eval(FLfile.read(basePath + 'JSON.jsfl'));
        //eval(FLfile.read(basePath + 'DEBUG.jsfl'));

        this.docPath = createSaveFilesPath();

        graphicsList.assets = [];

        var lib = document.library;
        var libItems = lib.items;
        //пробежать по всем элементам библиотеки и экспортировать графику
        for each(var item in libItems) {
            if (item.itemType !== 'bitmap') {
                continue;
            }
            getImagePath(item);
        }

        var jsonString = JSON.encode(graphicsList);
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
        if(config && config.saveFilesPath) {
            path = config.saveFilesPath;
        }

        if(path.search("file:///") !== 0) {
            path = "file:///" + path;
            path = encodeURI(path);
        }

        return path;
    }

    function getImagePath($item) {
        renameItem($item);

        var graphicData = {
            name : $item.name.replace(/(.png|.jpg)/, ''),
            path : $item.name,
            type : 'image'
        };
        graphicsList.assets.push(graphicData);
    }

    function renameItem($item) {
        document.library.selectItem($item.name);

        var tempArr = $item.name.split('/');
        var tempName = tempArr[tempArr.length - 1].replace(/\s/, '');
        if (config.addExtensions) {
            tempName += tempName.search(/(.png|.jpg)/) > -1 ? '' : '.png';
        }

        document.library.renameItem(tempName);
        document.library.selectNone();
    }

    /**
     * Сохранить данные библиотеки в файл
     * @param $result {string}
     */
    function saveResultToFile($result) {
        var path = createSaveFilesPath();
        var fileName = "graphicsList.json";
        if(config && config.saveFileName) {
            fileName = config.saveFileName;
        }

        path = path + fileName;
        FLfile.write(path, $result);

        fl.trace("Graphics list saved to " + path);
    }

    start();
}
