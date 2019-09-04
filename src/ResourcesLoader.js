import * as PIXI from 'pixi.js';
import FlashLib from "flashlib";

export default new class ResourcesLoader {
    constructor() {
        if (PIXI.Loader) {
            PIXI.Loader.registerPlugin(this);
        }
    }

    add(params) {
        this.pre = this.pre.bind(this);
        this.use = this.use.bind(this);
    }

    pre(resource, next) {
        return next();
    }

    use(resource, next) {
        if (!resource.data || !(resource.type === PIXI.LoaderResource.TYPE.JSON) || !resource.data.metaData ||
            !resource.data.metaData.type) {
            return next();
        }
        switch (resource.data.metaData.type) {
            case 'FlashLibAssets':
                let options = {
                    crossOrigin: resource.crossOrigin,
                    xhrType: PIXI.LoaderResource.TYPE.JSON,
                    metadata: null,
                    parentResource: resource
                };
                if (resource.data.libs && resource.data.libs.length > 0) {
                    resource.data.libs.forEach(function ($lib) {
                        PIXI.Loader.shared.add($lib.name, resource.data.baseUrl + $lib.path, options);
                    }, this);
                }
                if (resource.data.assets && resource.data.assets.length > 0) {
                    resource.data.assets.forEach(function ($item) {
                        PIXI.Loader.shared.add($item.name, resource.data.baseUrl + $item.path, options);
                    }, this);
                }
                return next();
                break;
            case 'FlashLib':
                FlashLib.addNewLibrary(resource.data);
                return next();
                break;
            default:
                return next();
        }
    }
}
