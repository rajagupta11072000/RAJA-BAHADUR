const canvas = document.getElementById('gameCanvas'),
      ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let health = 5, score = 0, highScore = localStorage.hbHighScore || 0;
let inBonus = false, bonusTime = 0;
const bonusThreshold = 500;

const assets = {
  imgRaja: new Image(), imgSoldier: new Image(), imgHorse: new Image(),
  imgElephant: new Image(), imgRock: new Image(),
  bgMusic: new Audio('https://cdn.jsdelivr.net/gh/maitraysuthar/sounds@main/battle_loop.mp3'),
  bonusMusic: new Audio('https://cdn.jsdelivr.net/gh/maitraysuthar/sounds@main/cheerful_bonus.mp3'),
  sfx: {
    jump: new Audio('https://cdn.jsdelivr.net/gh/maitraysuthar/sounds@main/jump.mp3'),
    attack: new Audio('https://cdn.jsdelivr.net/gh/maitraysuthar/sounds@main/sword_clash.mp3'),
    slide: new Audio('https://cdn.jsdelivr.net/gh/maitraysuthar/sounds@main/slide.mp3'),
    hit: new Audio('https://cdn.jsdelivr.net/gh/maitraysuthar/sounds@main/hit.mp3'),
    gameover: new Audio('https://cdn.jsdelivr.net/gh/maitraysuthar/sounds@main/gameover.mp3')
  }
};

assets.imgRaja.src     = 'https://i.imgur.com/8Q8zxx1.png';
assets.imgSoldier.src  = 'https://i.imgur.com/3w0hQ9R.png';
assets.imgHorse.src    = 'https://i.imgur.com/4S0CvBB.png';
assets.imgElephant.src = 'https://i.imgur.com/FnLsH6p.png';
assets.imgRock.src     = 'https://i.imgur.com/2kP6wm0.png';

let keys = {}, touchStartY = 0;
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);
canvas.addEventListener('touchstart', e => touchStartY = e.touches[0].clientY);
canvas.addEventListener('touchend', e => {
  const dy = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(dy) < 30) keys.Enter = true;
  else if (dy > 30) keys.ArrowUp = true;
  else keys.ArrowDown = true;
});

function playVoice(msg) {
  speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
}

function updateUI(){
  document.getElementById('healthVal').innerText = health;
  document.getElementById('scoreVal').innerText = score;
  document.getElementById('highScoreVal').innerText = highScore;
}

function gameOver(){
  assets.sfx.gameover.play();
  assets.bgMusic.pause();
  assets.bonusMusic.pause();
  document.getElementById('finalScore').innerText = score;
  document.getElementById('gameOver').style.display = 'flex';
  if(score > highScore) {
    localStorage.hbHighScore = score;
    highScore = score;
    updateUI();
  }
}

function restartGame() {
  health = 5; score = 0; inBonus = false;
  document.getElementById('gameOver').style.display = 'none';
  assets.bgMusic.play();
  loop();
}

class Obstacle {
  constructor(type) {
    this.type = type;
    this.size = 60;
    this.x = canvas.width;
    this.y = canvas.height - 100;
    this.speed = inBonus ? 12 : 5;
  }
  update() { this.x -= this.speed; }
  draw() {
    const img = {
      soldier: assets.imgSoldier,
      horse: assets.imgHorse,
      elephant: assets.imgElephant,
      rock: assets.imgRock
    }[this.type];
    ctx.drawImage(img, this.x, this.y, this.size, this.size);
  }
}

let obstacles = [];
function spawnObstacle(){
  if (Math.random() < 0.015) {
    const types = ['soldier','horse','elephant','rock'];
    obstacles.push(new Obstacle(types[Math.floor(Math.random()*types.length)]));
  }
}

function collision(o){
  const rX = 50, rY = canvas.height - 100;
  return o.x < rX + 60 && o.x + o.size > rX && o.y < rY + 80;
}

function takeDamage(){
  health--; assets.sfx.hit.play();
}

function scoreValue(t){
  return { soldier:100, rock:50, horse:75, elephant:75 }[t];
}

function update(){
  spawnObstacle();
  obstacles.forEach(o => {
    o.update();
    if(collision(o)) {
      takeDamage();
      o.x = -100;
    } else if(o.x < 0){
      score += scoreValue(o.type);
      updateUI();
      o.x = -100;
    }
  });
  obstacles = obstacles.filter(o => o.x > 0);

  if(score >= bonusThreshold && !inBonus){
    inBonus = true;
    bonusTime = Date.now();
    assets.bgMusic.pause();
    assets.bonusMusic.play();
    playVoice('मज़ा आ गया!');
  }
  if(inBonus && Date.now() - bonusTime > 20000){
    inBonus = false;
    assets.bonusMusic.pause();
    assets.bgMusic.play();
  }
  if(health <= 0) gameOver();
}

function draw(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(assets.imgRaja, 50, canvas.height - 120, 60, 80);
  obstacles.forEach(o => o.draw());
}

function loop(){
  if(health <= 0) return;
  update();
  draw();
  requestAnimationFrame(loop);
}

canvas.addEventListener('click', ()=>{
  assets.bgMusic.loop = true;
  assets.bonusMusic.loop = true;
  assets.bgMusic.volume = 0.3;
  assets.bonusMusic.volume = 0.5;
  assets.bgMusic.play();
  loop();
}, { once: true });

updateUI();
