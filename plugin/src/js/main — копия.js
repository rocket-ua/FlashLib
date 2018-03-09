(function () {	
	var csInterface = new CSInterface();
	
	/*csInterface.addEventListener("com.adobe.events.flash.documentOpened", function($event) {
		var json = JSON.stringify($event, "", 4);
		alert(json);
		//alert("documentOpened");
	});*/
	csInterface.addEventListener("com.adobe.events.flash.documentChanged", function($event) {
		var json = JSON.stringify($event, "", 4);
		alert(json);
		alert("documentChanged");
	});
	/*csInterface.addEventListener("com.adobe.events.flash.documentClosed", function($event) {
		alert("documentClosed");
	});*/
	
	return;
	var extensionPath = csInterface.getSystemPath(SystemPath.EXTENSION);
	
    //Загрузить и выполнить JSFL файл
    function loadJSFLFile($path, $function, $data, $callback) {
        var jsflPath = extensionPath + $path;
        jsflPath = encodeURI( "file:///" + jsflPath );
		
		if($function && $data) {
			csInterface.evalScript('fl.runScript("' +jsflPath+ '", "' +$function+ '", '+ JSON.stringify($data) +')', $callback);
		} else if($function) {
			csInterface.evalScript('fl.runScript("' +jsflPath+ '", "' +$function+ '")', $callback);
		} else {
			csInterface.evalScript('fl.runScript("' +jsflPath+ '")', $callback);
		}
    }

	//выполнить код JSFL
    function executeJSFL(sScript) {
        csInterface.evalScript( sScript );
    }
	
	/*loadJSFLFile("/jsfl/StageToJSON.jsfl", null, null, function($data) {
		alert("JSFL result: " + $data);
	}.bind(this)); */
	
	//var openResult = cep.fs.showOpenDialog(false, true);
	//alert(openResult.data[0]);
	
	var pathToMapsConfigFile = null;
	var getPathToConfigFileBtn = document.getElementById("getPathToConfigFileBtn");
	getPathToConfigFileBtn.onclick = function() {
		pathToMapsConfigFile = cep.fs.showOpenDialog(false, false, "Select config file", null, ["json"]).data[0];
		document.getElementById("pathToMapsConfigFile").value = pathToMapsConfigFile;
	};
	
	var pathToSaveMaps = null;
	var getPathToMapsBtn = document.getElementById("getPathToMapsBtn");
	getPathToMapsBtn.onclick = function() {
		pathToSaveMaps = cep.fs.showOpenDialog(false, true).data[0];
		document.getElementById("pathToSaveMaps").value = pathToSaveMaps;
	};
	
	var getPathToBitmapsBtn = document.getElementById("getPathToBitmapsBtn");
	getPathToBitmapsBtn.onclick = function() {
		pathToSaveBitmaps = cep.fs.showOpenDialog(false, true).data[0] + "/";
		document.getElementById("pathToBitmaps").value = pathToSaveBitmaps;
	};
	
	var processBtn = document.getElementById("processBtn");
	processBtn.onclick = function() {
		executeJSFL("fl.outputPanel.clear();");
		
		if(document.getElementById("saveToFiles").checked || document.getElementById("traceResult").checked)
		{
			var path = "/jsfl/mapCreator/StageToJSON.jsfl";
			var settings = {};
			settings.path = extensionPath + path;
			settings.saveToFiles = document.getElementById("saveToFiles").checked;
			settings.traceResult = document.getElementById("traceResult").checked;
			settings.saveFilesPath = pathToSaveMaps;
			settings.saveFilesConfigPath = pathToMapsConfigFile;
			settings.saveTextsType = (function() {
				var radio = document.getElementsByName("saveTextsSettings");
				for(var i = 0; i < radio.length; i++) {
					if(radio[i].checked) {
						return radio[i].value;
					}
				}
				return null;
			}());
			
			loadJSFLFile(path, "start", settings);
		}
		
		
		if(document.getElementById("exportBitmaps").checked) {
			var path = "/jsfl/ExportImages.jsfl";
			var settings = {};
			settings.saveFilesPath = pathToSaveBitmaps;
			
			loadJSFLFile(path, "start", settings);
		}
	};
	
	var clearTraceBtn = document.getElementById("clearTraceBtn");
	clearTraceBtn.onclick = function() {
		executeJSFL("fl.outputPanel.clear();");
	}
}());

