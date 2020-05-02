import * as PIXI from 'pixi.js'
import FlashLib from "flashlib";

export default class Shape extends PIXI.Graphics {

    constructor($data) {
        super();

        this.displayData = $data;

        this.createGraphic();
        
        FlashLib.setDisplayItemProperties(this, this.displayData);
    }

    createGraphic() {
        if(this.displayData.isRectangleObject) {
            this.beginFill(0x0, 1);
            this.drawRect(-this.displayData.width / 2, -this.displayData.height / 2, this.displayData.width, this.displayData.height);
            this.endFill();
        } else if(this.displayData.isOvalObject) {
            this.beginFill(0x0, 1);
            this.drawEllipse(0 ,0, this.displayData.width / 2, this.displayData.height / 2);
            this.endFill();
        }

        /*let arr = [];
        this.vertices.forEach((vortex)=>{
            arr.push(vortex.x, vortex.y);
            this.vertices.forEach((vortex1)=>{
                arr.push(vortex1.x, vortex1.y);
            });
        });

        this.beginFill(0x0, 1);
        this.drawPolygon(arr);
        this.endFill();*/
    }
}
