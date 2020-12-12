import {Loader} from 'pixi.js';

import {Shape, Bitmap, MovieClip, Graphic,TextField} from './FlashLib'
import ResourcesLoader from './ResourcesLoader';

export default new class Constructor {

    constructor() {
        Loader.registerPlugin(ResourcesLoader);

        this.defaultCalsses = {
            Shape: Shape,
            Bitmap: Bitmap,
            MovieClip: MovieClip,
            Graphic: Graphic,
            TextField: TextField
        }

        this.documents = {};

        this.registeredClassesObject = {};
    }

    /**
     * Change default class for item
     * @param $name Name of item. Can be 'Shape', 'Bitmap', 'MovieClip', 'Graphic', 'TextField'
     * @param $class class which will be used by default for this item type
     */
    setDefaultClass($name, $class) {
        this.defaultCalsses[$name] = $class;
    }
    
    /**
     * Добавить класс для создания во время постоения элементов
     * @param {string} $path путь по которому можно взять класс (через точку)
     * @param {string} $class объкет класса для создания
     */
    registerClass($path, $class) {
        let splittedName = $path.split('.');
        let obj = this.registeredClassesObject;
        splittedName.forEach((name, index, arr) => {
            if (index === arr.length - 1) {
                obj[name] = $class;
            } else {
                obj[name] = {};
                obj = obj[name];
            }
        });
    }

    /**
     * Add new library
     * @param {*} $library
     */
    addNewLibrary($library) {
        this.documents[$library.metaData.name] = $library;
    }

    /**
     * Make elemet from library
     * @param {object|string} $displayItemData имя элемента
     * @param {string} $libraryName имя библиотеки
     * @returns {*}
     */
    createItemFromLibrary($displayItemData, $libraryName) {
        if (typeof $displayItemData === 'string') {
            $displayItemData = {
                libraryItem: $displayItemData
            };
        }

        let itemData = this.getItemDataFromLibrary($displayItemData.libraryItem, $libraryName);
        if (!itemData) {
            throw new Error(`В библиотеке не найден элемент ${$displayItemData.libraryItem}`);
        }
        itemData.libraryName = $libraryName;
        //itemData.displayData = $displayItemData;
        let libraryItem = this.createItemFromLibraryData(itemData, $displayItemData);
        return libraryItem;
    }

    /**
     * Get element data from library
     * @param {string} $itemName имя элемента
     * @param {string} $libraryName имя библиотеки
     */
    getItemDataFromLibrary($itemName, $libraryName) {
        let splittedName = $itemName.split('\/');
        let lib = this.getLibraryByName($libraryName).lib;
        let itemData = this._getItemDataFromName(lib, splittedName);
        return itemData;
    }

    _getItemDataFromName($parent, $splittedName) {
        let currName = $splittedName.shift();
        if(currName !== '.') {
            $parent = $parent[currName];
        }
        if ($splittedName.length > 0) {
            $parent = this._getItemDataFromName($parent, $splittedName);
        }
        return $parent;
    }

    /**
     * Получить все элементы из бибилиотеки по типу
     * @param {string} $itemType тип элемента
     * @param {string} $libraryName имя библиотеки
     * @returns {[]}
     */
    findItemByType($itemType, $libraryName) {
        let lib = this.getLibraryByName($libraryName).lib;
        return this._checkFolder('.', $itemType, lib)
    }

    _checkFolder($folderName, $itemType, $lib) {
        let result = [];
        let folder = this._getItemDataFromName($lib, $folderName.split('\/'))
        for (let itemName in folder) {
            let item = folder[itemName];
            if(item && item.hasOwnProperty('itemType')) {
                switch (item.itemType) {
                    case 'folder':
                        result = result.concat(this._checkFolder(item.name, $itemType, $lib));
                        break;
                    default:
                        result.push(item);
                        break;
                }
            }
        }
        return result;
    }

    /**
     * Получение библиотеки по имени
     * @param {string} $libraryName имя библиотеки
     * @returns {*}
     */
    getLibraryByName($libraryName) {
        return this.documents[$libraryName];
    }

    /**
     * Получить элемент из библиотеки
     * @param {*} $libraryItemData данные элемента библиотеки
     * @param {*} $displayItemData
     */
    createItemFromLibraryData($libraryItemData, $displayItemData) {
        let item = null;
        let type = $libraryItemData.linkageExportForAS ?
            $libraryItemData.linkageClassName :
            $libraryItemData.itemType;

        switch (type) {
            case 'movie clip':
                item = new this.defaultCalsses.MovieClip($libraryItemData, $displayItemData);
                break;
            case 'graphic':
                item = new this.defaultCalsses.Graphic($libraryItemData, $displayItemData);
                break;
            case 'bitmap':
                item = new this.defaultCalsses.Bitmap($libraryItemData, $displayItemData);
                break;
            default:
                let classObject = getClassByName.call(this, type);
                /*if ($libraryItemData.symbolType === 'movie clip') {
                    if (classObject) {
                        item = new classObject($libraryItemData, $displayItemData);
                    } else {
                        throw new Error('Не найден класс. ' + type + ' Для регистрации класса испольщуйте FlashLib.registerClass');
                    }
                } else {
                    item = new classObject();
                }*/
                if (classObject) {
                    item = new classObject($libraryItemData, $displayItemData);
                } else {
                    throw new Error(`Не найден класс. ${type} Для регистрации класса испольщуйте FlashLib.registerClass`);
                }
        }

        /**
         * Получить объект класса по имени, включая полный путь к нему
         * @param {string} $name имя класса
         */
        function getClassByName($name) {
            let splittedName = $name.split('.');

            function getClass($splittedName, $parentItem) {
                if ($splittedName.length === 0) {
                    return $parentItem;
                }

                let name = $splittedName.shift();
                let item = $parentItem[name];
                return getClass($splittedName, item);
            }

            return getClass(splittedName, this.registeredClassesObject);
        }

        return item;
    }

    /**
     * Создать графический єлемент (не из библиотеки)
     * @param {*} $displayItemData данне графического элемента
     * @param {string} $libraryName имя библиотеки
     * @returns {*}
     */
    createDisplayItemFromData($displayItemData, $libraryName) {
        let item = null;
        switch ($displayItemData.elementType) {
            case 'instance':
                item = this.createItemFromLibrary($displayItemData, $libraryName);
                break;
            case 'text':
                item = new this.defaultCalsses.TextField($displayItemData, $libraryName);
                break;
            case 'shape':
                item = new this.defaultCalsses.Shape($displayItemData, $libraryName);
                break;
            default:
                throw new Error(`Неизвестный тип элемента ${$displayItemData.elementType}`);
        }

        return item;
    }
}
