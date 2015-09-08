// Created by sam mok 2015(Siso brand interactive team).

"use strict";

var app = {
    sprites: [],

    fixedSprites: [],

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

        //  set images generator
        var imgPath = "assets/images/";
        //  img amounts, use the amounts order to general image objects
        var imgAmounts = 212;
        var loadedAmounts = 0;
        var isLoaded = false;

        //  load fixed scene frames
        for (var i = 1; i <= 45; i++) {
            var img = new Image();
            img.src = imgPath + 'f_' + that.utils.fixZero(i) + '.png';

            img.index = i;

            img.onload = function () {
                that.fixedSprites[this.index] = this;
            }
        }

        //  load scene frames
        for (var i = 0; i <= imgAmounts; i++) {
            var img = new Image();
            img.src = imgPath + 'final_1080_1707_' + this.utils.fixZero(i) + '.jpg';
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
                    setTimeout(function () {
                        app.create();
                    }, 300);
                }
            };

            img.onerror = function (error) {
                imgAmounts -= 1;

                /* check img load progress */
                if (checkIsAllLoaded() && isLoaded == false) {
                    var runningTimerEnd = new Date();
                    isLoaded = true;

                    console.log('images loader end..');
                    setTimeout(function () {
                        app.create();
                    }, 300);
                }
            };
        }

        function checkIsAllLoaded () {
            var loadedRate = 1;
            return loadedAmounts / imgAmounts >= loadedRate;
        }

        //  get widthRatio and heightRatio
        var bg = new Image();
        bg.src = 'assets/images/final_1080_1707_bg.jpg';

        //  init paper info
        that.paper.ctx = ctx;
        that.paper.canvas.dom = Canvas;
        that.paper.canvas.width = Canvas.width;
        that.paper.canvas.height = Canvas.height;
    },

    create: function () {
        var that = this;
        console.log('app created success...');

        //  sprite indexes for each scene
        that.sceneSpriteGroup = [
            [1, 37],
            [38, 77],
            [78, 118],
            [119, 186],
            [187, 212]
        ];

        //  sprite indexes for each scene's fixed animation
        that.fixedSpriteGroup = [
            [1, 10],
            [11, 20],
            [21, 43],
            [44, 45]
        ];

        that.curIndex = 0;
        that.direct = 'forward';
        var paraTimer = null;

        //  play first scene
        that.playFrames(that.sceneSpriteGroup[that.curIndex][0], that.sceneSpriteGroup[that.curIndex][1]);

        //  show para
        showPara(that.curIndex);

        //  bind swipe event
        var touchArea = document.getElementById('scene-touch-area');
        var swiper = new Hammer(touchArea);
        swiper.on('swipeleft', nextSceneHandler);
        swiper.on('swiperight', prevSceneHandler);

        document.getElementById('prev').onclick = prevSceneHandler;

        document.getElementById('next').onclick = nextSceneHandler;

        //  touch event
        var touchStartX = 0;

        //  check whether tablet or smart phone
        var minMove = that.paper.canvas.width >= 600 ? 1 : 3;

        //touchArea.addEventListener('touchstart', setTouchStartPoint, false);
        //touchArea.addEventListener('touchmove', setCurrentFrame, false);


        //  play BGM immediately
        var initSound = function () {
            //  delay play
            document.getElementById('audio').play();

            document.removeEventListener('touchstart', initSound, false);
        };
        document.addEventListener('touchstart', initSound, false);
        console.log(that.curIndex);

        function prevSceneHandler() {
            if (that.isPlaying == false) {
                //  stop prev frames drawer
                clearTimeout(that.playTimer);

                that.direct = "backward";

                var isTheFirstFrame = that.curFrameIndex == that.sceneSpriteGroup[that.curIndex][0];

                if (isTheFirstFrame) {
                    //  decrease the current scene index
                    that.curIndex - 1 < 0 ? that.curIndex = that.sceneSpriteGroup.length - 1 : that.curIndex -= 1;

                    that.playFrames(that.sceneSpriteGroup[that.curIndex][1], that.sceneSpriteGroup[that.curIndex][0]);
                } else {
                    that.playFrames(that.sceneSpriteGroup[that.curIndex][1], that.sceneSpriteGroup[that.curIndex][0]);
                }

                showPara(that.curIndex-1 < 0 ? that.sceneSpriteGroup.length-1 : that.curIndex-1);
            }
        }

        function nextSceneHandler() {
            if (that.isPlaying == false) {
                //  stop prev frames drawer
                clearTimeout(that.playTimer);

                that.direct = "forward";
                that.isPlaying = true;

                var isTheFirstFrame = that.curFrameIndex == that.sceneSpriteGroup[that.curIndex][0];

                if (isTheFirstFrame) {
                    that.playFrames(that.sceneSpriteGroup[that.curIndex][0], that.sceneSpriteGroup[that.curIndex][1]);
                } else {
                    that.curIndex + 1 == that.sceneSpriteGroup.length ? that.curIndex = 0 : that.curIndex += 1;
                    that.playFrames(that.sceneSpriteGroup[that.curIndex][0], that.sceneSpriteGroup[that.curIndex][1]);
                }

                showPara(that.curIndex);
            }
        }

        function setTouchStartPoint(e) {
            touchStartX = parseInt(e.touches[0].pageX);
        }

        function setCurrentFrame(e) {
            if (that.isPlaying == false) {
                //  get current touch position
                var curX = parseInt(e.touches[0].pageX);
                var movedX = curX - touchStartX;

                var startFrame = that.sceneSpriteGroup[that.curIndex][0];
                var endFrame = that.sceneSpriteGroup[that.curIndex][1];

                //  calculate the next frame's index to draw
                //  if the drag direction is "forward"
                if (movedX < -minMove) {
                    that.curFrameIndex += 1;

                    if (that.curFrameIndex > endFrame) {
                        that.curIndex + 1 == that.sceneSpriteGroup.length ? that.curIndex = 0 : that.curIndex += 1;
                        that.curFrameIndex = that.sceneSpriteGroup[that.curIndex][0];
                    } else {
                    }
                } else if (movedX > minMove) {
                    that.curFrameIndex -= 1;

                    if (that.curFrameIndex < startFrame) {
                        that.curIndex - 1 < 0 ? that.curIndex = that.sceneSpriteGroup.length - 1 : that.curIndex -= 1;
                        that.curFrameIndex = that.sceneSpriteGroup[that.curIndex][1];
                    } else {
                    }
                } else {
                }

                //  draw next frame
                that.draw(that.curFrameIndex);
                touchStartX = curX;
            } else {

            }
        }

        //  show para
        function showPara(index) {
            clearTimeout(paraTimer);

            var paraArr = document.getElementsByClassName('para');

            //  remove all para's active statue
            for (var i = 0; i < paraArr.length; i++) {
                paraArr[i].className = paraArr[i].className.replace(' active', '');
            }

            //  show para
            paraTimer = setTimeout(function () {
                //  ignore the last scene
                if (index < that.sceneSpriteGroup.length - 1 && index >= 0) {
                    document.getElementsByClassName('para0' + (index + 1))[0].className = document.getElementsByClassName('para0' + (index + 1))[0].className + ' active';
                }
            }, 600);
        }

    },

    curIndex: 0,

    curFrameIndex : 1,

    isPlaying: false,

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

        //  clean fixed timer player
        clearTimeout(that.playFixedTimer);
        that.isPlaying = true;

        //  recursive to draw sprites
        function drawSprite(curFrameIndex, endFrameIndex) {
            that.curFrameIndex = curFrameIndex;

            //  check whether currentFrame is the last frame of the current scene.
            if (curFrameIndex == endFrameIndex) {
                that.draw(curFrameIndex);
                that.direct == "forward" ? that.playFixedFrames(that.curIndex) : null;
                that.isPlaying = false;
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

    playFixedFrames: function (curSceneIndex) {
        /**
         * Play fixed frames for each scene, when the scene animation is stoped
         * @param {Number} frameIndex  the index of fixed frame array
         * @return {Null} null
         */
        var that = this;
        var ctx = that.paper.ctx;

        //  draw sprite
        if (that.fixedSpriteGroup[curSceneIndex]) {
            drawSprite(that.fixedSpriteGroup[curSceneIndex][0], that.fixedSpriteGroup[curSceneIndex][1]);

            that.isPlaying = true;
        }

        //  recursive to draw sprites
        function drawSprite(curFrameIndex, endFrameIndex) {
            var curIndex = curFrameIndex;

            if (curIndex > endFrameIndex) {
                curIndex = that.fixedSpriteGroup[curSceneIndex][0];
                draw(curIndex);
            } else {
                draw(curIndex);
            }

            // draw next frame
            that.playFixedTimer = setTimeout(function () {
                drawSprite(curIndex+1, endFrameIndex);
            }, 1000/4);
        }

        function draw(frameIndex) {
            /**
             * Draw frame into canvas
             * @param {Number} frameIndex  the index of frame you want to draw into canvas
             * */
            var img = that.fixedSprites[frameIndex];
            var ctx = that.paper.ctx;

            if (img) {
                //  draw image
                ctx.drawImage(img, 0, that.paper.canvas.height*0.331, that.paper.canvas.width, that.paper.canvas.height*0.546);
            } else {

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
            ctx.drawImage(img, 0, that.paper.canvas.height*0.331, that.paper.canvas.width, that.paper.canvas.height*0.546);
        } else {

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
    //  set page response
    var page = new pageResponse({
        class : 'scene-wrap',     //模块的类名，使用class来控制页面上的模块(1个或多个)
        mode : 'contain',     // auto || contain || cover
        width : '375',      //输入页面的宽度，只支持输入数值，默认宽度为320px
        height : '593'      //输入页面的高度，只支持输入数值，默认高度为504px
    });

    // init app
    app.start();
};