import * as PIXI from 'pixi.js'
import FlashLib from "flashlib";

export default class TextField extends PIXI.Text {

    constructor($data, $libraryName) {
        let textRun = $data.textRuns[0];
        let textAttrs = textRun.textAttrs;
        let style = {
            align: textAttrs.alignment,
            fill: textAttrs.fillColor,
            fontFamily: textAttrs.face.replace('*', '')/*.split(' ')*/,
            fontSize: textAttrs.size,
            fontStyle: textAttrs.italic ? 'italic' : 'normal',
            fontWeight: textAttrs.bold ? 'bold' : 'normal',
            letterSpacing: textAttrs.letterSpacing,
            leading: textAttrs.lineSpacing,
            // stroke: '#000000',
            // strokeThickness: 3

            wordWrap: ($data.lineType === 'multiline no wrap' || $data.lineType === 'single line') ? false : true,
            wordWrapWidth: ($data.lineType === 'multiline no wrap' || $data.lineType === 'single line') ? 100 : $data.width
        };

        //TODO: думаю этот костыль нужно переписать
        let embeddedFontData = null;
        if (textAttrs.face.indexOf('*') !== -1) {
            let fontsData = FlashLib.findItemByType('font', $libraryName);
            fontsData.forEach((item) => {
                if (item.name.search(style.fontFamily) !== -1) {
                    embeddedFontData = item;
                    style.fontStyle = item.italic ? 'italic' : 'normal';
                    style.fontWeight = item.bold ? 'bold' : 'normal';
                }
            });
        }

        super(textRun.characters, style);

        this.libName = $libraryName;
        this.textRect = null;
        this.displayData = $data;
        this.embededFontData = embeddedFontData;
        this.createRect();
        this.correctPosition();

        FlashLib.setDisplayItemProperties(this, this.displayData);
        this.width = this.displayData.width;
        this.height = this.displayData.height;

        this.roundPixels = true;

        if (document.fonts) {
            document.fonts.ready.then(this._onFontsReady.bind(this));
        }
    }

    _onFontsReady() {
        if(this.style && document.fonts.check(this.style.fontSize + 'px ' + this.style.fontFamily)) {
            this.dirty = true;
            this.correctPosition();
        }
    }

    createRect() {
        this.textRect = new PIXI.Rectangle(0, 0, 0, 0);
    };

    correctPosition($horizontal, $vertical) {
        if (!this.textRect) {
            return;
        }

        let hAlign = $horizontal || this.style && this.style.align;
        let vAlign = $vertical || 'top';

        //if (this.style && this.style.align) {
        if (hAlign) {
            switch (hAlign) {
                case 'left':
                    this.transform.position.x = this.textRect.x;
                    break;
                case 'center':
                    this.transform.position.x = this.textRect.x + ((this.textRect.width - this.origWidth) / 2);
                    break;
                case 'right':
                    this.transform.position.x = this.textRect.x + (this.textRect.width - this.origWidth);
                    break;
                default:
                    this.transform.position.x = this.textRect.x;
                    break;
            }
        } else {
            this.transform.position.x = this.textRect.x;
        }

        if (vAlign) {
            switch (vAlign) {
                case 'top':
                    this.transform.position.y = this.textRect.y;
                    break;
                case 'center':
                    this.transform.position.y = this.textRect.y + ((this.textRect.height - this.origHeight) / 2);
                    break;
                case 'bottom':
                    this.transform.position.y = this.textRect.y + (this.textRect.height - this.origHeight);
                    break;
                default:
                    this.transform.position.y = this.textRect.y;
                    break;
            }
        } else {
            this.transform.position.y = this.textRect.y;
        }

        //this.transform.position.y += this.displayData.textRuns[0].textAttrs.descent / 2;
        //this.transform.position.y += this.displayData.textRuns[0].textAttrs.descent
        //this.transform.position.y = this.textRect.y;
    }

    drawDebug() {
        let origRect = new PIXI.Graphics();
        origRect.lineStyle(1, 0xFF0000, 1);
        origRect.drawRect(this.position.x - this.transform.position.x, this.position.y - this.transform.position.y, this.origWidth, this.origHeight);
        this.addChild(origRect);

        let realRect = new PIXI.Graphics();
        realRect.lineStyle(1, 0x00FF00, 1);
        realRect.drawRect((this.textRect.x - this.transform.position.x), (this.textRect.y - this.transform.position.y), this.width, this.height);
        realRect.endFill();
        this.addChild(realRect);
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

    get x() {
        return this.textRect.x;
    }

    set x(value) {
        this.textRect.x = value - this.style.strokeThickness * 2;
        this.correctPosition();
    }

    get y() {
        return this.textRect.y;
    }

    set y(value) {
        this.textRect.y = value - this.style.strokeThickness * 2;
        //console.log(this.displayData.textRuns[0].textAttrs.descent)
        //this.textRect.y += this.displayData.textRuns[0].textAttrs.descent
        this.correctPosition();
    }

    get origWidth() {
        this['updateText'](true);
        return Math.abs(this.scale.x) * this.texture.orig.width;
    }

    set origWidth(value) {
        this['updateText'](true);
        let sign = PIXI.utils.sign(this.scale.x) || 1;
        this.scale.x = sign * value / this.texture.orig.width;
        this._width = value;
    }

    get origHeight() {
        this['updateText'](true);
        return Math.abs(this.scale.y) * this._texture.orig.height;
    }

    set origHeight(value) {
        this['updateText'](true);
        let sign = PIXI.utils.sign(this.scale.y) || 1;
        this.scale.y = sign * value / this.texture.orig.height;
        this._height = value;
    }

    get text() {
        return this._text;
    }

    set text(value) {
        value = value || ' ';
        value = value.toString();

        if (this._text === value) {
            return;
        }
        this._text = value;
        this.dirty = true;
        this.correctPosition();
    }

    get width() {
        return this.textRect.width;
    }

    set width(value) {
        this.textRect.width = value;
        this.correctPosition();
    }

    get height() {
        return this.textRect.height;
    }

    set height(value) {
        this.textRect.height = value;
        this.correctPosition();
    }
}
