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
        Stage.call(this, STAGE_INIT_DATA);
        this.hangerContainer = this.addChild(new PIXI.Container());


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
        this.setState(STATES.INIT);
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
                object = arena.hangerContainer.addChild(PIXI.Sprite.fromFrame(resources[elementId]));
                object.position = positions[elementId];

                arena[elementId] = object;
            }
            if (elementId !== "hanger"){
                object.visible = false;
            }
        });
    };

    Hangman.prototype.encode = function(word){
        return word.split(' ').map(function(wordPiece){
            var start = wordPiece[0];
            var end = wordPiece[wordPiece.length-1];
            return start + " _".repeat(wordPiece.length-2) + " " + end;
        }).join(" ");
        this.wordVisual.text = this.word;
        this.descriptionVisual.text = this.description;
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

    Hangman.prototype.setState = function(newState){
        var oldState = this.state;
        this.state = newState;
        console.log("state cahnged from-to:", oldState, newState);
        //we might add a state-To-State check here
        switch(newState){
            case STATES.INIT:
                this.wordVisual.text = "";
                this.descriptionVisual.text = "";
                this.visibleBodyParts = 0;
                this.resetVisualBodyParts();
                setTimeout(function(){
                    // we need to call it on the next animationFrame
                    // in order to view the hanger image

                    this.setState(STATES.CATEGORY_SELECTION);
                }.bind(this), 0);
                break;
            case STATES.CATEGORY_SELECTION:
                this.categoryChosen = categories[
                    prompt("Please pick a category to play with: " + Object.keys(categories).join(', ')
                        //randomize a choice for the user
                        , Object.keys(categories)[Math.floor(Math.random() * Object.keys(categories).length)]
                    )
                ];
                if (!this.categoryChosen){//repeat if no such cathegory
                    this.setState(STATES.CATEGORY_SELECTION);
                } else {
                    this.wordPair = this.categoryChosen[Math.floor(Math.random() * this.categoryChosen.length)];
                    console.log(this.wordPair); 
                    this.decodedWord = this.wordPair.word;
                    this.word = this.encode(this.decodedWord);
                    this.description = this.wordPair.desc;
                    this.showWordAndDescription();

                    setTimeout(function(){
                        this.setState(STATES.GUESSING);
                    }.bind(this), 0);
                }
                break;
            case STATES.GUESSING:
                this.guess = prompt("Enter a letter or guess the whole word", "");//empty field
                if (this.guess.length == 1){
                    this.checkLetter(this.guess[0]);
                } else if (this.guess  == "stats"){
                    this.setState(STATES.SHOW_STATS);
                } else {//check the word
                    if (this.guess.trim() === this.decodedWord){
                        localStorage.setItem("wordsGuessedAtOnce", (parseInt(localStorage.getItem("wordsGuessedAtOnce", 0)) || 0) + 1);
                        this.setState(STATES.YOU_WIN);
                        console.log(localStorage);
                    }else {
                        // localStorage.setItem("wrongWords", (parseInt(localStorage.getItem("wrongWords", 0)) || 0) + 1);
                        this.setState(STATES.GAME_OVER);
                        console.log(localStorage);
                    }
                }

            case STATES.WRONG_LETTER: break;
            case STATES.CORRECT_LETTER: break;
            
            case STATES.YOU_WIN:
                localStorage.setItem("gamesWON", (parseInt(localStorage.getItem("gamesWON", 0)) || 0) + 1);
                if ("yes" === prompt("YOU WIN!\nDo you want to play again?", "yes").trim()){
                    this.setState(STATES.INIT);
                }
            break;
            case STATES.GAME_OVER:
                localStorage.setItem("gamesLOST", (parseInt(localStorage.getItem("gamesLOST", 0)) || 0) + 1);
                if ("yes" === prompt("YOU LOST!\nDo you want to play again?", "yes").trim()){
                    this.setState(STATES.INIT);
                }
            break;

            case STATES.SHOW_STATS:
                console.log(localStorage);
                setTimeout(function(){
                    this.setState(STATES.GUESSING);
                }.bind(this), 0);
               break; 

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
    var STATES = {
        INIT: "init",
        CATEGORY_SELECTION: "category",
        GUESSING: "guessing",
        // CHECKS: "checks",
        WRONG_LETTER: "wrong_letter",
        CORRECT_LETTER: "correct_letter",
        
        YOU_WIN: "you_win",
        GAME_OVER: "game_over",

        SHOW_STATS: "show_stats",
    }
});
