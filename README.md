# FlashLib
This tool is under development.
FlashLib is a tool to export a library from the Animate CC (.fla) project and build using PIXI.js.  
Example of use: https://github.com/rocket-ua/FlashLibExample
___
## Features
<li> Export MovieClip.
<li> Export Bitmap.
<li> Export TextField.
<li> Ability to create items from the .fla library by name.
<li> Build instance of custom classes when buildings item from library.

## How to use
For export resources and library use the command **flashlib**.  
In **package.json** you need to add a script:
```json
"scripts": {
    "openPattern": "flashlib --open ./assets/pattern.fla",
    "start": "flashlib"
}
```
The **open** flag allows you to specify the export script to which .fla project.  
If the flag is not specified, then it is applied to the current open project.  
You can use relative or absolute path.  

Then you need to run script for export library and resources from .fla.

#### FlashLibConfig.json file format
File with settings export resources and library.
It is created automatically when the script is first applied to the .fla file.
```json
{
    "basePath": "../dist/",
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
- flashLibName - library name.
- saveToFiles - save library to file.
- sayResultToConsole - output json library string to console.
- buildForSelected - export only selected items from the library.
  
**exportImages** - graphics export settings.
- flashLibName - library name.
- exportImages - export graphics.
- overrideExistingFiles - overwrite files, if they already exist.
  
**createAssetsList** - settings file resource download.
- libName - the name of the .fla file from which the resources were exported.
- saveToFile - save assets list to a file.
- sayResultToConsole - output json assets string to console.

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
let loginWindow = FlashLib.createItemFromLibrary('loginWindow', 'FlashLib');
this.app.stage.addChild(loginWindow);

let passwordTextImage = FlashLib.createItemFromLibrary('graphics/passwond_text.png', 'FlashLib');
this.app.stage.addChild(passwordTextImage);
```
**createItemFromLibrary**
<li> The first argument is the name and path to the item in the project's .fla library.
<li> The second argument is the name from which library the item should be created. (FlashLibConfig.json => libToJson.flashLibName)

## Result
### What was make in Animate CC and what makes in PIXI.js
<img src="https://images2.imgbox.com/8c/79/OxKyjCMV_o.png" height="200" />
<img src="https://images2.imgbox.com/c4/10/qoUkDy9d_o.png" height="200" />

### After changing the project in Animate CC (.fla), you need to restart the script to export the resources and the library.
___
## Additional features
FlashLib can create instances of custom classes when building item from library.  
In JS project you need to make class and register via ***FlashLib.registerClass***.  
In Animate CC you need to make MovieClip with structure what you need, and set linkage to 'CheckBox' (name what you use in ***FlashLib.registerClass***).  
```javascript
import FlashLib from 'flashlib';
export default class CheckBox extends FlashLib.MovieClip {
    constructor(data) {
        super(data);

        this.checked = false;

        this.init();
        this.addListeners();
    }

    init() {
        this.interactive = true;
        this.buttonMode = true;
    }

    addListeners() {
        this.on('click', this.onEvent, this);
    }

    onEvent($data) {
        switch ($data.type) {
            case 'click':
                this.onClick();
                break;
        }
    }

    onClick() {
        this.checked = !this.checked;
        this.goToFrame(this.checked ? 2 : 1);
    }
}
FlashLib.registerClass('CheckBox', CheckBox);
```  
When your MovieClip will building, FlashLib make instance of your class, and you functionality of your class will be works.  
You can look detail ho it's working in [example project](https://github.com/rocket-ua/FlashLibExample).

___
### Contacts
Telegram [@rocket_ua](https://t.me/rocket_ua)
