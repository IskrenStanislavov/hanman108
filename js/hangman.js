require.config({
    baseUrl: './',
    paths: {
        PIXI: "../libs/pixi.min",
        // GSAP:"../node_modules/gsap/src/minified/TweenMax.min"
    }
});
define(function(require){
    require("PIXI");

    var Stage           = require("../libs/stage");
    var Loader          = require("libs/loader");

    var Hangman = function(){
        var arena = this;
        Stage.call(this, STAGE_INIT_DATA);
        zIndexes.forEach(function(elementId, index){
            var object = arena.addChild(PIXI.Sprite.fromFrame(resources[elementId]));
            object.position = positions[elementId];

            arena[elementId] = object;
            if (elementId !== "hanger"){
                object.visible = false;
            }
        });
    };
    Hangman.prototype = Object.create(Stage.prototype);
    Hangman.prototype.initArena = function(){

    };

    //CONFIG data
    var GAME_SIZE = {
        W:800,
        H:600
    };
    var STAGE_INIT_DATA = {//goes to new State(..)
        sizes: {
            width: GAME_SIZE.W,
            height: GAME_SIZE.H
        },
        contextMenu: false,
        stageColor: 0xfffFFF,
        canvasId: "game"
    };


    // following can be organized in ConfigObjects ordered by their zIndex
    var resources = {
        "neck"     : "images/neck.png",
        "hanger"   : "images/hanger.png",
        "head"     : "images/head.png",
        "torso"    : "images/torso.png",
        "hands"    : "images/hands.png",
        "legs"     : "images/legs.png",
    };
    var zIndexes = ["neck", "hanger", "head", "torso","hands","legs"];
    var positions = {
        "neck"  : new PIXI.Point(351, 240),
        "hanger": new PIXI.Point(53, 118),
        "head"  : new PIXI.Point(316, 210),
        "torso" : new PIXI.Point(307, 276),
        "hands" : new PIXI.Point(236, 260),
        "legs"  : new PIXI.Point(285, 333),
    };
    new Loader({
        resources: Object.values(resources),
        onComplete: function(){
            window.hangman = new Hangman();
        }
    });
});
