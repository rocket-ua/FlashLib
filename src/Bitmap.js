import * as PIXI from 'pixi.js'
import FlashLib from "flashlib";

export default class Bitmap extends PIXI.Sprite {

    constructor($data) {
        let name = $data.name.replace(/(.png|.jpg)/, '');
        let texture = PIXI.utils.TextureCache[name];
        super(texture);

        this.libData = $data;
        this.displayData = this.libData.displayData;

        FlashLib.setDisplayItemProperties(this, this.displayData);
    }
}