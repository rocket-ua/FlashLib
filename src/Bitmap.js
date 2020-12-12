import {Sprite, utils} from 'pixi.js'
import DisplayProperties from "./DisplayProperties";

export default class Bitmap extends Sprite {

    constructor($data, $displayItemData) {
        let name = $data.name.replace(/(\.png|\.jpg)/, '');
        let texture = utils.TextureCache[name];
        super(texture);

        this.libData = $data;
        this.displayData = $displayItemData;
        
        DisplayProperties.setDisplayItemProperties(this, this.displayData);
    }

    render(renderer) {
        if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
            return;
        }

        if (this._mask || (this.filters && this.filters.length) || this.layerMask) {
            this.renderAdvanced(renderer);
        } else {
            this._render(renderer);

            for (let i = 0, j = this.children.length; i < j; ++i) {
                this.children[i].render(renderer);
            }
        }
    }

    renderAdvanced(renderer) {
        renderer.batch.flush();

        const filters = this.filters;
        const mask = this._mask;
        const layerMask = this.layerMask ? this.layerMask.elements.length > 0 ? this.layerMask.elements : null : null;

        if (filters) {
            if (!this._enabledFilters) {
                this._enabledFilters = [];
            }

            this._enabledFilters.length = 0;

            for (let i = 0; i < filters.length; i++) {
                if (filters[i].enabled) {
                    this._enabledFilters.push(filters[i]);
                }
            }

            if (this._enabledFilters.length) {
                renderer.filter.push(this, this._enabledFilters);
            }
        }

        if (mask) {
            renderer.mask.push(this, this._mask);
        }

        if (layerMask) {
            /*if(!this.tempCont) {
                this.tempCont = {};
                this.tempCont.render = (renderer) => {
                    for (let i = 0, j = this.layerMask.elements.length; i < j; ++i){
                        this.layerMask.elements[i].renderable = true;
                        this.layerMask.elements[i].render(renderer);
                        this.layerMask.elements[i].renderable = false;
                    }
                }
            }*/
            //renderer.mask.push(this, this.tempCont);
            layerMask[0].renderable = false;
            renderer.mask.push(this, layerMask[0]);
        }

        this._render(renderer);

        for (let i = 0, j = this.children.length; i < j; i++) {
            this.children[i].render(renderer);
        }

        renderer.batch.flush();

        if (layerMask) {
            //renderer.mask.pop(this, this.tempCont);
            renderer.mask.pop(this, layerMask[0]);
        }

        if (mask) {
            renderer.mask.pop(this, this._mask);
        }

        if (filters && this._enabledFilters && this._enabledFilters.length) {
            renderer.filter.pop();
        }
    }

    get useTransformPoint() {
        return this._useTransformPoint || false;
    }

    set useTransformPoint(value) {
        if (this._useTransformPoint === value) {
            return;
        }

        this._useTransformPoint = value;

        if (this._useTransformPoint) {
            this.pivot.set(this.tpX, this.tpY);
            this.x += this.tpX;
            this.y += this.tpY;
        } else {
            this.pivot.set(0, 0);
            this.x -= this.tpX;
            this.y -= this.tpY;
        }
    }
}
