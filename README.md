# FlashLib
Данный инструмент находиться в стадии разработки.  
FlashLib - инструмент для экспорта библиотеки из проекта Animate CC и сборки с помощю PIXI.js.
Пример использования: https://github.com/rocket-ua/FlashLibExample

## Особенности
<li> Экспорт MovieClip.
<li> Экспорт Bitmap.
<li> Экспорт TextField.
<li> Возможность создания элементов из библиотеки по имени.

## Инструкция по применению
После установки для экспорта ресурсов и библиотеки используйте команду **flashlib**.
В **package.json** нужно добавить скрипт:
```
"scripts": {
    "openPattern": "flashlib --open /Users/username/Projects/FlashLibExample/assets/pattern.fla",
    "start": "flashlib"
},
```
Флаг **open** позволяет указать к какому проекту .fla применить скрипт экспорта.

#### Формат файла FlashLibConfig.json
Файл настройки экспорта ресурсов и библиотеки.
Создается автоматически при первом применении скрипта к .fla файлу.
```
{
    "basePath": "/Users/username/Projects/FlashLibExample/dist/",
    "libToJson": {
        "flashLibName": "FlashLib",
        "saveToFile": true,
        "sayResultToConsole": false,
        "buildForSelected": false
    },
    "exportImages": {
        "flashLibName": "FlashLib",
        "exportImages": true,
        "overrideExistingFiles": false,
        "addExtensions": false
    },
    "createAssetsList": {
        "libName": "pattern.fla",
        "saveToFile": true,
        "sayResultToConsole": false,
        "libSettings": {
            "path": "",
            "basePath": ""
        }
    }
}
```
**basePath** - путь к папке для экспорта проекта. Необходимо изменить на требуемый. По умолчанию экспортируется в папку где находиться .fla файл.
**libToJson** - настройка параметров экспорта библиотеки в json.
<li> flashLibName - имя библиотеки.
<li> saveToFiles - сохранять библиотеку в файл.
<li> sayResultToConsole - выводить json строку библиотеки в консоль.
<li> buildForSelected - экспортировать из библиотеки только выбранные элементы.
  
**exportImages** - настройки параметров экспорта графики.
<li> flashLibName - имя библиотеки.
<li> exportImages - экспортировать графику.
<li> overrideExistingFiles - перезаписывать файлы, если такие уже имеются.
  
**createAssetsList** - настройки параметров файла загрузки ресурсов.
<li> libName - название файла библиотеки из которой экспортировались ресурсы.
<li> saveToFile - сохранять результат в файл.
<li> sayResultToConsole - выводить json строку ассетов в консоль.

### Загрузка ресурсов
#### Для загрузки проекта нужно загрузить файл FlashLibAssets.json из папки куда экспортировался проект (basePath)
1. После экспорта ресурсов и библиотеки необходимо загрузить файл FlashLibAssets.json с помощю PIXI.js
```
function loadAssets() {
    PIXI.loader.add('FlashLibAssets', 'FlashLibAssets.json', 'json');
    PIXI.loader.once('complete', onLoadingComplete, this);
    PIXI.loader.load();
}

function onLoadingComplete() {
    //ALl resources for FlashLib is loaded
}
```

2. Создать объект их библиотеки по имени.
```
var game = FlashLib.createItemFromLibrary('game');
var heroImage = FlashLib.createItemFromLibrary('characters/hero');

app.stage.addChild(game);
app.stage.addChild(heroImage);
```
В качестве аргумента **createItemFromLibrary** используется имя и путь к элемиенту в библиотеке .fla проекта. 

### После изменения проекта Animate CC (.fla) нужно перезапустить скрипт для экспорта ресурсов

### Можно использовать спрайтлисты для загрузки графики.

### Контакты
Telegram @rocket_ua
