/**
 * Config example
 * {
 *      saveToFile: false,
 *      sayResultToConsole: true,
 *      buildForSelected: false
 * }
 */
function LibToJson($settings, $config) {
    var settings = {};
    var config = {};
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

        eval(FLfile.read(scriptPath + 'JSON.js'));
        eval(FLfile.read(scriptPath + 'DEBUG.js'));

        createLibItems();

        jsonLib = {
            name: '',
            date: new Date().toDateString(),
            lib: libData
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
        var path = document.pathURI.replace(document.name, '');
        if(config && config.basePath && config.basePath !== '') {
            path = config.basePath;
        }

        if(path.search('file:///') !== 0) {
            path = 'file:///' + path;
            path = encodeURI(path);
        }

        return path;
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
                if($data[property] !== undefined) {
                    /*if(this[property] != $data[property]) {
                        this[property] = $data[property];
                    } else {
                        delete this[property];
                    }*/
                    this[property] = $data[property];
                }
            } catch (err) {
                //fl.trace(err);
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

    }

    LibItemFont.prototype = new LibItemBase();
    LibItemFont.constructor = LibItemFont;

    LibItemFont.prototype.parseData = function ($data) {
        this.itemType = $data.itemType;
        this.name = $data.name;
        this.linkageExportForAS = $data.linkageExportForAS;
        this.linkageClassName = $data.linkageClassName;

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

    }

    LibItemFolder.prototype = new LibItemBase();
    LibItemFolder.constructor = LibItemFolder;

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

        this.frames = null;
        this.frameCount = 0;
        this.name = '';
        //this.currentFrame = 0;
    }

    TimelineItem.prototype = new BaseItem();
    TimelineItem.constructor = Timeline;

    TimelineItem.prototype.parseData = function ($data) {
        BaseItem.prototype.parseData.apply(this, arguments);

        this.frames = [];
        var newFrame = null;
        //for (var i = 0; i < $data.layers.length; i++) {
        for (var i = $data.layers.length - 1; i >= 0; i--) {
            var layer = $data.layers[i];

            if(layer.layerType !== 'guide') {
                for (var j = 0; j < layer.frames.length; j++) {
                    if(!this.frames[j]) {
                        this.frames.push([]);
                    }
                    var frame = layer.frames[j];
                    newFrame = new FrameItem();
                    newFrame.parseData(frame);
                    this.frames[j].push(newFrame);
                }
            }
        }
    };

    /*TimelineItem.prototype.parseData = function ($data) {
        BaseItem.prototype.parseData.apply(this, arguments);

        this.frames = [];
        var newFrame = null;
        for each(var layer in $data.layers) {
            if(layer.layerType !== 'guide') {
                for each(var frame in layer.frames.reverse()) {
                    newFrame = new FrameItem();
                    newFrame.parseData(frame);
                    this.frames.push(newFrame);
                }
            }
        }
    };*/

///////////////////////////////////////////////////////////

    /**
     * Элемент слой на таймлайне
     * @constructor
     */
    /*function LayerItem() {
        BaseItem.apply(this, arguments);

        this.layerType = '';
        this.frameCount = 0;
        this.frames = null;
        this.parentLayer = null;
    }

    LayerItem.prototype = new BaseItem();
    LayerItem.constructor = LayerItem;*/

///////////////////////////////////////////////////////////

    /**
     * Кадр на слое на таймлайне конкретного элемента
     * @constructor
     */
    function FrameItem() {
        BaseItem.apply(this, arguments);

        this.name = '';
        this.elements = null;
        //this.soundLibraryItem = null;
        this.isEmpty = true;
    }

    FrameItem.prototype = new BaseItem();
    FrameItem.constructor = FrameItem;

    FrameItem.prototype.parseData = function ($data) {
        BaseItem.prototype.parseData.apply(this, arguments);

        this.elements = [];
        var newElement = null;
        /*for each(var element in $data.elements) {
            newElement = createElementLibItem(element);
            //newElement.parseData(element);
            this.elements.push(newElement);
        }*/

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
        this.textRuns = null; // [object TextRun]
    }

    ElementTextFieldItem.prototype = new ElementItem();
    ElementTextFieldItem.constructor = ElementTextFieldItem;

    ElementTextFieldItem.prototype.parseData = function ($data) {
        ElementItem.prototype.parseData.apply(this, arguments);

        if($data.textRuns) {
            var textRun = null;
            var textRuns = [];
            for(var i = 0; i < $data.textRuns.length; i++) {
                textRun = new TextRunItem();
                textRun.parseData($data.textRuns[i]);
                textRuns.push(textRun);
            }
            this.textRuns = textRuns;
            //this.textRuns = new TextRunsItem($data.textRuns);
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
    }

    ElementShapeItem.prototype = new ElementItem();
    ElementShapeItem.constructor = ElementShapeItem;

    ElementShapeItem.prototype.parseData = function ($data) {
        ElementItem.prototype.parseData.apply(this, arguments);
    };

    start();
}
