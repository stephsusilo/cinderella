const progressBar = document.querySelector("progress");
let width = 800;
let height = 600;
let spriteDiameter = 70;
let playerSprite;
let enemySprite;
let scarecrowSprite;
let leftColumnSprite;
let rightColumnSprite;
let backgroundMusic;
let twinkleSound;

function preload() {
  //SOURCE: https://vignette.wikia.nocookie.net/disneytsumtsum/images/0/07/Cinderella.png/revision/latest?cb=20160601004557
  playerSprite = loadImage(
    "https://raw.githubusercontent.com/stephsusilo/cinderella/master/Cinderella%20Tsum.png"
  );
  enemySprite = loadImage(
    "https://raw.githubusercontent.com/stephsusilo/cinderella/master/Drizella%20Tsum.PNG"
  );
  //SOURCE: https://i.pinimg.com/564x/46/db/27/46db27c72767df59a5c65970d2c9e5a4.jpg
  scarecrowSprite = loadImage(
    "https://raw.githubusercontent.com/stephsusilo/cinderella/master/Glass%20Slipper.png"
  );
  backgroundImage = loadImage(
    "https://raw.githubusercontent.com/stephsusilo/cinderella/master/Stairs.png"
  );
  leftColumnSprite = loadImage(
    "https://raw.githubusercontent.com/stephsusilo/cinderella/master/columnL.png"
  );
  rightColumnSprite = loadImage(
    "https://raw.githubusercontent.com/stephsusilo/cinderella/master/columnR.png"
  );
  //SOURCE: https://www.youtube.com/watch?v=LXtT9tGGG3U
  backgroundMusic = loadSound(
    "https://raw.githubusercontent.com/stephsusilo/cinderella/master/Disney%20Instrumental%20%C7%80%20Neverland%20Orchestra%20-%20Bibbidi-Bobbidi-Boo.mp3"
  );
  // SOURCE: https://www.youtube.com/watch?v=YD0vJfvKJP8
  twinkleSound = loadSound(
    "https://raw.githubusercontent.com/stephsusilo/cinderella/master/Twinkle.mp3"
  );
}

function setup() {
  createCanvas(width, height);
  backgroundMusic.loop();
  noStroke();
}

class Sprite {
  constructor(x, y, diameter, speed) {
    Object.assign(this, { x, y, diameter, speed });
  }
  get radius() {
    return this.diameter / 2;
  }
  move(target) {
    this.x += this.speed * (target.x - this.x);
    this.y += this.speed * (target.y - this.y);
  }
}

class Player extends Sprite {
  constructor(x, y, diameter, speed) {
    super(x, y, diameter, speed);
    this.health = 100;
  }
  render() {
    image(playerSprite, this.x, this.y);
  }
  takeHit() {
    progressBar.value = this.health--;
  }
}

class Enemy extends Sprite {
  constructor(x, y, diameter, speed) {
    super(x, y, diameter, speed);
  }
  render() {
    image(enemySprite, this.x, this.y);
  }
}

class Scarecrow extends Sprite {
  constructor(x, y) {
    super(x, y);
  }
  render() {
    image(scarecrowSprite, this.x, this.y);
  }
}

let player = new Player(width / 2, 0, spriteDiameter, 0.05);
let enemies = [
  new Enemy(...randomPointOnCanvas(), spriteDiameter, randomSpeed(0.01, 0.03)),
  new Enemy(...randomPointOnCanvas(), spriteDiameter, randomSpeed(0.03, 0.07)),
  new Enemy(...randomPointOnCanvas(), spriteDiameter, randomSpeed(0.07, 0.1))
];

function collided(sprite1, sprite2) {
  const distanceBetween = Math.hypot(
    sprite1.x - sprite2.x,
    sprite1.y - sprite2.y
  );
  const sumOfRadii = sprite1.diameter / 2 + sprite2.diameter / 2;
  return distanceBetween < sumOfRadii;
}

function randomPointOnCanvas() {
  return [
    Math.floor(Math.random() * width),
    Math.floor(Math.random() * height)
  ];
}

function randomSpeed(max, min) {
  return Math.random() * max - min + min;
}

function checkForDamage(enemy, player) {
  if (collided(player, enemy)) {
    player.takeHit();
  }
}

function adjustSprites() {
  const sprites = [player, ...enemies];
  for (let i = 0; i < sprites.length; i++) {
    for (let j = i + 1; j < sprites.length; j++) {
      pushOff(sprites[i], sprites[j]);
    }
  }
}

function pushOff(sprite1, sprite2) {
  let [dx, dy] = [sprite2.x - sprite1.x, sprite2.y - sprite1.y];
  const distance = Math.hypot(dx, dy);
  let overlap = sprite1.radius + sprite2.radius - distance;
  if (overlap > 0) {
    const adjustX = overlap / 2 * (dx / distance);
    const adjustY = overlap / 2 * (dy / distance);
    sprite1.x -= adjustX;
    sprite1.y -= adjustY;
    sprite2.x += adjustX;
    sprite2.y += adjustY;
  }
}

let canvasYPosition = 0;
function draw() {
  background(backgroundImage);
  drawColumns(canvasYPosition, leftColumnSprite, rightColumnSprite);
  player.render();
  player.move({ x: mouseX, y: mouseY });
  enemies.forEach(enemy => {
    enemy.render();
    checkForDamage(enemy, player);
    enemy.move(scarecrow || player);
  });
  setScarecrow();
  adjustSprites();
  endPlay();

  if (canvasYPosition > -600) {
    canvasYPosition -= 3;
  } else {
    canvasYPosition = 0;
  }
}

let leftColumns;
let rightColumns;
let columnSize = { width: 80, height: 40 };

function drawColumns(y, leftColumn, rightColumn) {
  for (
    let canvasYPosition = y;
    canvasYPosition < height;
    canvasYPosition += 300
  ) {
    for (let spacing = 600; spacing > 75; spacing /= 2) {
      leftColumns = image(
        leftColumn,
        -5,
        canvasYPosition - spacing,
        columnSize.width,
        columnSize.height
      );
      rightColumns = image(
        rightColumn,
        width - 75,
        canvasYPosition - spacing,
        columnSize.width,
        columnSize.height
      );
    }
  }
}

let scarecrow;
function mouseClicked() {
  if (!scarecrow) {
    scarecrow = new Scarecrow(player.x, player.y);
    twinkleSound.play();
    scarecrow.ttl = 5 * frameRate();
  }
}

function setScarecrow() {
  if (scarecrow) {
    scarecrow.render();
    scarecrow.ttl--;
    if (scarecrow.ttl < 0) {
      scarecrow = undefined;
      twinkleSound.stop();
    }
  }
}

function endPlay() {
  if (progressBar.value <= 0) {
    backgroundMusic.stop();
    twinkleSound.stop();
    loadEndScreen();
    noLoop();
  }
}

function loadEndScreen() {
  background("rgba(135, 206, 250, 0.25)");
  fill("white");
  stroke("rgba(119, 136, 153, 0.7)");
  strokeWeight(5);
  textAlign(CENTER);
  textSize(35);
  textFont("WaltographRegular");
  text(
    "Bippidi boppidi boo hoo hoo! \n Looks like Cinderella won't be making it to the ball...",
    width / 2,
    height / 2
  );
}