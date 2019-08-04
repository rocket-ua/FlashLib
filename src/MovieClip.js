import * as PIXI from 'pixi.js'
import FlashLib from './FlashLib'

export default class MovieClip extends PIXI.Container {

    constructor($data) {
        super($data);

        this.libData = $data;
        this.libName = this.libData.libraryName;
        this.timelineData = this.libData.timeline;
        this.layersData = this.timelineData.layers.concat().reverse();
        this.currentFrameIndex = -1;
        this.currentFrameName = '';
        this.animateParams = null;
        this.layers = [];
        this.timelineData.layers.forEach(() => {
            this.layers.push([]);
        });

        this.startFrameTime = null;

        this.isPlaying = false;
        this.goToFrame(1);
    }

    /**
     * Вызывается при зеверщении создания объкета и нахначение параметров на сцене
     */
    constructionComplete() {

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
        let nextIndex = this.currentFrameIndex + 1;

        if (nextIndex > this.timelineData.frameCount) {
            nextIndex = $loop ? 1 : this.currentFrameIndex;

            if (this.isPlaying && !$loop) {
                this.stop();
            }
        }
        this.goToFrame(nextIndex);
    }

    /**
     * Перейти к предыдущему кадру
     * @param {boolean} $loop если дошли до первого кадра переходить ли на последний
     */
    goToPreviousFrame($loop) {
        let nextIndex = this.currentFrameIndex - 1;
        if (nextIndex < 1) {
            nextIndex = $loop ? this.timelineData.frameCount : 1;

            if (this.isPlaying && !$loop) {
                this.stop();
            }
        }
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

        if ($frameId === this.currentFrameIndex && !$force) {
            //console.log('MovieClip ' + this.name + '(' + this.timelineData.name + ')' + ' now on frame ' + $frameId);
            return;
        }
        if ($frameId > this.timelineData.frameCount || $frameId < 1) {
            console.log('MovieClip ' + this.name + '(' + this.timelineData.name + ')' + ' does not have a frame ' + $frameId);
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
        let revers = this.animateParams.revers;
        let loop = this.animateParams.loop;
        for (let i = 0; i < skipFramesCount; i++) {
            if (revers) {
                this.goToPreviousFrame(loop);
            } else {
                this.goToNextFrame(loop);
            }
        }
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
        PIXI.Ticker.shared.add(this.animate, this, PIXI.UPDATE_PRIORITY.HIGH);
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
        PIXI.Ticker.shared.remove(this.animate, this);
        this.isPlaying = false;
    }

    /**
     * Создать элемениы кадра
     * @param {number} $frameId номер кадра который нужно создать
     */
    constructFrame($frameId) {
        let startAddPosition = 0;
        this.layersData.forEach((currentLayerData, layerIndex) => {
            if (!currentLayerData.frames[$frameId - 1]) {
                removeElements.call(this, layerIndex);
                return;
            }

            let currentFrameData = currentLayerData.frames[$frameId - 1];
            let prevFrameData = currentLayerData.frames[this.currentFrameIndex - 1];
            startAddPosition += currentFrameData.elements.length;

            if (prevFrameData && $frameId >= prevFrameData.startFrame + 1 && $frameId <= prevFrameData.startFrame + prevFrameData.duration) {
                return;
            }

            let newAdded = addNewChild.call(this, currentFrameData);
            removeElements.call(this, layerIndex);
            this.layers[layerIndex] = newAdded;
        });

        this.currentFrameIndex = $frameId;

        function addNewChild($currentFrameData) {
            let newAdded = [];
            $currentFrameData.elements.forEach((elementData, index) => {
                let displayItem = FlashLib.createDisplayItemFromData(elementData, this.libName);

                this.addChildAt(displayItem, startAddPosition - $currentFrameData.elements.length + index);
                newAdded.push(displayItem);

                this.currentFrameName = $currentFrameData.name;
                this.evalScript($currentFrameData.actionScript, $frameId);
            });
            return newAdded;
        }

        function removeElements($layerIndex) {
            this.layers[$layerIndex].forEach((elem) => {
                elem.destroy({children: true});
            });
            this.layers[$layerIndex] = [];
        }
    }

    /**
     * Выполнить скрипт с текущим контекстом
     * @param {string} $script текст скрипта который нужно выполнить
     * @param {number | string} $frameId номер или имя кадра
     */
    evalScript($script, $frameId) {
        if ($script && $script !== '') {
            try {
                eval($script);
            } catch (error) {
                console.log("Can't eval script on", "'" + this.libData.name + "'", 'in', $frameId, 'frame')
            }
        }
    }
}