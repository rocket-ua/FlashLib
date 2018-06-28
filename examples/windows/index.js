var app = null;

function start() {
    app = new PIXI.Application(1024, 768, {backgroundColor : /*0x1099bb*/ 0xCCCCCC});
    document.body.appendChild(app.view);

    loadAssets();
}

/**
 * Загрузка ресурсов
 */
function loadAssets() {
    PIXI.loader.baseUrl = './build/';
    PIXI.loader.add('FlashLibAssets', 'FlashLibAssets.json', 'json');
    PIXI.loader.once('complete', onLoadingComplete, this);
    PIXI.loader.load();
}

/**
 * Построение мувиклипа
 */
function onLoadingComplete() {
    var libraryData = PIXI.loader.resources['FlashLib'].data;
    FlashLib.addNewLibrary(libraryData);

    var item = FlashLib.createItemFromLibrary('loginWindow');
    item.x = 200;
    item.y = 80;
    app.stage.addChild(item);

    //var item1 = FlashLib.createItemFromLibrary('testBtn');
    //app.stage.addChild(item1);
}

start();