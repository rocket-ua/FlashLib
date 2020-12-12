import {Container, Ticker, UPDATE_PRIORITY} from 'pixi.js'
import FlashLib from './FlashLib'
import DisplayProperties from './DisplayProperties'

export default class MovieClip extends Container {

    constructor($data, $displayItemData) {
        super();
        this.libData = $data;
        //this.displayData = this.libData.displayData;
        this.displayData = $displayItemData;
        this.libName = this.libData.libraryName;
        this.timelineData = this.libData.timeline;
        this.layersData = this.timelineData.layers/*.concat().reverse()*/;
        this.currentFrameIndex = -1;
        this.currentFrameName = '';
        this.animateParams = null;
        this.layers = [];
        this.layerMask = null;

        this.layersData.forEach((layerData) => {
            let layer = {
                name: layerData.name,
                type: layerData.layerType,
                parent: layerData.parentLayer,
                elements: []
            };
            this.layers.push(layer);
        });

        this.startFrameTime = null;

        this.isPlaying = false;
        this.goToFrame(1);
        
        DisplayProperties.setDisplayItemProperties(this, this.displayData);
        DisplayProperties.setBlendMode(this);
    }

    /**
     * Вызывается при смене кадра перед очисткой кадра и созданием новых элементов
     */
    exitFrame() {

    }

    /**
     * Получить детей по имени в библиотеке
     * Паботает только с элементами этого расширения
     * @param {string} $name имя элемента из библиотеки
     * @returns {array} массив объектов имя в бибилиотеке совпадает с заданым
     */
    getChildrenByLibName($name) {
        return this.children.filter(function (child) {
            return (child.hasOwnProperty('libData') && child.libData.hasOwnProperty('name') && child.libData.name === $name);
        })
    }

    /**
     * Переход к следующему кадру клипа
     * @param {boolean} $loop если дошли до последнего кадра переходить ли на первыц
     */
    goToNextFrame($loop) {
        let nextIndex = this._getNextFrameIndex($loop, false, 1);
        this.goToFrame(nextIndex);
    }

    /**
     * Расчет индекса следующего кадра
     * @param $loop
     * @param $reverse
     * @param $delta
     * @returns {*}
     * @private
     */
    _getNextFrameIndex($loop, $reverse, $delta) {
        let nextIndex = 0;
        let offset = 0;
        if ($reverse) {
            nextIndex = this.currentFrameIndex - $delta % this.timelineData.frameCount;
            offset = nextIndex;
            if (offset < 1) {
                nextIndex = $loop ? this.timelineData.frameCount + offset : 1;
            }
        } else {
            nextIndex = this.currentFrameIndex + $delta % this.timelineData.frameCount;
            offset = nextIndex - this.timelineData.frameCount;
            if (offset > 0) {
                nextIndex = $loop ? offset : this.currentFrameIndex;
            }
        }
        return nextIndex;
    }

    /**
     * Перейти к предыдущему кадру
     * @param {boolean} $loop если дошли до первого кадра переходить ли на последний
     */
    goToPreviousFrame($loop) {
        let nextIndex = this._getNextFrameIndex($loop, true, 1);
        this.goToFrame(nextIndex);
    }

    /**
     * Перейти на конкретный кадр
     * @param {number | string} $frameId номер или имя кадра на который нужно перейти
     * @param {boolean} $force перерисовать кадр даже если текущий кадр такой же
     */
    goToFrame($frameId, $force = false) {
        if (typeof $frameId === 'string') {
            $frameId = this.findFrameIndexByName($frameId);
        }

        if ($frameId === this.currentFrameIndex && this.isPlaying && !this.animateParams.loop) {
            this.stop();
            this.emit('animationComplete');
        }

        if ($frameId === this.currentFrameIndex && !$force) {
            //console.log(`MovieClip ${this.name} (${this.timelineData.name}) now on frame ${$frameId}`);
            return;
        }
        if ($frameId > this.timelineData.frameCount || $frameId < 1) {
            console.log(`MovieClip ${this.name} (${this.timelineData.name}) does not have a frame ${$frameId}`);
            return;
        }

        this.exitFrame();
        this.constructFrame($frameId);
    }

