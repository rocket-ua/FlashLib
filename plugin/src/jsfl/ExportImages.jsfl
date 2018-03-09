/**
 * Экспорт картинок из библиотеки FlashIDE с сохранением структуры как в библиотеке.
 * Если в функцию start передан объекр в котором есть поле exportImagesPath, то путь записаный в этом поле
 * будет корневой папкой для сохранения файлов, иначе коневой папкой будет папка в которой лежит fla файл
 * из библиотеки которого экспортируются картинки
 */


/**
 * Config example
 * {
 *      exportImages: false,
 *      overrideExistingFiles: false,
 *      addExtensions: false,
 * }
 */

function ExportImages($settings, $config) {
    var settings = {};
    var config = {};
    var basePath = '';

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
        basePath = fl.scriptURI.substr(0, fl.scriptURI.lastIndexOf("/")+1);
        if(settings && settings.basePath) {
            basePath = settings.basePath;
        }

        //eval(FLfile.read(basePath + 'JSON.jsfl'));
        //eval(FLfile.read(basePath + 'DEBUG.jsfl'));

        //Получить путь до fla файла
        this.docPath = createSaveFilesPath();
        //добавляем папку в которую будем скрладывать графику
        this.docPath += 'exported/';
        //fl.trace(this.docPath);

        var lib = document.library;
        var libItems = lib.items;
        //пробежать по всем элементам библиотеки и экспортировать графику
        for each(var item in libItems) {
            if (item.itemType !== 'bitmap') {
                continue;
            }
            //экспортируем битмапку
            exportImage(item);
        }
    }

    /**
     * Получение пути для сохранения файлов карт
     */
    function createSaveFilesPath() {
        var path = document.pathURI.replace(document.name, '');
        if (config && config.exportImagesPath) {
            path = config.exportImagesPath;
        }
        if (path.search('file:///') !== 0) {
            path = 'file:///' + path;
            path = encodeURI(path);
        }
        return path;
    }

    function exportImage($item) {
        //переименовываем битмапку, убираем пробелы и добавляем разрешение
        renameItem($item);

        //поучить локальный путь до файла картинки
        var path = $item.name.substr(0, $item.name.lastIndexOf('/'));

        //проверить наличие папки для экспорта файла.
        //если папки нет, она создасться
        checkFolder(path);

        //экспортировать файл в папку
        var filePath = this.docPath + $item.name;
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
        //var tempName = tempArr[tempArr.length - 1].replace(' ', '');
        var tempName = tempArr[tempArr.length - 1].replace(/\s/, '');
        if (config.addExtensions) {
            tempName += tempName.search(/(.png|.jpg)/) > -1 ? '' : '.png';
        }

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
                    FLfile.createFolder(this.docPath + temp);
                    fl.trace('Created directory: ' + (this.docPath + temp));
                }
            }
            index++;
        } while (index < arr.length);
    }

    start();
}