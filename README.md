

# FlashLib
Данный инструмент находиться в стадии разработки.  
Для экспорта библиотеки из проекта Animate CC или Flash Professional.  
Библиотека экспортируется в виде JSON файла и записывается в файл, который после экспорта можно использоваться в своем проекте для построения объектов из библиотеки.

На данный момент для экспорта библиотеки используются jsfl скрипты, но так же сейчас пишется плагин для Animate CC для более удобного использования.з

## Особенности
<li> Поддержка мувиклипов. В мувиклипах поддерживается таймлайн и слои
<li> Поддержка работы с Bitmap изображениями
<li> Поддержка TextField
<li> Поддержка вложенности в чайлдах и мувиклипах
<li> Поддержка фильтра DropShadow


## Инструкция по применению

### Подготовка
1. Положить файлы из папки в jsfl в папку со скриптам Animate CC
>Windows: C:\Users\<Username>\AppData\Local\Adobe\Animate CC 2015.2\<your locale>\Configuration\Commands\
>MacOS: /Users/<Username>/Library/Application Support/Adobe/Animate CC 2017/en_US/Configuration/Commands/
2. Запустить Animate CC, открыть имеющийся или создать новый проект.
3. Когда нужно будет экспортировать библиотеку, выберите **Commands -> FlashLib -> FlashLib**
4. Если использовались настройки по умолчанию то в папке в которой находится файл проекта (.fla) появится файлы  
**FlashLibConfig.json** - конфигурационный файл с настройками по умолчанию (описание файла ниже).  
**FlashLib.json** - файл с экспортированной библиотекой.  
**FlashLibAssets.json** - файл для загрузки графики из библиотеки.  
Так же появится папка **<имя проекта>_lib** в которую будет экспортирована вся графика с сохранением структуры такой как в проекте .fla

**Так же для работы с jsfl файлами можно поставить плагин JSFL Support для WebStorm, и запускать jsfl файлы прямо из IDE.**

#### Формат файла FlashLibConfig.json
Файл представляет собой json строку для настройки экспорта библиотеки и графики.
```
{
    {
        basePath: '/Users/rocket/Projects/FlashLib/examples/windows/build/',
        libToJson: {
            saveToFile: true,
            sayResultToConsole: false,
            buildForSelected: false
        },
        exportImages: {
            exportImages: true,
            overrideExistingFiles: false,
            addExtensions: false
        },
        createAssetsList: {
            saveToFile: true,
            sayResultToConsole: false
        }
    };
}
```
**basePath** - путь к папке куда будет экспортирован проект.  
**libToJson** - объект для настройки параметров экспорта библиотеки в json.
<li> saveToFiles - сохранять библиотеку в файл.
<li> sayResultToConsole - выводить json строку библиотек в консоль Animate CC.
<li> buildForSelected - создавать из библиотеки только выбранные элементы.
  
**exportImages** - объект для настройки параметров экспорта графики.
<li> exportImages - нужно ли экспортировать графику
<li> exportImagesPath - абсолютный путь до папки в которую будет экспортировать графика. По умолчанию в папке с проектом .fla 
будет создана папка exported и в нее будет экспортирована графика с сохранением структуры
<li> overrideExistingFiles - нужно ли перезаписывать при экспорте файлы, если такие уже имеются
  
**createGraphicsList** - объект для настройки параметров файла описания экспортированной графики.
<li> saveToFile - нужно ли сохранять результат в файл.
<li> sayResultToConsole - выводить json строку ассетов в консоль Animate CC.

### Загрузка графики
#### Загрузка отдельных картинок
1. В папе с проектом Animate CC после экспорта графики повился файл graphicsList.json.
Это файл описания имени под которым файл должен быть загружен в pixi.js и пути по которому он был экспортирован.
Для корректной работы нужно загружать графику используя примерно такой код:
```
function loadAssets() {
    PIXI.loader.add('FlashLibAssets', 'FlashLibAssets.json', 'json');
    PIXI.loader.once('complete', onLoadingComplete, this);
    PIXI.loader.load();
}

function onLoadingComplete() {
    //Действия по завершению загрузки графики
}
```

### Создание элемента из библиотеки
После завершения загрузки графики и файла FlashLibAssets.json нужно указать выполнить следующие действия:
1. Указать скрипту FlashFib загруженную библиотеку.  
Для того что бы это сделать нужно сделать примерно следующее (при условии что библиотека загружалась под именем FlashLibAssets:
```
var libraryData = PIXI.loader.resources['FlashLibAssets'].data;
FlashLib.addNewLibrary(libraryData);
```
2. Создать объект их библиотеки по имени.
Например если в библиотеке есть мувикслик с именем **game** то создание будет выглядеть так:
```
var item = FlashLib.createItemFromLibrary('game');
```
Если мувиклип в библиотеке лежит по пути например **characters/hero** то создание выглядит так:
```
var item = FlashLib.createItemFromLibrary('characters/hero');
```
После создания элемента из библиотеки его можно добавить на сцену или в любой объект в который можно добавить child.  
```
app.stage.addChild(item);
```
В зависимости от созданного элемента, он может быть таких типов:
1. FlashLib.MovieClip
2. FlashLib.TextField
3. PIXI.Image

### После изменения проекта Animate CC (.fla) нужно перезапустить скрипт jsfl для применения изменений

### Контакты
Telegram @rocket_ua