import {Container, Sprite, Text, Graphics, TextStyle, DisplayObject} from "pixi.js";

export type TInstance = MovieClip | Graphic | Bitmap
export type TDisplay = TextField | Shape
export type TAll = TInstance | TDisplay

export type TLibraryItemData = any
export type TDisplayItemData = any

export function registerClass(path:string, $class: Function): void
export function addNewLibrary(library:any): void
export function createItemFromLibrary<T>(displayItemData:string | object, libraryName: string): T
export function getItemDataFromLibrary(itemName:string, libraryName:string): any
export function findItemByType(itemName:string, libraryName:string): any[]
export function getLibraryByName(libraryName:string): any
export function createItemFromLibraryData(libraryItemData:any, displayItemData:any): TInstance
export function createDisplayItemFromData(libraryItemData:any, displayItemData:any): TInstance | TDisplay
export function setDefaultClass(name:string, newClass:any): void

export declare class MovieClip extends Container {
    constructor(libraryItemData: TLibraryItemData, displayItemData: TDisplayItemData);

    readonly libData: TLibraryItemData
    readonly displayData: TDisplayItemData
    readonly libName: string
    readonly currentFrameIndex: number
    readonly currentFrameName: string
    readonly elements: {
        [key: string]: TAll
    }

    getElement<T>(name:string): T
    exitFrame(): void
    getChildrenByLibName<T>(name:string): T[]
    findFrameIndexByName(name:string): number
    goToNextFrame(loop?:boolean): void
    goToPreviousFrame(loop?:boolean): void
    goToFrame(frameId: number | string, $force?:boolean): void
    play(loop?:boolean, $revers?:boolean, $fps?:number): void
    goToAndPlay(frameId: number | string, loop?:boolean, $revers?:boolean, $fps?:number): void
    stop(): void
    resetBlendMode(): void

    getChildByName<T>(name: string, isRecursive?: boolean): T
    getChildAt<T>(index: number): T

    get blendMode(): string
    set blendMode(value:string)

    get useTransformPoint():boolean
    set useTransformPoint(value:boolean)
}

export declare interface IMovieClip extends MovieClip {

}

export declare class Graphic extends MovieClip {
    constructor(libraryItemData: TLibraryItemData, displayItemData: TDisplayItemData);
}

export declare class Bitmap extends Sprite {
    constructor(libraryItemData: TLibraryItemData, displayItemData: TDisplayItemData);

    readonly libData: TLibraryItemData
    readonly displayData: TDisplayItemData

    get useTransformPoint():boolean
    set useTransformPoint(value:boolean)
}

export declare class TextField extends Text {
    constructor(libraryItemData: TLibraryItemData, libraryName: string);

    readonly libName: string;
    readonly displayData: TLibraryItemData;

    fitSize(width?:boolean, height?:boolean): void
    correctPosition(horizontal?:boolean, vertical?:boolean): void
    drawDebug(): void

    get useTransformPoint():boolean
    set useTransformPoint(value:boolean)

    get origWidth():number
    set origWidth(value:number)

    get origHeight():number
    set origHeight(value:number)

    style:ITextFieldStyle
}

export declare interface ITextFieldStyle extends TextStyle {
    fitHorizontal: boolean
    fitVertical: boolean
    defaultFontSize: number
    autoFitFontSize: boolean
}

export declare class Shape extends Graphics {
    constructor(libraryItemData: TLibraryItemData, libraryName: string);

    readonly displayData: TLibraryItemData;

    get useTransformPoint():boolean
    set useTransformPoint(value:boolean)
}

export declare class DisplayProperties {
    setDisplayItemProperties(data: TLibraryItemData, displayItemData: TDisplayItemData): void
    setBlendMode(item:TInstance | TDisplay): void
}
