import * as PIXI from 'pixi.js';
import FlashLib from "./FlashLib";

export default class ResourcesLoader {
    static pre(resource, next) {
        return next();
    }

    static use(resource, next) {
        if (!resource.data || !(resource.type === PIXI.LoaderResource.TYPE.JSON)) {
            return next();
        }

        if (resource.data.metaData && resource.data.metaData.type) {
            switch (resource.data.metaData.type) {
                case 'FlashLibAssets':
                    let options = {
                        crossOrigin: resource.crossOrigin,
                        //xhrType: PIXI.LoaderResource.TYPE.JSON,
                        metadata: null,
                        parentResource: resource
                    };
                    if (resource.data.libs && resource.data.libs.length > 0) {
                        resource.data.libs.forEach(($lib) => {
                            if ($lib.path) {
                                options.name = $lib.name;
                                options.url = resource.data.baseUrl + $lib.path;
                                options.metadata = $lib.metadata || {}
                                this.add(options);
                            }
                            if ($lib.data) {
                                FlashLib.addNewLibrary($lib.data);
                            }
                        });
                    }
                    if (resource.data.assets && resource.data.assets.length > 0) {
                        resource.data.assets.forEach(($item) => {
                            if ($item.path) {
                                options.name = $item.name;
                                options.url = resource.data.baseUrl + $item.path;
                                options.metadata = $item.metadata || {}
                                this.add(options);
                            }
                            if ($item.data) {
                                this.add($item.name, $item.data, options);
                                //PIXI.Texture.addToCache(PIXI.Texture.from($item.data), $item.name);
                            }
                        });
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

        return next();
    }
}
