declare namespace FlashLibJS {
    function addNewLibrary($libraryName:any):void;
    function createItemFromLibrary($itemName:string, $libraryName?:any):any;
    function getItemDataFromLibrary($itemName:string, $libraryName?:any):any;

    class MovieClip extends PIXI.Container {
        constructor($data:any);
        public currentFrameIndex:number;
        public currentFrameName:string;
        public goToNextFrame($loop?:boolean):void;
        public goToPreviousFrame($loop?:boolean):void;
        public goToFrame($frameId:number):void;
        public goToAndPlay($frameId:number, $loop?:boolean, $revers?:boolean, $fps?:number):void;
        public play($loop?:boolean, $revers?:boolean, $fps?:number):void;
        public stop():void;
        protected constructFrame($frameId:number):void;
        protected constructionComplete():void;
    }

    class TextField extends PIXI.Text {
        constructor($data:any);
    }
}