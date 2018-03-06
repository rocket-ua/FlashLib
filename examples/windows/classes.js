function Button($data) {
    FlashLib.MovieClip.call(this, $data);

    this.actions = {};

    this.init();
    this.addListeners();
}

Button.prototype = Object.create(FlashLib.MovieClip.prototype);
Button.prototype.constructor = Button;

Button.prototype.init = function () {
    this.interactive = true;
    this.buttonMode = true;
};

Button.prototype.addListeners = function () {
    this.on('mouseover', this.onEvent, this);
    this.on('mouseout', this.onEvent, this);
    this.on('mousedown', this.onEvent, this);
    this.on('mouseup', this.onEvent, this);
    this.on('click', this.onEvent, this);
};

Button.prototype.onEvent = function($data) {
    switch ($data.type) {
        case 'mouseover':
            this.onOver();
            break;
        case 'mouseout':
            this.onOut();
            break;
        case 'mousedown':
            this.onDown();
            break;
        case 'mouseup':
            this.onUp();
            break;
        case 'click':
            this.onClick();
            break;
    }

    var actionData = this.actions[$data.type];
    if(actionData) {
        actionData.callback.call(actionData.context);
    }
};

Button.prototype.onOver = function() {
    this.goToFrame(2);
};

Button.prototype.onOut = function() {
    this.goToFrame(1);
};

Button.prototype.onDown = function() {
    this.goToFrame(3);
};

Button.prototype.onUp = function() {
    this.goToFrame(2);
};

Button.prototype.onClick = function() {
    console.log('');
};

/////////////

function CheckBox($data) {
    FlashLib.MovieClip.call(this, $data);

    this.checked = false;

    this.init();
    this.addListeners();
}

CheckBox.prototype = Object.create(FlashLib.MovieClip.prototype);
CheckBox.prototype.constructor = CheckBox;

CheckBox.prototype.init = function () {
    this.interactive = true;
    this.buttonMode = true;
};

CheckBox.prototype.addListeners = function () {
    this.on('click', this.onEvent, this);
};

CheckBox.prototype.onEvent = function($data) {
    switch ($data.type) {
        case 'click':
            this.onClick();
            break;
    }
};

CheckBox.prototype.onClick = function() {
    this.checked = !this.checked;
    this.goToFrame(this.checked ? 2 : 1);
};