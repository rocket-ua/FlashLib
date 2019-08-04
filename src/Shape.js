import * as PIXI from 'pixi.js'

export default class Shape extends PIXI.Graphics {

    constructor($data) {
        super();

        this.libData = $data;

        this.createGraphic();
    }

    createGraphic() {
        if(this.libData.isRectangleObject) {
            this.beginFill(0x0, 1);
            this.drawRect(-this.libData.width / 2, -this.libData.height / 2, this.libData.width, this.libData.height);
            this.endFill();
        } else if(this.libData.isOvalObject) {
            this.beginFill(0x0, 1);
            this.drawEllipse(0 ,0, this.libData.width / 2, this.libData.height / 2);
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
