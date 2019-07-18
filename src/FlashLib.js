import * as PIXI from 'pixi.js'

import Shape from './Shape'
import Bitmap from './Bitmap'
import MovieClip from './MovieClip'
import TextField from './TextField'

/*export {default as Shape} from './Shape';
export {default as Bitmap} from './Bitmap';
export {default as MovieClip} from './MovieClip';
export {default as TextField} from './TextField';*/

export default new class FlashLib {

    constructor() {
        this.libraries = [];
        //this.initPIXILoader();
    }

    addNewLibrary($library) {
        this.libraries.push($library)
    }

    /**
     * Создать элемент из библиотеки по имени
     * @param {string} $itemName имя элемента
     * @param {string} $libraryName имя библиотеки
     * @returns {*}
     */
    createItemFromLibrary($itemName, $libraryName) {
        let itemData = this.getItemDataFromLibrary($itemName, $libraryName);
        if (!itemData) {
            throw new Error('В библиотеке не найден элемент ' + $itemName);
        }
        itemData.libraryName = $libraryName;
        let libraryItem = this.createItemFromLibraryData(itemData);
        return libraryItem;
    }

    /**
     * Получить данные для объекта из библиотеки
     * @param {string} $itemName имя элемента
     * @param {string} $libraryName имя библиотеки
     */
    getItemDataFromLibrary($itemName, $libraryName) {
        let splittedName = $itemName.split('\/');
        let lib = this.getLibraryByName($libraryName).lib;
        let itemData = getItemDataFromName(lib, splittedName);
        return itemData;

        function getItemDataFromName($parent, $splittedName) {
            let currName = $splittedName.shift();
            $parent = $parent[currName];
            if ($splittedName.length > 0) {
                $parent = getItemDataFromName($parent, $splittedName);
            }
            return $parent;
        }
    }

    getLibraryByName($libraryName) {
        let index = this.libraries.findIndex(function (library) {
            return library.name === $libraryName
        });
        if (index === -1) {
            index = 0
        }
        return this.libraries[index]
    }

    /**
     * Получить элемент из библиотеки
     * @param $libraryItemData данные элемента библиотеки
     */
    createItemFromLibraryData($libraryItemData) {
        let item = null;
        let type = $libraryItemData.linkageExportForAS ?
            $libraryItemData.linkageClassName :
            $libraryItemData.itemType;

        switch (type) {
            case 'movie clip':
                item = new MovieClip($libraryItemData);
                break;
            case 'bitmap':
                item = new Bitmap($libraryItemData);
                break;
            default:
                let classObject = getClassByName(type);
                if ($libraryItemData.symbolType === 'movie clip') {
                    item = new classObject($libraryItemData);
                } else {
                    item = new classObject();
                }
        }

        /**
         * Получить объект класса по имени, включая полный путь к нему
         * @param $name
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

            return getClass(splittedName, window);
        }

        return item;
    }

    /**
     * Создать графический жлемент (не из библиотеки)
     * @param $displayItemData данне графического элемента
     * @param $libraryName имя библиотеки
     * @returns {*}
     */
    createDisplayItemFromData($displayItemData, $libraryName) {
        let item = null;
        switch ($displayItemData.elementType) {
            case 'instance':
                item = this.createItemFromLibrary($displayItemData.libraryItem, $libraryName);
                break;
            case 'text':
                item = new TextField($displayItemData);
                break;
            case 'shape':
                item = new Shape($displayItemData);
                break;
        }

        if (item) {
            this.setDisplayItemProperties(item, $displayItemData);
            this.addFiltersToDisplayItem(item, $displayItemData.filters);

            if (item.hasOwnProperty('constructionComplete') && item.constructionComplete !== null) {
                item.constructionComplete();
            }
        }

        return item;
    }

    /**
     * Назначение параметров элементу
     * @param $item объкет которому назначаются параметры
     * @param $displayItemData объект с параметрами которые нужно назначить
     */
    setDisplayItemProperties($item, $displayItemData) {
        $item.name = $displayItemData.name;
        $item.x = $displayItemData.x;
        $item.y = $displayItemData.y;
        $item.width = $displayItemData.width;
        $item.height = $displayItemData.height;
        $item.scale.x = $displayItemData.scaleX;
        $item.scale.y = $displayItemData.scaleY;
        $item.rotation = ($displayItemData.rotation * (Math.PI / 180));
        $item.visible = $displayItemData.visible;
    }

    /**
     * Добавление фильтров
     * @param $item элемент которому добавляются фильтры
     * @param $filters массив с фильтрами
     */
    addFiltersToDisplayItem($item, $filters) {
        if (!$filters || !PIXI.filters) {
            return;
        }
        let filter = null;
        let newFilters = [];
        $filters.forEach(function (filterData) {
            if (filterData && filterData.enabled) {
                filter = null;
                switch (filterData.name) {
                    case 'glowFilter':
                        if (PIXI.filters.BlurFilter) {
                            console.log(filterData);
                            //let qualityList = {'low': 90, 'medium': 65, 'high': 40};
                            //filter = new PIXI.filters.GlowFilter(filterData.blurX, filterData.inner ? 0 : filterData.strength / 100, filterData.inner ? filterData.strength / 100 : 0, /*filterData.color*/ 0xff0000/*, qualityList[filterData.quality]*/);
                        }
                        break;
                    case 'dropShadowFilter':
                        if (PIXI.filters.DropShadowFilter) {
                            console.log(filterData);
                            /*let qualityList = {'low': 90, 'medium': 65, 'high': 40};
                            let options = {
                              alpha: filterData.strength,
                              blur: filterData.blurX,
                              color: filterData.color,
                              distance: filterData.distance,
                              quality: qualityList[filterData.quality],
                              shadowOnly: filterData.hideObject
                            }
                            filter = new PIXI.filters.DropShadowFilter(options);*/
                        }
                        break;
                    case 'bevelFilter':
                        if (PIXI.filters.BevelFilter) {
                            console.log(filterData);
                            //filter = new PIXI.filters.BevelFilter(1, 1, 1, 0xff0000, 1);
                        }
                        break;
                    case 'blurFilter':
                        if (PIXI.filters.BlurFilter) {
                            let qualityList = {'low': 90, 'medium': 65, 'high': 40};
                            filter = new PIXI.filters.BlurFilter(filterData.strength, qualityList[filterData.quality]);
                            filter.blurX = filterData.blurX;
                            filter.blurY = filterData.blurY;
                        }
                        break;
                }
                if (filter) {
                    newFilters.push(filter);
                }
            }
        }, this);
        $item.filters = newFilters;
    }

    initPIXILoader(loader) {
        if(!loader) {
            loader = PIXI.Loader.shared;
        }
        function assetsParser(resource, next) {
            if (!resource.data || !(resource.type === PIXI.LoaderResource.TYPE.JSON) || !resource.data.metaData ||
                !resource.data.metaData.type || resource.data.metaData.type !== 'FlashLib') {
                return next();
            }

            //PIXI.loader.reset();
            let options = {
                crossOrigin: resource.crossOrigin,
                xhrType: PIXI.LoaderResource.TYPE.JSON,
                metadata: null,
                parentResource: resource
            };
            resource.data.libs.forEach(function ($lib) {
                loader.add($lib.name, resource.data.baseUrl + $lib.path, options);
            }, this);
            resource.data.assets.forEach(function ($item) {
                loader.add($item.name, resource.data.baseUrl + $item.path, options);
            }, this);

            return next();
        }

        //PIXI.loaders.Loader.addPixiMiddleware(atlasParser);
        loader.use(assetsParser);
    }

    /*initPIXILoader() {
        console.log('initPIXILoader');

        function assetsParser(resource, next) {
            console.log('assetsParser');
            if (!resource.data || !(resource.type === PIXI.LoaderResource.TYPE.JSON) || !resource.data.metaData ||
                !resource.data.metaData.type || resource.data.metaData.type !== 'FlashLib') {
                return next();
            }

            console.log('function');

            //PIXI.loader.reset();
            let options = {
                crossOrigin: resource.crossOrigin,
                xhrType: PIXI.LoaderResource.TYPE.JSON,
                metadata: null,
                parentResource: resource
            };
            resource.data.libs.forEach(function ($lib) {
                PIXI.Loader.shared.add($lib.name, resource.data.baseUrl + $lib.path, options);
            }, this);
            resource.data.assets.forEach(function ($item) {
                PIXI.Loader.shared.add($item.name, resource.data.baseUrl + $item.path, options);
            }, this);

            return next();
        }

        //PIXI.loaders.Loader.addPixiMiddleware(atlasParser);
        PIXI.Loader.shared.use(assetsParser);
    }*/
}