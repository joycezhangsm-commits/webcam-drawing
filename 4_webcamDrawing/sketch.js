/* DN1010 Experimental Interaction, joyce 2026 
 * Week 5 - Computer Vision
 * Webcam Drawing
 */

// added custom image for drawing
var kitty;

var camera;
var prevImg;
var currImg;
var diffImg;

// changed sensitivity
var threshold = 0.2;

var grid;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  // load image for drawing
  kitty = loadImage("hellokitty.png");

  camera = createCapture(VIDEO, { flipped: true });
  camera.hide();

  grid = new Grid(1280, 720);
}

function draw() {
  // added fade effect for smoother trails
  background(120, 30);

  image(camera, 0, 0, 1280, 720);
  camera.loadPixels();

  var smallW = camera.width / 4;
  var smallH = camera.height / 4;

  currImg = createImage(smallW, smallH);
  currImg.copy(camera, 0, 0, camera.width, camera.height, 0, 0, smallW, smallH);
  currImg.filter("gray");
  currImg.filter("blur", 2);

  diffImg = createImage(smallW, smallH);

  if (typeof prevImg !== "undefined") {
    currImg.loadPixels();
    prevImg.loadPixels();
    diffImg.loadPixels();

    for (var x = 0; x < currImg.width; x++) {
      for (var y = 0; y < currImg.height; y++) {
        var index = (x + y * currImg.width) * 4;
        var d = abs(currImg.pixels[index] - prevImg.pixels[index]);

        diffImg.pixels[index] = d;
        diffImg.pixels[index + 1] = d;
        diffImg.pixels[index + 2] = d;
        diffImg.pixels[index + 3] = 255;
      }
    }

    diffImg.updatePixels();
  }

  prevImg = currImg.get();

  diffImg.filter("threshold", threshold);

  grid.update(diffImg);
}

var Grid = function (_w, _h) {

  // changed spacing for more detailed drawing
  this.noteWidth = 6;

  this.worldWidth = _w;
  this.worldHeight = _h;

  this.numOfNotesX = int(this.worldWidth / this.noteWidth);
  this.numOfNotesY = int(this.worldHeight / this.noteWidth);
  this.arrayLength = this.numOfNotesX * this.numOfNotesY;

  this.noteStates = new Array(this.arrayLength).fill(0);

  this.update = function (_img) {
    _img.loadPixels();

    for (var x = 0; x < _img.width; x++) {
      for (var y = 0; y < _img.height; y++) {
        var index = (x + y * _img.width) * 4;
        var state = _img.pixels[index];

        if (state == 255) {
          var screenX = map(x, 0, _img.width, 0, this.worldWidth);
          var screenY = map(y, 0, _img.height, 0, this.worldHeight);

          var ix = int(screenX / this.noteWidth);
          var iy = int(screenY / this.noteWidth);
          var i = ix + iy * this.numOfNotesX;

          this.noteStates[i] = 1;
        }
      }
    }

    for (var i = 0; i < this.arrayLength; i++) {
      // changed fade speed for longer trails
      this.noteStates[i] -= 0.03;
      this.noteStates[i] = constrain(this.noteStates[i], 0, 1);
    }

    this.draw();
  };

  this.draw = function () {
    noStroke();

    for (var x = 0; x < this.numOfNotesX / 2; x++) {
      for (var y = 0; y < this.numOfNotesY / 2; y++) {

        var posX = this.noteWidth / 2 + 2 * x * this.noteWidth;
        var posY = this.noteWidth / 2 + 2 * y * this.noteWidth;
        var i = x + y * this.numOfNotesX;

        if (this.noteStates[i] > 0) {

          var size = map(this.noteStates[i], 0, 1, 15, 40);

          // replaced shape with Hello Kitty image
          if (kitty) {
            image(kitty, posX, posY, size, size);
          }
        }
      }
    }
  };
};
