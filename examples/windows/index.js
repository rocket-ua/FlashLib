var app = null;

function start() {
    app = new PIXI.Application(1024, 768, {backgroundColor : 0x1099bb});
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
    item.x = 50;
    item.y = 100;
    app.stage.addChild(item);
}

start();