    /**
     * Получить номер кадра по имени
     * @param {string} $name имя кадра
     * @returns {number} номер кадра или -1 если кадр не найден
     */
    findFrameIndexByName($name) {
        let index = -1;
        /*for (let i = 0; i < this.timelineData.frameCount; i++) {
            let frameData = this.timelineData.frames[i];
            index = frameData.findIndex((frameData1) => {
                return frameData1.name === $name;
            });
            if (index !== -1) {
                return i + 1;
            }
        }*/
        return index;
    }

    //TODO: Написать правильноые расчеты смены кадров
    /**
     *
     * @param $delta
     */
    animate($delta) {
        let frameDuration = 1000 / this.animateParams.fps;
        let currentTime = Date.now();
        let deltaTime = currentTime - this.startFrameTime;
        if (deltaTime < frameDuration) {
            return;
        }
        let skipFramesCount = Math.ceil(deltaTime / frameDuration);
        let nextFrameIndex = this._getNextFrameIndex(this.animateParams.loop, this.animateParams.revers, skipFramesCount);
        this.goToFrame(nextFrameIndex);
        this.startFrameTime = currentTime - (deltaTime % frameDuration);
    }

    /**
     *
     * @param {boolean} $loop зациклена ли анимация
     * @param {boolean} $revers проигрывание в обратную сторону
     * @param {number} $fps какой частотой обновления кадров нужно проиграть
     */
    play($loop, $revers, $fps) {
        if (this.isPlaying) {
            return;
        }

        this.animateParams = {loop: $loop, revers: $revers, fps: $fps || 24};
        this.startFrameTime = Date.now();
        Ticker.shared.add(this.animate, this, UPDATE_PRIORITY.HIGH);
        this.isPlaying = true;
    }

    /**
     * Перейти на кадр и запустить проигрывание мувиклипа
     * @param {number | string} $frameId с какого кадра начать проигрывание
     * @param {boolean} $loop зациклена ли анимация
     * @param {boolean} $revers проигрывание в обратную сторону
     * @param {number} $fps с какой частотой обновления кадров нужно проиграть
     */
    goToAndPlay($frameId, $loop, $revers, $fps) {
        this.stop();
        this.goToFrame($frameId);
        this.play($loop, $revers, $fps);
    }

    /**
     * Остановить проишрывание мувиклипа
     */
    stop() {
        if (!this.isPlaying) {
            return;
        }

        this.animateParams = null;
        Ticker.shared.remove(this.animate, this);
        this.isPlaying = false;
    }

    /**
     * Создать элемениы кадра
     * @param {number} $frameId номер кадра который нужно создать
     */
    constructFrame($frameId) {
        let startAddPosition = 0;
        this.layersData.forEach((currentLayerData, layerIndex) => {
            /*this._buildLayer(currentLayerData, layerIndex, $frameId, startAddPosition);*/
            if (!currentLayerData.frames[$frameId - 1]) {
                this._removeElements(layerIndex);
                return;
            }

            let currentFrameData = currentLayerData.frames[$frameId - 1];
            currentFrameData = currentLayerData.frames[currentFrameData.startFrame];
            let prevFrameData = currentLayerData.frames[this.currentFrameIndex - 1];
            startAddPosition += currentFrameData.elements.length;

            if (prevFrameData && $frameId >= prevFrameData.startFrame + 1 && $frameId <= prevFrameData.startFrame + prevFrameData.duration) {
                return;
            }

            let newAdded = this._addNewChild(currentFrameData, startAddPosition, $frameId);
            this._removeElements(layerIndex);
            this.layers[layerIndex].elements = newAdded;
        });

        this._setMaskLayer();

        this.currentFrameIndex = $frameId;
    }

