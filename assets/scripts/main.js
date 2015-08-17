// Created by sam mok 2015(Siso brand interactive team).

"use strict";

var app = {
    sprites: [],

    paper: {
        canvas: {
            dom: null,
            width: 0,
            height: 0
        },

        ctx: null
    },

    preload: function (){
        var that = this;
        var Canvas = document.getElementById('scene');
        var ctx = Canvas.getContext('2d');

        windowResizeHandler();

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
            //  init canvas size
            Canvas.width = document.body.clientWidth;
            Canvas.height = document.body.clientHeight;
            Canvas.style.width = document.body.clientWidth + 'px';
            Canvas.style.height = document.body.clientHeight + 'px';

            //  init paper info
            that.paper.ctx = ctx;
            that.paper.canvas.dom = Canvas;
            that.paper.canvas.width = Canvas.width;
            that.paper.canvas.height = Canvas.height;
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
        that.playFrames(that.sceneSpriteGroup[that.curIndex][0], that.sceneSpriteGroup[that.curIndex][1]);


        //  bind controller
        var canvasDom = new Hammer(that.paper.canvas.dom);
        //canvasDom.on('swipeleft', prevSceneHandler);
        canvasDom.on('swipeleft', nextSceneHandler);

        canvasDom.on('swiperight', prevSceneHandler);

        document.getElementById('prev').onclick = prevSceneHandler;

        document.getElementById('next').onclick = nextSceneHandler;

        //  bind touch event
        var touchStartPoint = 0;

        that.paper.canvas.dom.addEventListener('touchstart', setTouchStartPoint);

        that.paper.canvas.dom.addEventListener('touchmove', setCurrentFrame);

        //  play BGM immediately
        var initSound = function () {
            //  delay play
            document.getElementById('audio').play();

            document.removeEventListener('touchstart', initSound, false);
        };
        document.addEventListener('touchstart', initSound, false);

        function prevSceneHandler () {
            //  stop prev frames drawer
            clearTimeout(that.playTimer);

            that.direct = "backward";

            //  check is the currentFrame is the first frame of the current scene.
            for (var i = 0; i < that.sceneSpriteGroup.length; i++) {
                var sceneSpritesFirstFrame = that.sceneSpriteGroup[i][0];

                if (that.curFrameIndex == sceneSpritesFirstFrame) {
                    that.curIndex - 1 < 0 ? that.curIndex = that.sceneSpriteGroup.length - 1 : that.curIndex -= 1;

                    var startFrameIndex = that.sceneSpriteGroup[that.curIndex][1];
                    var endFrameIndex = that.sceneSpriteGroup[that.curIndex][0];

                    that.playFrames(startFrameIndex, endFrameIndex);
                    return null;
                }
            }

            that.playFrames(that.curFrameIndex, that.sceneSpriteGroup[that.curIndex][0]);
            return null;
        }

        function nextSceneHandler () {
            //  stop prev frames drawer
            clearTimeout(that.playTimer);

            that.direct = "forward";

            //  check is the currentFrame is the last frame of the current scene.
            for (var i = 0; i < that.sceneSpriteGroup.length; i++) {
                var sceneSpritesLastFrame = that.sceneSpriteGroup[i][1];

                if (that.curFrameIndex == sceneSpritesLastFrame) {
                    that.curIndex + 1 == that.sceneSpriteGroup.length ? that.curIndex = 0 : that.curIndex += 1;

                    var startFrameIndex = that.sceneSpriteGroup[that.curIndex][0];
                    var endFrameIndex = that.sceneSpriteGroup[that.curIndex][1];

                    that.playFrames(startFrameIndex, endFrameIndex);
                    return null;
                }
            }

            that.playFrames(that.curFrameIndex, that.sceneSpriteGroup[that.curIndex][1]);
            return null;
        }

        function setTouchStartPoint(e) {
            touchStartPoint = e.touches[0].pageX;
        }

        function setCurrentFrame (e) {
            var curPoint = e.touches[0].pageX;
            var distance = 1;

            var startFrame = that.sceneSpriteGroup[that.curIndex][0];
            var endFrame = that.sceneSpriteGroup[that.curIndex][1];

            //  calculate next frame index
            if (curPoint < touchStartPoint) {
                that.curFrameIndex -= distance;
                that.curFrameIndex < startFrame ? that.curFrameIndex = startFrame : that.curFrameIndex;
            } else {
                that.curFrameIndex += distance;
                that.curFrameIndex > endFrame ? that.curFrameIndex = endFrame : that.curFrameIndex;
            }

            //  draw next frame
            that.draw(that.curFrameIndex);
        }
    },

    curIndex: 0,

    curFrameIndex : 1,

    playFrames: function (curFrameIndex, endFrameIndex) {
        /**
         * Play current scene's sprite frames
         * @param {Number} curFrameIndex
         * @param {Number} endFrameIndex
         * @return {Null} null
         */
        var that = this;
        var ctx = that.paper.ctx;

        //  draw sprite
        drawSprite(curFrameIndex, endFrameIndex);

        //  recursive to draw sprites
        function drawSprite(curFrameIndex, endFrameIndex) {
            that.curFrameIndex = curFrameIndex;

            //  check whether currentFrame is the last frame of the current scene.
            if (curFrameIndex == endFrameIndex) {
                that.draw(curFrameIndex);

            } else {
                that.draw(curFrameIndex);

                // draw next frame
                that.playTimer = setTimeout(function () {
                    //  draw direction
                    that.direct == "forward" ? drawSprite(parseInt(curFrameIndex)+1, endFrameIndex) : drawSprite(parseInt(curFrameIndex)-1, endFrameIndex);
                }, 1000/20);
            }
        }

        return null;
    },

    draw: function (frameIndex) {
        /**
         * Draw frame into canvas
         * @param {Number} frameIndex  the index of frame you want to draw into canvas
         * */
        var that = this;
        var img = that.sprites[frameIndex];
        var ctx = that.paper.ctx;

        if (img) {
            //  clear paper
            ctx.clearRect(0, 0, that.paper.canvas.width, that.paper.canvas.height);

            //  draw image
            ctx.drawImage(img, 0, that.paper.canvas.height*0.156, that.paper.canvas.width, that.paper.canvas.height*0.721);
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

window.onload = function () {
    // init app
    app.start();
};