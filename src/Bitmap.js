import * as PIXI from 'pixi.js'

export default class Bitmap extends PIXI.Sprite {

    constructor($data) {
        let name = $data.name.replace(/(.png|.jpg)/, '');
        let texture = PIXI.utils.TextureCache[name];
        console.log(PIXI.utils.TextureCache);
        super(texture);

        this.libData = $data;
    }
}