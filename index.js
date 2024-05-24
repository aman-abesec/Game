const canvas = document.getElementById("game-area");
const ctx = canvas.getContext("2d");
let CANVAS_WIDHT = 1400;
let CANVAS_HEIGHT = 650;
// let CANVAS_WIDHT  = window.outerWidth;
// let CANVAS_HEIGHT = window.outerHeight;
let BACKGROUND_HEIGHT = 600;
let BACKGROUND_WIDTH = 1450;

let gameSpeed = 3;
let fps = 50;
let conter = 0;
let isGameOver=false;

canvas.width = CANVAS_WIDHT;
canvas.height = CANVAS_HEIGHT;
canvas.style.border = "2px solid red";

let flashScore = 0;
let flashCounter = 0;
let flashCounterX = 0;
let flashCounterY = 0;

const wallImg = document.getElementById("wall");
const buildingImg = document.getElementById("bg-building");
const mountainImg = document.getElementById("bg-mountain");
const cloudImg = document.getElementById("bg-cloud");
const grassImg = document.getElementById("bg-grass");
const playerImg = document.getElementById("player");

const bombImg = document.getElementById("bomb");
const diamondImg = document.getElementById("diamond");
const heartImg = document.getElementById("heart");
const silverCoinImg = document.getElementById("silverCoin");
const skletonImg = document.getElementById("skleton");
const starImg = document.getElementById("star");
const goldCoinImg = document.getElementById("goldCoin");
const saveHimImg = document.getElementById("saveHim");

const keyTriggers = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  KeyPressed: false,
};

function generateRandom(min = 0, max = 100) {
  let difference = max - min;
  let rand = Math.random();
  rand = Math.floor(rand * difference);
  rand = rand + min;
  return rand;
}

class Background {
  constructor(x, y, img, bgSpeed) {
    this.x = x;
    this.y = y;
    this.img = img;
    this.width = this.img.width;
    this.height = this.img.height;
    this.x2 = this.width;
    this.bgSpeed = bgSpeed;
    this.speed = gameSpeed * this.bgSpeed;
    this.counter = 0;
  }

  draw() {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    ctx.drawImage(this.img, this.x2, this.y, this.width, this.height);
    this.update();
  }

  update() {
    this.speed = gameSpeed * this.bgSpeed;
    if (this.x <= -this.width) {
      this.x = this.width + this.x2 - this.speed;
    }
    if (this.x2 <= -this.width) {
      this.x2 = this.width + this.x - this.speed;
    }
    this.x = Math.floor(this.x - this.speed);
    this.x2 = Math.floor(this.x2 - this.speed);
  }
}

class Player {
  constructor(img,x, y) {
    this.x = x;
    this.y = y;
    this.width = 45;
    this.height = 60;
    this.img=img;
    this.speed = 5;
    this.acceleration = 0;
    this.score = 0;
    this.life = 3;
    this.shieldEnabled = false;
    this.shieldImg = '';
    this.shieldEnabledCount = 1;
  }

  draw() {
    ctx.shadowColor = "blue";
    ctx.shadowBlur = 10;
    ctx.fillStyle='white';
    ctx.fillRect(10,5,150,50)
    ctx.shadowBlur = 0;
    ctx.fillStyle='blue';
    ctx.font = "15px sans-serif";
    ctx.fillText(`SCORE : ${this.score}`, 20,25);
    ctx.fillText(`LIFE  : ${this.life}`, 20,45);

    ctx.fillStyle = "white";
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    // ctx.fillRect(this.x, this.y, this.width, this.height);
    this.update();
  }

  handleBoundaryCondition() {
    if (0 >= this.x) {
      this.x = 0;
    }
    if (this.x > CANVAS_WIDHT - this.width) {
      this.x = CANVAS_WIDHT - this.width;
      this.acceleration = 0;
    }
    if (0 >= this.y) {
      this.y = 0;
    }
    if (this.y > BACKGROUND_HEIGHT - this.height) {
      this.y = BACKGROUND_HEIGHT - this.height;
    }
  }

  velocity() {
    if (
      !keyTriggers["KeyPressed"] &
      (this.y < BACKGROUND_HEIGHT - this.height)
    ) {
      this.acceleration += 0.02;
      this.y += this.speed + this.acceleration;
    }
  }

  gameOverPopUp(){
    ctx.fillStyle='rgba(55,55,55,0.4)';
    ctx.fillRect(0,0,CANVAS_WIDHT,CANVAS_HEIGHT);
    ctx.fillStyle='Red';
    ctx.font = "65px sans-serif";
    ctx.fillText(`GAME OVER`, CANVAS_WIDHT/2.6,CANVAS_HEIGHT/2);
  }

