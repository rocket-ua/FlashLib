# FlashLib
This tool is under development.
FlashLib is a tool to export a library from the Animate CC project and build using PIXI.js.
Example of use: https://github.com/rocket-ua/FlashLibExample

## Features
<li> Export MovieClip.
<li> Export Bitmap.
<li> Export TextField.
<li> Ability to create items from the .fla library by name.

## How to use
For export resources and library use the command **flashlib**.
In **package.json** you need to add a script:
```json
"scripts": {
    "openPattern": "flashlib --open /Users/username/Projects/FlashLibExample/assets/pattern.fla",
    "start": "flashlib"
}
```
The **open** flag allows you to specify the export script to which .fla project. If the flag is not specified, then it is applied to the current open project.

Then you need to run script for export library and resources from .fla.

#### FlashLibConfig.json file format
File with settings export resources and library.
It is created automatically when the script is first applied to the .fla file.
```json
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
**basePath** - folder path to export the project. Need to change to the required. By default, it is exported to the folder where the .fla file is located.
**libToJson** - library export settings
<li> flashLibName - library name.
<li> saveToFiles - save library to file.
<li> sayResultToConsole - output json library string to console.
<li> buildForSelected - export only selected items from the library.
  
**exportImages** - graphics export settings.
<li> flashLibName - library name.
<li> exportImages - export graphics.
<li> overrideExistingFiles - overwrite files, if they already exist.
  
**createAssetsList** - settings file resource download.
<li> libName - the name of the .fla file from which the resources were exported.
<li> saveToFile - save assets list to a file.
<li> sayResultToConsole - output json assets string to console.

### Loading resources and creating items
#### To load the library and resources, you need to load the file FlashLibAssets.json from the folder where the project was exported (basePath)
After exporting the resources and the library, you need to load the FlashLibAssets.json file using PIXI.js
```javascript
function loadAssets() {
    PIXI.loader.add('FlashLibAssets', 'FlashLibAssets.json', 'json');
    PIXI.loader.once('complete', onLoadingComplete, this);
    PIXI.loader.load();
}

function onLoadingComplete() {
    //ALl resources for FlashLib is loaded. 
    //You can create items from FlashLib.
}
```

Import FlashLib.
```javascript
import FlashLib from 'flashlib';
```

Create an object from the library by name.
```javascript
let game = FlashLib.createItemFromLibrary('game', 'FlashLib');
let heroImage = FlashLib.createItemFromLibrary('characters/hero', 'FlashLib');

app.stage.addChild(game);
app.stage.addChild(heroImage);
```
**createItemFromLibrary**
<li> The first argument is the name and path to the item in the project's .fla library.
<li> The second argument is the name from which library the item should be created. (FlashLibConfig.json => libToJson.flashLibName)

### After changing the project in Animate CC (.fla), you need to restart the script to export the resources and the library.

### Contacts
Telegram @rocket_ua
