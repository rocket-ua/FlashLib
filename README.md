# FlashLib
Инструмент для экспота библиотеки из проекта Animate CC или Flash Professional.
Библиотека экспотируется в виде JSON строки и записывается в файл, который после экспорта можно использоваться в своем проекте для построения объектов из библиотеки.

На данный момент для экспорта библиотеки используются jsfl скрипты, но в дальнейшем будет написан плагин для более удлбной работы.

## Инструкция по применению

### Подготовка
1. Положить файлы из папки в jsfl в папку со скриптам Animate CC
Windows: C:\Users\<Username>\AppData\Local\Adobe\Animate CC 2015.2\<your locale>\Configuration\Commands\
MacOS: /Users/<Username>/Library/Application Support/Adobe/Animate CC 2017/en_US/Configuration/Commands/
2. Запустить Animate CC, открыть имеющийся или создать новый проект.
3. В папке в которой лежит файл проекта Animate CC (.fla) создайте файл FlashLibConfig.json для настроек экспорта играфики.
Если конфигурационного файла не будет, будут использоваться настройки по умолчанию.
Описание конфигурационного файла ниже.
4. Когда нужно будет экспортировать библиотеку, выберить **Commands -> FlashLib -> FlashLib**
5. Если использовались настройки по умолчанию то в папке в которй назодится файл проекта (.fla) появится файл flashLib.json, это и есть экспортированная библиотека.
Так же появится папка graphics в которую будет экспортирована вся графика с сохранением струкруты такой как в проекте .fla
Еще появится файл graphicsList.json в котором описаны имена картинок которые были экспортированы и которые должны использоваться при создании элементов, так так же пути экспорта.

**Так же для работы с jsfl файлами можно поставить плагин JSFL Support для WebStorm, и запускать jsfl файлы прямо из IDE.**

#### Формат файла FlashLibConfig.json
Файл представляет собой json строку для настройки экспорта библиртеки и графики.
```
{
    libToJson: {
        sayResultToConsole: false,
        saveToFiles: true,
        buildForSelected: false,
        saveFileName: null,
        saveFilesPath: null
    },
    exportImages: {
        exportImages: false,
        exportImagesPath: null,
        overrideExistingFiles: false
    },
    createGraphicsList: {
        createImagesList: true,
        imagesListPath: null,
        sayResultToConsole: false,
        saveToFile: true
    }
}
```
**libToJson** - объект для настройки параметров экспорта библиотеки в json.
<li> sayResultToConsole - выводить json строку библиотек в консоль Animate CC.
<li> saveToFiles - созранять библиотеку в файл
<li> buildForSelected - созадвать из библиотеки только выбранные элементы
<li> saveFileName - имя файла в который дет созраена библиотека. По умолчанию flashLib.json
<li> saveFilesPath - абсолютный путь до папки в которую должен быть сохранен файл библиотеки. По умолчанию папка с проектом .fla

**exportImages** - объект для настройки параметров экспорта графики.
<li> exportImages - нужно ли экспортировать графику
<li> exportImagesPath - обсолютный путь до папки в которую будет экспортировать графика. По умолчанию в папке с проектом .fla 
будет создана папка exported и в нее будет экспортированна графика с созранением струкруты
<li> overrideExistingFiles - нужно ли перезаписывать при экспорте файлы, если такие уже имеются

**createGraphicsList** - объект для настройки параметров файла описания экспортированной графики.
<li> createImagesList - нужно ли создать файл описания экспотированной графики
<li> imagesListPath - абсолютный путь до папки в которой будет создан файл graphicsList.json
<li> sayResultToConsole - вывести файл экспортированной графики в консоль
<li> saveToFile - нужно ли сохранять результат в файл

### Загрузка графики
#### Использования TexturePacker
1. Всю папку graphics нужно длбавить в проект TexturePacker и скомпилировать весь проект при необходимости используя Multipack.
2. В расширенных настройках проекта выбрать пункты Data Format: PixiJS а так же Trim Sprite Names и Prepend Folder Name.
3. Скомпилировать прокт TexturePacker.

#### Загрузка отдельных картинок
1. В папе с проектом Animate CC после экспорта графики повился файл graphicsList.json.
Это файл описания имени под которым файл должен быть загружен в pixi.js и пути по которому он был экспортирован.
Для корректной работы нужно загруджать графику используя примерно такой код:
```
function loadAssets() {
    PIXI.loader.baseUrl = 'assets/';
    PIXI.loader.add("graphicsList", "graphicsList.json", "json");
    PIXI.loader.once('complete', startLoadingGameResources, this);
    PIXI.loader.load();
}

function startLoadingGameResources($loader, $resources) {
    PIXI.loader.reset();
    $resources.graphicsList.data.assets.forEach(function ($item) {
        PIXI.loader.add($item.name, $item.path);
    }, this);

    PIXI.loader.once('complete', onLoadingComplete, this);
    PIXI.loader.load();
}

function onLoadingComplete() {
    //Действия по завершению загрузки графики
}
```

### Создание элемента из библиотеки
После завершения загрузки графики и файла flashLib.json нужно указать выполнить следующие действия:
1. Указать скрипту FlashFib загруженную библиотеку
Для того что бы это сделать нужно слеоать примерно следующее (при условии что библиотека загружалась под именем flashLib:
```
var libraryData = PIXI.loader.resources['flashLib'].data;
FlashLib.addNewLibrary(libraryData);
```
2. Создать объект их библиотеки по имени.
Например если в библиотеке есть мувикслив и сменем game то создание будет выглядеть так:
```
var item = FlashLib.createItemFromLibrary('game');
```
Если мувиклим в библиотеке лежит по пути наример "characters/hero" то создание выглядит так:
```
var item = FlashLib.createItemFromLibrary('characters/hero');
```
После создания элемента из бибоитеки его можно добавить на сцену или в любой объект в который можно добавить child.
```
app.stage.addChild(item);
```


### Контакты
Telegram @rocket_ua