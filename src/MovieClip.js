import * as PIXI from 'pixi.js'
import FlashLib from './FlashLib'

export default class MovieClip extends PIXI.Container {

    constructor($data) {
        super($data);

        this.libData = $data;
        this.libName = this.libData.libraryName;
        this.timelineData = this.libData.timeline;
        this.currentFrameIndex = -1;
        this.currentFrameName = '';
        this.animateParams = null;

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

        if (nextIndex > this.timelineData.frames.length) {
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
            nextIndex = $loop ? this.timelineData.frames.length : 1;

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
    goToFrame($frameId, $force) {
        if (typeof $frameId === 'string') {
            $frameId = this.findFrameIndexByName($frameId);
        }

        if ($frameId === this.currentFrameIndex && (!$force && $force !== 0)) {
            //console.log('MovieClip ' + this.name + '(' + this.timelineData.name + ')' + ' now on frame ' + $frameId);
            return;
        }
        if ($frameId > this.timelineData.frames.length || $frameId < 1) {
            console.log('MovieClip ' + this.name + '(' + this.timelineData.name + ')' + ' does not have a frame ' + $frameId);
            return;
        }

        this.exitFrame();
        this.removeChildren();

        /*removeTest(this, false)
        function removeTest(parent, destroy) {
          if(parent.children) {
            parent.children.forEach((child)=>{
              removeTest(child, true)
            })
          }
          if(destroy && parent.parent) {
            parent.parent.removeChild(parent)
          }
        }*/

        /*while(this.children.length > 0) {
          let childToRemove = this.getChildAt(0)
          childToRemove.destroy({children:true})
        }*/
        this.constructFrame($frameId);
    }

    /**
     * Получить номер кадра по имени
     * @param {string} $name имя кадра
     * @returns {number} номер кадра или -1 если кадр не найден
     */
    findFrameIndexByName($name) {
        let index = -1;
        for (let i = 0; i < this.timelineData.frames.length; i++) {
            let frameData = this.timelineData.frames[i];
            index = frameData.findIndex((frameData1) => {
                return frameData1.name === $name;
            });
            if (index !== -1) {
                return i + 1;
            }
        }
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
     * @param {number | string} $frameId номер кадра который нужно создать
     */
    constructFrame($frameId) {
        //let currentFrameData = null;
        //let displayItemData = null;
        let displayItem = null;

        this.timelineData.frames[$frameId - 1].forEach((currentFrameData) => {
            currentFrameData.elements.forEach((displayItemData) => {
                displayItem = FlashLib.createDisplayItemFromData(displayItemData, this.libName);
                this.addChild(displayItem);
            });
            this.currentFrameName = currentFrameData.name;
            this.evalScript(currentFrameData.actionScript, $frameId);
        });

        /*for (let i = 0; i < this.timelineData.frames[$frameId - 1].length; i++) {
            currentFrameData = this.timelineData.frames[$frameId - 1][i];
            for (let j = 0; j < currentFrameData.elements.length; j++) {
                displayItemData = currentFrameData.elements[j];
                displayItem = FlashLibJS.createDisplayItemFromData(displayItemData);
                this.addChild(displayItem);
            }
        }*/
        //this.currentFrameName = currentFrameData.name;
        this.currentFrameIndex = $frameId;
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