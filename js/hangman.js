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
    var categories      = require("js/categories");

    var Hangman = function(){
        this.visibleBodyParts = 0;
        Stage.call(this, STAGE_INIT_DATA);
        this.resetVisualBodyParts();

        var categoryChosen = categories[prompt("Please pick a category to play with: " + Object.keys(categories).join(', ') 
            , Object.keys(categories)[Math.floor(Math.random() * Object.keys(categories).length)]
        )];
        this.wordPair = categoryChosen[Math.floor(Math.random() * categoryChosen.length)];

        this.textContainer = this.addChild(new PIXI.Container());
        this.wordVisual = this.textContainer.addChild(new PIXI.Text(
            "Here is the word",
            {fontFamily : 'Verdana', fontSize: 24, fill : 0x010010, align : 'left', }
        ));
        this.wordVisual.anchor.set(0.5, 0);
        this.wordVisual.position.set(351, 469);
        this.descriptionVisual = this.textContainer.addChild(new PIXI.Text(
            'This is the description',
            {fontFamily : 'Verdana', fontSize: 24, fill : 0x001010, align : 'left', wordWrap: true, wordWrapWidth: 476 }
        ));
        this.descriptionVisual.position.set(149, 509);
console.log(this.wordPair); 
        this.word = this.wordPair.word;
        this.description = this.wordPair.desc;
        this.showWordAndDescription();

    };

    Hangman.prototype = Object.create(Stage.prototype);
    Hangman.prototype.resetVisualBodyParts = function(){
        // we can either keep them and hide them or remove them and create them on showing
        var arena = this;
        zIndexes.forEach(function(elementId, index){
            var object;
            if (arena.hasOwnProperty(elementId)){
                object = arena[elementId];
            } else {
                object = arena.addChild(PIXI.Sprite.fromFrame(resources[elementId]));
                object.position = positions[elementId];

                arena[elementId] = object;
            }
            if (elementId !== "hanger"){
                object.visible = false;
            }
        });
    };

    Hangman.prototype.showWordAndDescription = function(){
        this.wordVisual.text = this.word;
        this.descriptionVisual.text = this.description;
    };

    Hangman.prototype.wrongWord = function(){
        //total loss state
        zIndexes.forEach(function(elementId, index){
            this[elementId].visible = true;
        }.bind(this));

    };

    Hangman.prototype.wrongLetter = function(){
        if (this.visibleBodyParts < bodyPartsSequence.length){
            this[bodyPartsSequence[this.visibleBodyParts]].visible = true;
            this.visibleBodyParts++;
        }
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
    var bodyPartsSequence = zIndexes.filter(function(elementId){
        return elementId !== "hanger";
    });//["neck", /*"hanger"*/, "head", "torso","hands","legs"];
    var positions = {
        "neck"  : new PIXI.Point(351, 240),
        "hanger": new PIXI.Point(53, 118),
        "head"  : new PIXI.Point(316, 210),
        "torso" : new PIXI.Point(307, 276),
        "hands" : new PIXI.Point(236, 260),
        "legs"  : new PIXI.Point(285, 333),
    };
    // data taken partly from https://codepen.io/cathydutton/pen/ldazc

    new Loader({
        resources: Object.values(resources),
        onComplete: function(){
            window.hangman = new Hangman();
        }
    });
});
