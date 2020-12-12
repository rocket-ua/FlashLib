import MovieClip from './MovieClip'

export default class Graphic extends MovieClip {
    constructor($data, $displayItemData) {
        super($data, $displayItemData);
        this.libData = $data;
    }
}
