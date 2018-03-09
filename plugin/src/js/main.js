(function () {	
	var csInterface = new CSInterface();
	
	/*csInterface.addEventListener("com.adobe.events.flash.documentOpened", function($event) {
		var json = JSON.stringify($event, "", 4);
		alert(json);
		//alert("documentOpened");
	});*/
	/*csInterface.addEventListener("com.adobe.events.flash.documentChanged", function($event) {
		var json = JSON.stringify($event, "", 4);
		alert(json);
		alert("documentChanged");
	});*/
	/*csInterface.addEventListener("com.adobe.events.flash.documentClosed", function($event) {
		alert("documentClosed");
	});*/
	
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
	
	var processBtn = document.getElementById("processBtn");
	processBtn.onclick = function() {
		var path = "/jsfl/FlashLib.jsfl";
		loadJSFLFile(path, "FlashLib", { basePath: encodeURI( "file:///" + extensionPath + '/jsfl/') }, function() {});
	};
	
	var clearTraceBtn = document.getElementById("clearTraceBtn");
	clearTraceBtn.onclick = function() {
		executeJSFL("fl.outputPanel.clear();");
	};
}());

