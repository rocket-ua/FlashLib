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
    PIXI.loader.baseUrl = 'assets/';
    PIXI.loader.add("assets", "assets.json", "json");
    PIXI.loader.once('complete', startLoadingGameResources, this);
    PIXI.loader.load();
}

function startLoadingGameResources($loader, $resources) {
    PIXI.loader.reset();

    $resources.assets.data.assets.forEach(function ($item) {
        PIXI.loader.add($item.name, $item.path);
    }, this);

    PIXI.loader.once('complete', this.onLoadingComplete, this);
    PIXI.loader.load();
}

/**
 * Построение мувиклипа
 */
function onLoadingComplete() {
    var libraryData = PIXI.loader.resources['flashLib'].data;
    FlashLib.addNewLibrary(libraryData);

    var item = FlashLib.createItemFromLibrary('loginWindow');
    item.x = 50;
    item.y = 100;
    app.stage.addChild(item);
}

start();