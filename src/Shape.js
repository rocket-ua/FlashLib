import * as PIXI from 'pixi.js'

export default class Shape extends PIXI.Graphics {

    constructor($data) {
        super();

        this.libData = $data;

        this.createGraphic();
    }

    createGraphic() {

    }
}