    _buildLayer($layerData, $layerIndex, $frameId, $startAddPosition) {
        if (!$layerData.frames[$frameId - 1]) {
            this._removeElements($layerIndex);
            return;
        }

        let currentFrameData = $layerData.frames[$frameId - 1];
        currentFrameData = $layerData.frames[currentFrameData.startFrame];
        let prevFrameData = $layerData.frames[this.currentFrameIndex - 1];
        $startAddPosition += $layerData.elements.length;

        if (prevFrameData && $frameId >= prevFrameData.startFrame + 1 && $frameId <= prevFrameData.startFrame + prevFrameData.duration) {
            return;
        }

        let newAdded = this._addNewChild(currentFrameData, $startAddPosition, $frameId);
        this._removeElements($layerIndex);
        this.layers[$layerIndex].elements = newAdded;
    }

    /**
     * Добавление слоя с маской к слоям
     * @private
     */
    _setMaskLayer() {
        this.layers.forEach((layer) => {
            if (layer.parent) {
                let parentLayer = this.layers.find((sLayer) => {
                    return sLayer.name === layer.parent;
                });
                if (parentLayer && parentLayer.type === 'mask') {
                    layer.elements.forEach((lElement) => {
                        lElement.layerMask = parentLayer;
                    })
                }
            }
        });
    }

    /**
     * Добавление чайлов для нового кадра
     * @param {object} $currentFrameData данные чайлов для текущего кадра
     * @param {number} $startAddPosition стартовая позиция добавления чайлдов
     * @param {number} $frameId номер кадра
     * @returns {[]}
     * @private
     */
    _addNewChild($currentFrameData, $startAddPosition, $frameId) {
        let newAdded = [];
        $currentFrameData.elements.forEach((elementData, index) => {
            let displayItem = FlashLib.createDisplayItemFromData(elementData, this.libName);
            if (this.blendMode !== undefined) {
                displayItem.blendMode = this.blendMode;
            }
            this.addChildAt(displayItem, $startAddPosition - $currentFrameData.elements.length + index);
            newAdded.push(displayItem);

            this.currentFrameName = $currentFrameData.name;
            this.evalScript($currentFrameData.actionScript, $frameId);
        });
        return newAdded;
    }

    /**
     * Удаление элементов кадра с слоя
     * @param $layerIndex индекс слоя
     * @private
     */
    _removeElements($layerIndex) {
        this.layers[$layerIndex].elements.forEach((elem) => {
            if (!elem._destroyed) {
                elem.destroy({children: true});
            }
        });
        //this.layers[$layerIndex].elements = [];
    }

    /**
     * Выполнить скрипт с текущим контекстом
     * @param {string} $script текст скрипта который нужно выполнить
     * @param {number | string} $frameId номер или имя кадра
     */
    evalScript($script, $frameId) {
        /*if ($script && $script !== '') {
            try {
                window.eval($script);
            } catch (error) {
                console.log(`Can't eval script on "${this.libData.name}" in ${$frameId} frame`);
            }
        }*/
    }

    resetBlendMode() {
        DisplayProperties.setBlendMode(this);
    }

    destroy(options) {
        this.stop();
        super.destroy(options);
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

    get blendMode() {
        return this._blendMode;
    }

    set blendMode(value) {
        if (value === undefined) {
            return;
        }
        this._blendMode = value;
        this.children.forEach((child)=>{
            child.blendMode = this.blendMode;
            if (child.resetBlendMode) {
                child.resetBlendMode();
            }
        })
    }

    get useTransformPoint() {
        return this._useTransformPoint || false;
    }

    set useTransformPoint(value) {
        if (this._useTransformPoint === value) {
            return;
        }

        this._useTransformPoint = value;

        if (this._useTransformPoint) {
            this.pivot.set(this.tpX, this.tpY);
            this.x += this.tpX;
            this.y += this.tpY;
        } else {
            this.pivot.set(0, 0);
            this.x -= this.tpX;
            this.y -= this.tpY;
        }
    }
}
