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

        //  init paper info
        that.paper.ctx = ctx;
        that.paper.canvas.dom = Canvas;
        that.paper.canvas.width = Canvas.width;
        that.paper.canvas.height = Canvas.height;

        //  loadingTable
        that.loadingTable = new LoadingTable();
        that.loadingTable.init();

        //  loadingNumber
        that.loadingNumber = new LoadingNumber();

        loadMain();

        //  load main
        function loadMain () {
            //  set images generator
            var imgPath = "assets/images/";
            //  img amounts, use the amounts order to general image objects
            var imgAmounts = 212+1;
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
                img.src = imgPath + 'final_1080_1707_0831_' + app.utils.fixZero(i) + '.jpg';
                img.index = i;

                img.onload = function () {
                    loadedAmounts++;

                    //  add to sprites
                    that.sprites[this.index] = this;

                    checkLoadedAndGoToCreateState();
                };

                img.onerror = function (error) {
                    imgAmounts -= 1;

                    checkLoadedAndGoToCreateState();
                };
            }

            //  load title sprite
            (function () {
                var img = new Image();
                img.src = imgPath + 'title-sprite.png';

                img.onload = function () {
                    loadedAmounts++;

                    //  add to sprites
                    that.titleSprite = this;

                    checkLoadedAndGoToCreateState();
                };

                img.onerror = function (error) {
                    imgAmounts -= 1;

                    checkLoadedAndGoToCreateState();
                };
            })();

            function checkLoadedAndGoToCreateState () {
                /* check img load progress */
                if (checkIsAllLoaded() && isLoaded == false) {
                    isLoaded = true;

                    //  leave the loading
                    var loadingDom = document.getElementsByClassName('loading')[0];
                    loadingDom.className = loadingDom.className + ' complete';

                    console.log('images loader end..');
                    setTimeout(function () {
                        //  hide the loading
                        loadingDom.style.display = 'none';

                        app.create();
                    }, 1600);
                }
            }

            function checkIsAllLoaded () {
                var loadedRate = 1;

                that.loadingNumber.update(Math.floor((loadedAmounts / imgAmounts) * 100));

                return loadedAmounts / imgAmounts >= loadedRate;
            }
        }
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
        //var swiper = new Hammer(touchArea);
        //swiper.on('swipeleft', nextSceneHandler);
        //swiper.on('swiperight', prevSceneHandler);

        document.getElementById('prev').onclick = prevSceneHandler;

        document.getElementById('next').onclick = nextSceneHandler;

        //  bind share layout buttons
        var againButton = document.getElementsByClassName('btn01')[0];
        var shareButton = document.getElementsByClassName('btn02')[0];

        againButton.onclick = function () {
            //  hide share layout
            var shareLayout = document.getElementsByClassName('share')[0];
            shareLayout.className = shareLayout.className.replace(' active', '');

            that.direct = "forward";
            that.curIndex = 0;
            setTimeout(function () {
                that.playFrames(that.sceneSpriteGroup[0][0], that.sceneSpriteGroup[0][1]);
            }, 1600);
        };

        //  touch event
        var touchStartX = 0;

        //  check whether tablet or smart phone
        var minMove = that.paper.canvas.width >= 600 ? 1 : 3;

        touchArea.addEventListener('touchstart', setTouchStartPoint, false);
        touchArea.addEventListener('touchmove', setCurrentFrame, false);
        touchArea.addEventListener('touchend', touchEndHandler, false);

        //  create title obj
        that.title = new Title();

        //  update title
        that.title.update();

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
                that.isPlaying = true;

                that.playFrames(that.curFrameIndex, that.sceneSpriteGroup[that.curIndex][0]);

                showPara(that.curIndex-1 < 0 ? that.sceneSpriteGroup.length-1 : that.curIndex-1);
            }
        }

        function nextSceneHandler() {
            if (that.isPlaying == false) {
                //  stop prev frames drawer
                clearTimeout(that.playTimer);

                that.direct = "forward";
                that.isPlaying = true;

                that.playFrames(that.curFrameIndex, that.sceneSpriteGroup[that.curIndex][1]);

                showPara(that.curIndex);
            }
        }

        function setTouchStartPoint(e) {
            touchStartX = parseInt(e.touches[0].pageX);

            that.canPlayFixedFrames = false;
            that.startTime = new Date().getTime();
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
                    that.direct = 'forward';

                    //  if went to the next scene
                    if (that.curFrameIndex > endFrame) {
                        if (that.curIndex + 1 == that.sceneSpriteGroup.length) {
                            that.curFrameIndex -= 1;
                        } else {
                            that.curIndex += 1;
                            that.curFrameIndex = that.sceneSpriteGroup[that.curIndex][0];
                        }

                        //  show para
                        showPara(that.curIndex);
                    } else {
                    }

                } else if (movedX > minMove) {
                    that.curFrameIndex -= 1;
                    that.direct = 'backward';

                    //  if went to the previous scene
                    if (that.curFrameIndex < startFrame) {
                        if (that.curIndex - 1 < 0) {
                            that.curFrameIndex += 1;
                        } else {
                            that.curIndex -= 1;
                            that.curFrameIndex = that.sceneSpriteGroup[that.curIndex][1];
                        }

                        //  show para
                        showPara(that.curIndex);
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

        function touchEndHandler () {
            that.endTime = new Date().getTime();

            if (that.endTime - that.startTime <= 300) {
                that.direct == 'forward' ? nextSceneHandler() : prevSceneHandler();
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
            var shareLayout = document.getElementsByClassName('share')[0];

            paraTimer = setTimeout(function () {
                //  ignore the last scene
                if (index < that.sceneSpriteGroup.length - 1 && index >= 0) {
                    document.getElementsByClassName('para0' + (index + 1))[0].className = document.getElementsByClassName('para0' + (index + 1))[0].className + ' active';

                    if (that.direct == 'backward') {
                        //  play title
                        that.title.update();

                        setTimeout(function () {
                            that.title.stop(that.curIndex-1);
                        }, 1500);
                    } else {
                        //  play title
                        that.title.update();

                        setTimeout(function () {
                            that.title.stop(that.curIndex);

                        }, 1500);
                    }
                } else {
                    that.title.clear();
                }

                if (that.curIndex == that.sceneSpriteGroup.length-1) {
                    //  show share layout
                    if (shareLayout.className.indexOf('active') < 0) {
                        shareLayout.className = shareLayout.className + ' active';
                    }
                } else {
                    //  hide share layout
                    shareLayout.className = shareLayout.className.replace(' active', '');
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

        //  recursive to draw sprites
        function drawSprite(curFrameIndex, endFrameIndex) {
            that.curFrameIndex = curFrameIndex;

            //  check whether currentFrame is the last frame of the current scene.
            if (curFrameIndex == endFrameIndex) {
                that.draw(curFrameIndex);

                for (var i = 0; i < that.sceneSpriteGroup.length; i++) {
                    if (that.sceneSpriteGroup[i][1] == that.curFrameIndex) {
                        that.canPlayFixedFrames = true;
                        that.playFixedFrames(that.curIndex);
                    }
                }

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

    canPlayFixedFrames: false,

    playFixedFrames: function (curSceneIndex) {
        /**
         * Play fixed frames for each scene, when the scene animation is stoped
         * @param {Number} frameIndex  the index of fixed frame array
         * @return {Null} null
         */
        var that = this;
        var ctx = that.paper.ctx;

        //  draw sprite
        if (that.canPlayFixedFrames && that.fixedSpriteGroup[curSceneIndex]) {
            drawSprite(that.fixedSpriteGroup[curSceneIndex][0], that.fixedSpriteGroup[curSceneIndex][1]);
        }

        //  recursive to draw sprites
        function drawSprite(curFrameIndex, endFrameIndex) {
            //  stop draw fixed frames
            if (that.canPlayFixedFrames == false ) { return;}

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

/** scene title */
function Title () {
    var that = this;

    this.width = 330;
    this.height = 40;
    this.totalHeight = app.titleSprite.height/2;

    this.timer = null;
    this.y = 0;
    this.speed = 100;

    this.index = 0;
    this.maxIndex = 3;

    this.ctx = document.getElementById('title').getContext('2d');
    this.img = app.titleSprite;
    this.state = false;

    this.update = function () {

        go();

        function go () {
            //  clear timer
            clearTimeout(that.timer);

            that.clear();

            //  update Index
            that.index + 1 > that.maxIndex ? that.index = 0 : that.index++;

            //  draw image
            that.ctx.drawImage(that.img, 0, that.y, that.width*2, that.height*2, 0, 0, that.width, that.height);

            //console.log(that.speed,  that.y);

            //  reset y position
            if (that.y > that.totalHeight + that.height*2) {
                that.y = that.y % that.totalHeight - that.height*2 - 120;
                //console.log(that.totalHeight, that.y);
            } else {
                //  update y position
                that.y += 120;
            }

            that.timer = setTimeout(function () {
                go();
            }, that.speed);
        }
    };

    this.stop = function (index) {
        //  clear timer
        clearTimeout(that.timer);

        that.clear();

        //  draw image
        that.ctx.drawImage(that.img, 0, that.height*index*2, that.width*2, that.height*2, 0, 0, that.width, that.height);
    };

    this.clear = function () {
        //  clear paper
        that.ctx.clearRect(0, 0, 330, 40);
    };
}

/** loadingTable */
function LoadingTable () {
    var that = this;
    this.isAlive = true;
    this.index = 0;
    this.end = 14;
    this.curIndex = 0;
    this.frameWidth = 462;
    this.frameHeight = 480;
    this.width = this.frameWidth/2;
    this.height = this.frameHeight/2;
    this.left = 190/2;
    this.top = 280/2;
    this.sprite = null;

    this.ctx = document.getElementById('loading').getContext('2d');

    this.update = function () {
        this.ctx.clearRect(this.left, this.top, this.width, this.height);
        this.ctx.drawImage(this.sprite, this.frameWidth*this.curIndex, 0, this.frameWidth, this.frameHeight, this.left, this.top, this.width*0.8, this.height*0.8);
    };

    this.init = function () {
        var that = this;

        //  create sprite
        var sprite = new Image();
        sprite.src = "assets/images/loading-table.png";
        sprite.onload = function () {
            that.sprite = this;

            //  update canvas per 200ms
            var loadingTableTimer = setInterval(function () {
                if (that.isAlive) {
                    that.curIndex + 1  > that.end ? that.curIndex = 0 : that.curIndex += 1;
                    that.update();

                    //// beginPath
                    //app.paper.ctx.beginPath();
                    //app.paper.ctx.rect(loadingTable.left, loadingTable.top, loadingTable.width, loadingTable.height);
                    //app.paper.ctx.stroke();
                    //app.paper.ctx.closePath();
                }

                if (that && that.isAlive == false) {
                    clearInterval(loadingTableTimer);
                }
            }, 200);
        };
    };
}

/** loadingNumber */
function LoadingNumber () {
    this.size = 22;
    this.single = document.getElementsByClassName('single')[0];
    this.ten = document.getElementsByClassName('ten')[0];
    this.hundred = document.getElementsByClassName('hundred')[0];

    this.update = function (number) {
        var singleBit = number % 10;
        var tenBit = parseInt(number/10);
        console.log(singleBit, tenBit);

        if (number < 10) {
            this.single.style.backgroundPositionX = (-this.size * singleBit) + 'px';
            this.ten.style.backgroundPositionX = '0px';
        } else if (number == 100) {
            this.single.style.backgroundPositionX = '0px';
            this.ten.style.backgroundPositionX = '0px';
            this.hundred.style.backgroundPositionX = -this.size + 'px';
            this.hundred.style.display = 'inline-block';
        } else {
            this.single.style.backgroundPositionX = (-this.size * singleBit) + 'px';
            this.ten.style.backgroundPositionX = (-this.size * tenBit) + 'px';
        }
    };
}

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