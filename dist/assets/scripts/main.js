// Created by sam mok 2015(Siso brand interactive team).

"use strict";

var app = {
    sprites: [],

    paper: {
        canvas: {
            width: 0,
            height: 0
        },

        ctx: null
    },

    preload: function (){
        var that = this;
        var Canvas = document.getElementById('scene');
        var ctx = Canvas.getContext('2d');

        //  init canvas size
        Canvas.width = document.body.clientWidth;
        Canvas.height = document.body.clientHeight;
        Canvas.style.width = document.body.clientWidth + 'px';
        Canvas.style.height = document.body.clientHeight + 'px';
        Canvas.style.background = '#e0eae2';

        //  init paper info
        this.paper.ctx = ctx;
        this.paper.canvas.width = Canvas.width;
        this.paper.canvas.height = Canvas.height;

        //  set images generator
        var imgPath = "assets/images/";
        //  img amounts, use the amounts order to general image objects
        var imgAmounts = 212;
        var loadedAmounts = 0;
        var isLoaded = false;

        //  bind window resize handler
        document.body.onresize = windowResizeHandler;

        for (var i = 1; i <= imgAmounts; i++) {
            var img = new Image();
            img.src = imgPath + 'final-3_xulie_' + this.utils.fixZero(i) + '.jpg';
            img.index = i;

            img.onload = function () {
                loadedAmounts++;

                //  add to sprites
                that.sprites[this.index] = this;

                /* check img load progress */
                if (checkIsAllLoaded() && isLoaded == false) {
                    var runningTimerEnd = new Date();
                    isLoaded = true;

                    console.log('images loader end..');
                    app.create();
                }
            };

            img.onerror = function (error) {
                imgAmounts -= 1;

                /* check img load progress */
                if (checkIsAllLoaded() && isLoaded == false) {
                    var runningTimerEnd = new Date();
                    isLoaded = true;

                    console.log('images loader end..');
                    app.create();
                }
            };
        }

        function checkIsAllLoaded () {
            var loadedRate = 0.8;
            return loadedAmounts / imgAmounts >= loadedRate;
        }

        function windowResizeHandler () {

        }
    },

    create: function (){
        var that = this;
        console.log('app created success...');

        //  sprite indexes for each scene
        that.sceneSpriteGroup = [
            [1, 37],
            [38, 77],
            [78, 118],
            [119, 184],
            [185, 212]
        ];

        //  play frames with scene sprites indexes
        that.curIndex = 0;
        that.direct = 'forward';
        that.playFrames(that.sceneSpriteGroup[that.curIndex]);

        //  bind controller
        document.getElementById('prev').onclick = function () {
            //  stop prev frames drawer
            clearTimeout(that.playTimer);

            // play the current frames forward,
            // then set current index to the prev scene's index in the playFrames method
            that.direct = "backward";
            that.playFrames(that.sceneSpriteGroup[that.curIndex]);
        };

        document.getElementById('next').onclick = function () {
            //  stop prev frames drawer
            clearTimeout(that.playTimer);
            that.direct = "forward";

            //  is current scene index is the last scene
            that.curIndex + 1  == that.sceneSpriteGroup.length ? that.curIndex = 0 : that.curIndex;
            that.playFrames(that.sceneSpriteGroup[++that.curIndex]);
        };

        //  play BGM immediately
        var initSound = function () {
            //  delay play
            $('#audio')[0].play();

            document.removeEventListener('touchstart', initSound, false);
        };
        document.addEventListener('touchstart', initSound, false);
    },

    curIndex: 0,

    direct: 1,

    playFrames: function (sceneSpritesIndexes) {
        var that = this;
        var ctx = this.paper.ctx;

        //  draw sprite
        //  if direct == "forward", the frame play direction is forward,
        //  if direct == "backward", the frame play direction is backward
        var startFrameIndex = that.direct == "forward" ? sceneSpritesIndexes[0] : sceneSpritesIndexes[1];
        var endFrameIndex = that.direct == "forward" ? sceneSpritesIndexes[1] : sceneSpritesIndexes[0];
        drawSprite(startFrameIndex, endFrameIndex);

        //  recursive to draw sprites
        function drawSprite(curFrameIndex, endFrameIndex) {
            ctx.clearRect(0, 0, that.paper.canvas.width, that.paper.canvas.height);

            //  if current frame is the last frame
            if (curFrameIndex == endFrameIndex) {
                draw(curFrameIndex);

                //  if this draw direction is backward, when the draw process end,
                //  decrease the current index
                if (that.direct == "backward") {
                    that.curIndex-1 < 0 ? that.curIndex = that.sceneSpriteGroup.length-1 : that.curIndex--;
                }
            } else {
                draw(curFrameIndex);

                // draw next frame
                that.playTimer = setTimeout(function () {
                    that.direct == "forward" ? drawSprite(curFrameIndex+1, endFrameIndex) : drawSprite(curFrameIndex-1, endFrameIndex);
                }, 1000/20);
            }
        }

        //  draw sprite into canvas
        function draw(frameIndex) {
            var img = that.sprites[frameIndex];

            if (img) {
                ctx.drawImage(img, 0, 0, that.paper.canvas.width, that.paper.canvas.height);
            }
        }
    },

    utils: {
        fixZero: function (num) {
            return num < 10 ? '0' + num : num;
        }
    },

    start: function (){
        this.preload();
    }
};

$(function (){
    // init app
    app.start();
});