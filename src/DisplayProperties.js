import {utils, BLEND_MODES} from "pixi.js"
//import * as Filters from "pixi-filters";

export default new class DisplayProperties {
    constructor() {
        this.blendModes = {
            'normal': BLEND_MODES.NORMAL, //0
            'add': BLEND_MODES.ADD, //1
            'multiply': BLEND_MODES.MULTIPLY, //2
            'screen': BLEND_MODES.SCREEN, //3
            'overlay': BLEND_MODES.OVERLAY, //4
            'darken': BLEND_MODES.DARKEN, //5
            'lighten': BLEND_MODES.LIGHTEN, //6
            'hardLight': BLEND_MODES.HARD_LIGHT, //9
            'difference': BLEND_MODES.DIFFERENCE, //11
            'subtract': BLEND_MODES.SUBTRACT, //28
            'erese': BLEND_MODES.ERASE, //30

            'layer': 0,
            'invert': 0,
            'alpha': 0
        }
    }

    /**
     * Назначение параметров элементу
     * @param {*} $item объкет которому назначаются параметры
     * @param {object} $displayItemData объект с параметрами которые нужно назначить
     */
    setDisplayItemProperties($item, $displayItemData) {
        $item.pivot.set(
            $displayItemData.transformX - $displayItemData.x,
            $displayItemData.transformY - $displayItemData.y
        );

        $item.name = $displayItemData.name || '';
        $item.x = $displayItemData.x || 0;
        $item.y = $displayItemData.y || 0;
        $item.width = $displayItemData.width || $item.width;
        $item.height = $displayItemData.height || $item.height;

        let rotation = $displayItemData.rotation < 0 ? 360 + $displayItemData.rotation : $displayItemData.rotation;

        $item.rotation = (rotation * (Math.PI / 180)) || 0;

        let skewX = $displayItemData.skewX < 0 ? 360 + $displayItemData.skewX : $displayItemData.skewX;
        let skewY = $displayItemData.skewY < 0 ? 360 + $displayItemData.skewY : $displayItemData.skewY;

        $item.skew.x = ((skewX * (Math.PI / 180)) || $item.skew.x) - $item.rotation;
        $item.skew.y = ((skewY * (Math.PI / 180)) || $item.skew.y) - $item.rotation;

        $item.scale.x = $displayItemData.scaleX || $item.scale.x;
        $item.scale.y = $displayItemData.scaleY || $item.scale.y;

        $item.visible = $displayItemData.visible === undefined ? true : $displayItemData.visible;
        $item.alpha = $displayItemData.colorAlphaPercent === undefined ? 1 : $displayItemData.colorAlphaPercent / 100;

        $item.pivot.set(0, 0);


        /*if($displayItemData.matrix) {
            $item.setTransform(
                $displayItemData.matrix.tx,
                $displayItemData.matrix.ty,
                $displayItemData.matrix.a,
                $displayItemData.matrix.d,
                ($displayItemData.rotation * (Math.PI / 180)) || 0,
                ($displayItemData.matrix.b * (Math.PI / 180)) || 0,
                ($displayItemData.matrix.c * (Math.PI / 180)) || 0,
                $displayItemData.transformX - $displayItemData.x,
                $displayItemData.transformY - $displayItemData.y
            )
        }*/

        /*$item.name = $displayItemData.name || '';
        $item.x = $displayItemData.x || 0;
        $item.y = $displayItemData.y || 0;
        $item.width = $displayItemData.width || $item.width;
        $item.height = $displayItemData.height || $item.height;
        $item.scale.x = $displayItemData.scaleX || $item.scale.x;
        $item.scale.y = $displayItemData.scaleY || $item.scale.y;

        $item.rotation = ($displayItemData.rotation * (Math.PI / 180)) || 0;
        $item.skew.x =  ($displayItemData.skewX * (Math.PI / 180)) || $item.skew.x;
        $item.skew.y =  ($displayItemData.skewY * (Math.PI / 180)) || $item.skew.y;

        $item.visible = $displayItemData.visible === undefined ? true : $displayItemData.visible;
        $item.alpha = $displayItemData.colorAlphaPercent === undefined ? 1 : $displayItemData.colorAlphaPercent / 100;*/

        // if ($displayItemData.filters) {
        //     this.addFiltersToDisplayItem($item, $displayItemData.filters);
        // }
    }

    /**
     * Добавление фильтров
     * @param {*} $item элемент которому добавляются фильтры
     * @param {*} $filters массив с фильтрами
     */
    /*addFiltersToDisplayItem($item, $filters) {
        if (!$filters || !Filters) {
            return;
        }
        let filter = null;
        let newFilters = [];
        let qualityList = {'low': 90, 'medium': 65, 'high': 40};
        let options = {};
        $filters.forEach((filterData) => {
            if (filterData && filterData.enabled) {
                filter = null;
                console.log(filterData);
                options = {};
                switch (filterData.name) {
                    case 'dropShadowFilter':
                        qualityList = {'low': 3, 'medium': 4, 'high': 5};
                        options = {
                            alpha: filterData.strength / 100,
                            blur: filterData.blurX / 2,
                            color: utils.string2hex(filterData.color),
                            distance: filterData.distance,
                            rotation: filterData.angle,
                            quality: qualityList[filterData.quality],
                            shadowOnly: filterData.hideObject
                        }
                        filter = new Filters.DropShadowFilter(options);
                        break;
                    case 'blurFilter':
                        // filter = new Filters.MotionBlurFilter([0,0], 12);
                        // filter.blurX = filterData.blurX * 10;
                        // filter.blurY = filterData.blurY * 10;
                        break;
                    case 'glowFilter':
                        qualityList = {'low': 3, 'medium': 4, 'high': 5};
                        options = {
                            color: utils.string2hex(filterData.color),
                            distance: filterData.blurX,
                            innerStrength: filterData.inner ? filterData.strength / 100 : 0,
                            outerStrength: !filterData.inner ? filterData.strength / 100 : 0,
                            quality: qualityList[filterData.quality],
                            knockout: filterData.knockout
                        }
                        filter = new Filters.GlowFilter(options);
                        break;
                    case 'bevelFilter':
                        options = {
                            rotation: filterData.angle,
                            thickness: filterData.blurX,
                            lightColor: utils.string2hex(filterData.highlightColor),
                            lightAlpha: filterData.strength / 100,
                            shadowColor: utils.string2hex(filterData.shadowColor),
                            shadowAlpha: filterData.strength / 100
                        };
                        filter = new Filters.BevelFilter(options);
                        break;
                    case 'adjustColorFilter':
                        options = {
                            //gamma: filterData.hue,
                            contrast: filterData.contrast || 1,
                            saturation: filterData.saturation || 1,
                            brightness: filterData.brightness || 1,
                            // red: number,
                            // green: number,
                            // blue: number,
                            // alpha: number
                        };
                        filter = new Filters.AdjustmentFilter(options);
                        break;
                }
                if (filter) {
                    console.log(filter);
                    newFilters.push(filter);
                }
            }
        });
        $item.filters = newFilters;
    }*/

    setBlendMode($item) {
        //if ($item.displayData.blendMode !== undefined) {
            $item.blendMode = $item.blendMode || this.blendModes[$item.displayData.blendMode || 'normal'];
        //}
    }

    /*setBlendMode($item) {
        return $item.blendMode || this.blendModes[$item.displayData.blendMode];
    }*/
    
    /*setBlendMode($parent, $item) {
        if ($parent.blendMode) {
            $item.blendMode = $parent.blendMode;
        } else if ($parent.displayData.blendMode) {
            $parent.blendMode = this.blendModes[$parent.displayData.blendMode];
            $item.blendMode = $parent.blendMode;
        } else {
            $item.blendMode = this.blendModes[$item.displayData.blendMode];
        }
    }*/
}
