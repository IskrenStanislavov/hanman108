define(function(require){
    var PIXI        = require("PIXI");

    var CustomLoader = function(data){
        // PIXI.loaders.Loader.apply(this);
        // this.onComplete = ;
        // this.load(data.onComplete);
        // console.log("in loader");
        var loader = new PIXI.loaders.Loader(); // you can also create your own if you want
        // loader.on("progress", function(){
        // 	console.log(arguments);
        // });
        loader.on("error", function(){
        	console.error(arguments);
        });
        // loader.on("load", function(){
        // 	console.info("loaded:",arguments);
        // });

        data.resources.forEach(function(name) {
        	loader.add(name, name);
        });
        loader.load(data.onComplete);
    };

    // CustomLoader.prototype = Object.create(PIXI.loaders.Loader.prototype);
    return CustomLoader;
});
