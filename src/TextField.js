import * as PIXI from 'pixi.js'

export default class TextField extends PIXI.Text {

    constructor($data) {
        let textRun = $data.textRuns[0];
        let textAttrs = textRun.textAttrs;
        let style = {
            align: textAttrs.alignment,
            fill: textAttrs.fillColor,
            fontFamily: textAttrs.face/*.split(' ')*/,
            fontSize: textAttrs.size,
            fontStyle: textAttrs.italic ? 'italic' : 'normal',
            fontWeight: textAttrs.bold ? 'bold' : 'normal',
            letterSpacing: textAttrs.letterSpacing,
            leading: textAttrs.lineSpacing
            // stroke: '#000000',
            // strokeThickness: 3
        };

        super(textRun.characters, style);

        this.textRect = null;
        this.libData = $data;
        this.createRect();
        this.correctPosition();
    }

    createRect() {
        this.textRect = new PIXI.Rectangle(0, 0, 0, 0);
    };

    correctPosition($horizontal, $vertical) {
        if(!this.textRect) {
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

        //this.transform.position.y += this.libData.textRuns[0].textAttrs.descent / 2;
        //this.transform.position.y += this.libData.textRuns[0].textAttrs.descent
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
        //console.log(this.libData.textRuns[0].textAttrs.descent)
        //this.textRect.y += this.libData.textRuns[0].textAttrs.descent
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
