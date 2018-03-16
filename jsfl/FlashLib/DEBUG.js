/**
 * Created with WebStorm.
 * User: rocket
 * Date: 02.03.2018
 * Time: 01:56
 * To change this template use File | Settings | File Templates.
 */

DEBUG = {
    /**
     * Вызов рекурсивной функции для трейса свойист в значений элемента
     * @param $element
     * @param $index
     */
    traceElementPropertysRecursivity: function ($element, $index) {
        this._traceElementPropertysRecursivity($element, $index);
        fl.trace("");
        fl.trace("=============================================");
        fl.trace("");
    },
    /**
     * Рекурсивная функция которая трейсит все свойства и значения элемента
     * @param $element
     * @param $index
     * @private
     */
    _traceElementPropertysRecursivity: function ($element, $index) {
        if($index > 10) {
            return;
        }

        var offset = "";
        for(var i = 0; i < $index; i++) {
            offset += "~~";
        }
        for (var property in $element) {
            try {
                fl.trace(offset + property + ": " + $element[property]);
                if(typeof($element[property]) === "object" && property !== "layer") {
                    this._traceElementPropertysRecursivity($element[property], $index + 1);
                }
            } catch ($error) {
                fl.trace(offset + property + ": " + $error);
            }
        }
    },
    traceElementProperties: function ($element) {
        fl.trace("------------------------------------");
        try {
            for(var property in $element) {
                try {
                    fl.trace(property + ": " + $element[property]);
                } catch ($error) {
                    fl.trace(property + ": " + $error);
                }
            }
        } catch ($errr) {
            fl.trace($errr);
        }

        fl.trace("------------------------------------");
    }
};