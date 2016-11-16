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
            // var start = wordPiece[0];
            // var end = wordPiece[wordPiece.length-1];
            return wordPiece.split("").map(function(char, i){
                if (i===0 ){
                    return char; 
                } else if (i == wordPiece.length-1){
                    return " "+char; 
                } else if (this.currentLetters.indexOf(char)!=-1){
                    return " "+char; 
                } else {
                    return " _";
                }
            }.bind(this)).join("");
            // return start + " _".repeat(wordPiece.length-2) + " " + end;
        }.bind(this)).join(" ");
        this.wordVisual.text = this.word;
        this.descriptionVisual.text = this.description;
    };

    Hangman.prototype.showWordAndDescription = function(){
        this.wordVisual.text = this.encode(this.decodedWord);
        this.descriptionVisual.text = this.wordPair.desc;
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

    Hangman.prototype.iterateStat = function(statName){
        console.log(statName);
        localStorage.setItem(statName, (parseInt(localStorage.getItem(statName, 0)) || 0) + 1);
    };

    Hangman.prototype.setState = function(newState){
        var oldState = this.state;
        this.state = newState;
        console.log("state cahnged from-to:", oldState, newState);
        //we might add a state-To-State check here
        switch(newState){
            case STATES.INIT:
                this.currentLetters = [];
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
                    this.showWordAndDescription();

                    setTimeout(function(){
                        this.setState(STATES.GUESSING);
                    }.bind(this), 0);
                }
            break;
            case STATES.GUESSING:
                var guess = prompt("Enter a letter or guess the whole word", "");//empty field
                if (guess.length == 1) {
                    var letter = guess[0];
                    if (this.decodedWord.indexOf(letter) >= 0){
                        if (this.currentLetters.indexOf(letter)== -1){
                            this.iterateStat("lettersGuessed");
                            this.currentLetters.push(letter);
                            this.showWordAndDescription();
                        }
                        setTimeout(function(){
                            if (this.wordVisual.text.indexOf("_") == -1){
                                this.setState(STATES.YOU_WIN);
                            } else {
                                this.setState(STATES.GUESSING);
                            }
                        }.bind(this), 0);
                    } else {
                        this.wrongLetter();
                        if (this.visibleBodyParts == bodyPartsSequence.length){
                            setTimeout(function(){
                                this.setState(STATES.GAME_OVER);
                            }.bind(this), 0);
                        } else {
                            setTimeout(function(){
                                this.setState(STATES.GUESSING);
                            }.bind(this), 0);
                        }
                    }
                } else if (guess  == "stats"){
                    this.setState(STATES.SHOW_STATS);
                } else {//check the word
                    if (guess.trim() === this.decodedWord){
                        this.iterateStat("wordsGuessedAtOnce");
                        setTimeout(function(){
                            this.setState(STATES.YOU_WIN);
                        }.bind(this), 0);
                    }else {
                        this.wrongWord();
                        setTimeout(function(){
                            this.setState(STATES.GAME_OVER);
                        }.bind(this), 0);

                    }
                }
            break;
            case STATES.YOU_WIN:
                this.iterateStat("gamesWON");
                if ("yes" === prompt("YOU WIN!\nDo you want to play again?", "yes").trim()){
                    this.setState(STATES.INIT);
                }
            break;
            case STATES.GAME_OVER:
                this.iterateStat("gamesLOST");
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
        
        YOU_WIN: "you_win",
        GAME_OVER: "game_over",

        SHOW_STATS: "show_stats",
    }
});
