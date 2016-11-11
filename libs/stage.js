define(function(require) {
    var PIXI        = require("PIXI");
    // require('../node_modules/zepto/zepto.min');

    var Stage = function( settings, onUpdateFunction ){
        this.renderer = PIXI.autoDetectRenderer(settings.sizes.width, settings.sizes.height, {
            "view":document.getElementById((settings && settings.canvasId) || "game"),
            "clearBeforeRender":false,
            "transparent": false,
            "resolution":1,
            "roundPixels": false,
            "antialias": false
        });
        this.canvas = this.renderer.view;
        document.body.appendChild(this.canvas);

        this.color = (settings && settings.stageColor) || "black";
        PIXI.Container.call(this);


        this.fittable = {
            W: settings.sizes.width,
            H: settings.sizes.height,
        };
        this.renderer.resize(this.fittable.W, this.fittable.H)

        if ( settings && settings.stageColor ) {// 0xBEDAFF
            this.addChild(new PIXI.Graphics())
                .beginFill(settings.stageColor,1.0)
                .drawRect(0,0,this.fittable.W, this.fittable.H)
                .endFill();
        }

        // this.autoFitListeners();
        if (onUpdateFunction){
            this.update = function(){
                this.resize();
                onUpdateFunction();
                this.renderer.render(this);
                requestAnimationFrame(this.update.bind(this));
            }.bind(this);
        }
        this.update();
        // this.disableContextMenu();
    };


    Stage.prototype = Object.create( PIXI.Container.prototype );

    Stage.prototype._getChildAt = Stage.prototype.getChildAt;

    Stage.prototype.getChildAt = function(index){
        if (index < 0){
            index += this.children.length;
        }
        return this._getChildAt(index);
    };

    Stage.prototype.update = function(){
        // this.resize();
        this.renderer.render(this);
        requestAnimationFrame(this.update.bind(this));
    };

    Stage.prototype.setAutoFit = function() {

    };

    //XXX: http://html5hub.com/screen-size-management-in-mobile-html5-games/

    Stage.prototype.disableContextMenu = function() {
        this.canvas.oncontextmenu = function (e) {
            e.preventDefault();
        };
    };
    // Stage.prototype.autoFitListeners = function() {
    //     var viewport = function() {
    //         window.scrollTo(0,1);
    //         this.resize();
    //     }.bind(this)
    //     document.onmousemove = document.ontouchmove = function(e) {
    //         e.preventDefault();
    //     };
    //     document.addEventListener("orientationchange", viewport);
    //     window.addEventListener('resize', viewport, true);
    // };

    // Stage.prototype.resize = function() {
    //     //we neeed the current; XXX: may store it n update it on orientation changes
    //     //XXX: can store the scale factors for both orientations
    //     //XXX: and change the chosen one on each orientation change
    //     var screenW = window.innerWidth
    //         || document.documentElement.clientWidth
    //         || document.body.clientWidth;

    //     var screenH = window.innerHeight
    //         || document.documentElement.clientHeight
    //         || document.body.clientHeight;

    //     var scaleH = screenH / this.fittable.H;

    //     //choose proper scale factor
    //     var scale = (screenW >= scaleH * this.fittable.W) ?
    //         scaleH : 
    //         (screenW / this.fittable.W);

    //     scale = Math.min(scale, 1);

    //     this.canvas.setStyle({
    //         "width": Math.floor(this.fittable.W * scale),
    //         "height": Math.floor(this.fittable.H * scale)
    //     });
    // };

    return Stage; 
});