  update() {
    if(this.shieldEnabled && this.shieldEnabledCount%500){
        this.shieldEnabledCount+=1;
        ctx.drawImage(this.shieldImg, this.x, this.y, this.width, this.height);
    }
    else{
        this.shieldEnabledCount=1;
        this.shieldEnabled = false;
    }
    if (keyTriggers["ArrowUp"]) {this.y -= gameSpeed + this.speed;}
    if (keyTriggers["ArrowDown"]) {this.y += gameSpeed + this.speed;}
    if (keyTriggers["ArrowLeft"]) {this.x -= gameSpeed + this.speed;}
    if (keyTriggers["ArrowRight"]) {this.x += gameSpeed + this.speed;}
    this.handleBoundaryCondition();
    this.velocity();
    if(this.life <= 0){
      isGameOver=true;
      this.gameOverPopUp();
    }
  }
}

class Enemy {
  constructor(enemyObject) {
    let {img , score=0,life=0,protect=false} = enemyObject;
    this.width = 50;
    this.height = 50;
    this.speed = 5;
    this.img = img;
    this.score = score;
    this.life = life;
    this.protect=protect;
    this.x = generateRandom(CANVAS_WIDHT, BACKGROUND_WIDTH);
    this.y = generateRandom(0, BACKGROUND_HEIGHT - this.height);
  }

  draw() {
    ctx.beginPath();
    ctx.shadowColor = "yellow";
    ctx.shadowBlur = 10;
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    ctx.shadowBlur = 0;
    ctx.closePath();
  }

  detectCollision(index, user) {
    if (
      user.x < this.x + this.width &&
      user.x + user.width > this.x &&
      user.y < this.y + this.height &&
      user.y + user.height > this.y
    ) {
        if(this.protect){
            user.shieldEnabled = true;
            user.shieldImg = this.img;
        }
        flashScore = this.score;
        flashCounter = 1;
        flashCounterX = this.x;
        flashCounterY = this.y;
        user.score += this.score;
        if(!user.shieldEnabled) user.life += this.life;
      enemyArray.splice(index, 1);
    }
  }

  update(index, user) {
    this.x -= this.speed;
    if (this.x < 0 && this.x <= -CANVAS_WIDHT) {
      enemyArray.splice(index, 1);
    }
    this.detectCollision(index, user);
  }
}

let bgBuilding = new Background(0, 0, buildingImg, 0.5);
let bgMountain = new Background(0, 0, mountainImg, 1);
let bgCloud = new Background(0, 0, cloudImg, 0.75);
let bgGrass = new Background(0, 0, grassImg, 2);
let bgWall = new Background(0, 600, wallImg, 0);

let user = new Player(playerImg,0, 560);

let allEnemyImages = [
  { img: saveHimImg,protect:true},
  { img: goldCoinImg, score:40},
  { img: bombImg,life:-1},
  { img: diamondImg,score:50},
  { img: heartImg,life:1 },
  { img: silverCoinImg,score:20},
  { img: skletonImg,life:-2 },
  { img: starImg ,score:30},
];

let enemyArray = [];

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (conter % fps === 0) {
    enemyArray.push(
      new Enemy(allEnemyImages[generateRandom(0, allEnemyImages.length)])
    );
  }
  bgBuilding.draw();
  bgMountain.draw();
  bgCloud.draw();
  bgGrass.draw();
  bgWall.draw();
  user.draw();
  enemyArray.forEach((enemy, index) => {
    enemy.draw();
    enemy.update(index, user);
  });
  conter += 1;

  if(flashCounter <=40 && flashScore){
    if(flashCounterY > 0){
        flashCounterY-=1;
    }
    ctx.fillStyle='red';
    ctx.font = "30px sans-serif";
    ctx.fillText(`+${flashScore}`, flashCounterX,flashCounterY);
    flashCounter+=1
}
  bgWall.draw();
  if(isGameOver){
    return;
  }
  window.requestAnimationFrame(animate);
}

// function animati
window.addEventListener("load", () => {
    ctx.dis
    setTimeout(()=>{
        window.requestAnimationFrame(animate);
    },5000)
  
});

window.addEventListener("keyup", function (e) {
  keyTriggers[e["key"]] = false;
  keyTriggers["KeyPressed"] = false;
});

window.addEventListener("keydown", function (e) {
  keyTriggers[e["key"]] = true;
  keyTriggers["KeyPressed"] = true;
});
