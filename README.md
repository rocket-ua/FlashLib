
___ 
### Important
#### If you update FlashLib from less than 2.1.x, you need to reexport your .fla files and change import format FlashLib components.  
#### New format of imports see in this doc.
___  
# FlashLib
This tool is under development.
FlashLib is a tool to export a library from the Animate CC (.fla) project and build using PIXI.js.  
FlashLib will develop for increase speed of implement assets into game, and fast rebuild projects from Flash to HTML5 and PIXI.js framework.  
Using this library you can completely build all assets for project or you can build some parts.  
FlashLib has excellent integration with existing project used PIXI.js, and you can add some parts makes with FlashLib into your existing project.  
[Example of using](https://github.com/rocket-ua/FlashLibExample)  
[Example preview](https://rocket-ua.github.io/FlashLibExample/dist/)  
Don't forget write issues or proposal :)  

## Features
* Export MovieClip.
* Export Bitmap.
* Export TextField.
* Export Shapes.
* Ability to create items from the .fla library by name.
* Build instance of custom classes when buildings item from library.

### Detail
* Exported data
    - Items positions.
    - Items scale.
    - Items skew.
    - Items rotation.
    - Color Effect Alpha.
    - Blend modes (which supported in PIXI.js).
    - Transform point.
* MovieClip
    - Export all layers and frames.
    - Don't supported any animations (you can use only frame-by-frame animation) (Adding another in progress).
    - All included MovieClips will be build recursively.
    - You can work with children of MovieClip like in PIXI.Container.
    - You can use mask layers (first screenshot from Adobe Animate CC, second - from PIXI.js project).  
    <img src="https://images2.imgbox.com/de/a8/PSTyDtyT_o.png" height="200" />
    <img src="https://images2.imgbox.com/55/35/kokmdZmr_o.png" height="200" />
* Bitmap
    - Bitmaps can be exported from Adobe Animate CC and then can be used into project.
    - All exported bitmaps can be compiled into spritesheets.
* Shapes
    - Now supported only simple shapes (rectangles without holes).
    - You can use solid color fill or bitmap fill for Shapes.
    - You can crop some parts of shape (screenshot from PIXI.js project).  
    <img src="https://images2.imgbox.com/f0/80/XiziDl3O_o.png" height=200>
* TextField
    - You can use different fonts in TextFields.
    - Supported text alignment, text color, font size, line spacing, tracking amount,  
    behavior (single line, multiline, multiline no wrap).  

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
        "addExtensions": false,
        "usePng": true
    },
    "createAssetsList": {
        "libName": "pattern.fla",
        "saveToFile": true,
        "sayResultToConsole": false,
        "usePng": true,
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
- addExtensions - add extension for files on export.
- usePng - always export images as PNG.
  
**createAssetsList** - settings file resource download.
- libName - the name of the .fla file from which the resources were exported.
- saveToFile - save assets list to a file.
- sayResultToConsole - output json assets string to console.
- usePng - always add exported images as PNG.

### Loading resources and creating items
#### To load the library and resources, you need to load the file FlashLibAssets.json from the folder where the project was exported (basePath)
After exporting the resources and the library, you need to load the FlashLibAssets.json file using PIXI.js
```javascript
function loadAssets() {
    PIXI.loader.add('FlashLibAssets', 'FlashLibAssets.json', 'json');
    PIXI.loader.onComplete.once(onLoadingComplete, this);
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
This create your object from library and all included objects.
**createItemFromLibrary**
<li> The first argument is the name and path to the item in the project's .fla library.
<li> The second argument is the name from which library the item should be created. (FlashLibConfig.json => libToJson.flashLibName).
You can add several exported libraries in one time, and create items from this items using library name.

## Result
### What was make in Animate CC and what makes in PIXI.js  
<img src="https://images2.imgbox.com/8c/79/OxKyjCMV_o.png" height="200" />
<img src="https://images2.imgbox.com/c4/10/qoUkDy9d_o.png" height="200" />  

### After changing the project in Animate CC (.fla), you need to restart the script to export the resources and the library.
___
## Additional features
FlashLib can create instances of custom classes when building item from library.  
In JS project you need to make class what you want to linkage to Animate CC item.  

### Example how import FlashLib components for using in custom sprites.
```javascript
import * as FlashLib from 'flashlib';

FlashLib.MovieClip
FlashLib.Bitmap
FlashLib.TextField
FlashLib.Shape
```  
or  
```javascript
import { MovieClip, Bitmap, TextField, Shape } from 'flashlib';
```  
### Example how to create simple checkbox class and link with exported MovieClip.
```javascript
//CheckBox.js
import { MovieClip } from 'flashlib';

export default class CheckBox extends MovieClip {
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
```  
Than you need to import you classes and add do FlashLib and register via ***FlashLib.registerClass***, like this:

```javascript
//import.js
import FlashLib from "flashlib";
import Button from './Button';
import CheckBox from './CheckBox';

FlashLib.registerClass('Button', Button);
FlashLib.registerClass('CheckBox', CheckBox);
```
In Animate CC you need to make MovieClip with structure what you need and set linkage to 'CheckBox' (name what you use in ***FlashLib.registerClass***).

<img src="https://images2.imgbox.com/dd/f6/TAnRBeLj_o.png" height="200" />

When your MovieClip will building, FlashLib make instance of your class, and you functionality of your class will be works.  
You can look detail ho it's working in [example project](https://github.com/rocket-ua/FlashLibExample).  

### Default classes
You can change classes which FlashLib using by default.  
When default classes will be changed, FlashLib will use new classes for creating all items (except items with linked classes).  
For example: this can be comfortable to use if you need localization for TextFields.   
You can create custom class extended from FlashLib TextField and change default class.
All text fields will be created with your class and logic.
```javascript
FlashLib.setDefaultClass('TextField', LocalizationTextField);
```
___
### Contacts
Telegram [@rocket_ua](https://t.me/rocket_ua)
