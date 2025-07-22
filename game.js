const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let health = 5, score = 0, highScore = localStorage.hbHighScore||0;
let inBonus = false, bonusTime = 0;
const bonusThreshold = 500;

// 🎯 Assets from fast CDNs / GitHub raw
const imgRaja = new Image(); imgRaja.src = 'https://i.imgur.com/8Q8zxx1.png'; // example sprite
const imgSoldier = new Image(); imgSoldier.src = 'https://i.imgur.com/3w0hQ9R.png';
const imgHorse = new Image(); imgHorse.src = 'https://i.imgur.com/4S0CvBB.png';
const imgElephant = new Image(); imgElephant.src = 'https://i.imgur.com/FnLsH6p.png';
const imgRock = new Image(); imgRock.src = 'https://i.imgur.com/2kP6wm0.png';

const assets = {
  bgMusic: new Audio('https://cdn.jsdelivr.net/gh/maitraysuthar/sounds@main/battle_loop.mp3'),
  bonusMusic: new Audio('https://cdn.jsdelivr.net/gh/maitraysuthar/sounds@main/cheerful_bonus.mp3'),
  sfx: {
    jump:new Audio('https://cdn.jsdelivr.net/gh/maitraysuthar/sounds@main/jump.mp3'),
    attack:new Audio('https://cdn.jsdelivr.net/gh/maitraysuthar/sounds@main/sword_clash.mp3'),
    slide:new Audio('https://cdn.jsdelivr.net/gh/maitraysuthar/sounds@main/slide.mp3'),
    hit:new Audio('https://cdn.jsdelivr.net/gh/maitraysuthar/sounds@main/hit.mp3'),
    gameover:new Audio('https://cdn.jsdelivr.net/gh/maitraysuthar/sounds@main/gameover.mp3'),
  }
};

// Controls
let keys={}, touchStartY=0;
addEventListener('keydown', e=>keys[e.key]=true);
addEventListener('keyup', e=>keys[e.key]=false);
canvas.addEventListener('touchstart', e=>{touchStartY=e.touches[0].clientY});
canvas.addEventListener('touchend', e=>{
  const dy = touchStartY - e.changedTouches[0].clientY;
  if(Math.abs(dy)<30){keys.Enter=true} else if(dy>30){keys.ArrowUp=true} else {keys.ArrowDown=true}
});

// Voice
function playVoice(msg){ speechSynthesis.speak(new SpeechSynthesisUtterance(msg)); }

// UI
function updateUI(){
  document.getElementById('healthVal').innerText = health;
  document.getElementById('scoreVal').innerText = score;
  document.getElementById('highScoreVal').innerText = highScore;
}

// Game Over
function gameOver(){
  assets.sfx.gameover.play();
  assets.bgMusic.pause(); assets.bonusMusic.pause();
  document.getElementById('finalScore').innerText = score;
  document.getElementById('gameOver').style.display='flex';
  if(score>highScore){ localStorage.hbHighScore=score; highScore=score; updateUI(); }
}
function restartGame(){
  health=5; score=0; inBonus=false;
  document.getElementById('gameOver').style.display='none';
  assets.bgMusic.play();
  loop();
}

// Obstacles
let obstacles=[];
class Obstacle {
  constructor(type){
    this.type=type; this.size=60;
    this.x=canvas.width; this.y=canvas.height-100;
    this.speed = inBonus?12:5;
  }
  update(){ this.x -= this.speed; }
  draw(){
    let img = { soldier:imgSoldier, horse:imgHorse, elephant:imgElephant, rock:imgRock }[this.type];
    ctx.drawImage(img,this.x,this.y,this.size,this.size);
  }
}

function spawnObstacle(){
  if(Math.random()<0.015){
    const arr=['soldier','horse','elephant','rock'];
    obstacles.push(new Obstacle(arr[Math.floor(Math.random()*arr.length)]));
  }
}

function collision(o){
  const rX=50,rY=canvas.height-100;
  return o.x<rX+60 && o.x+o.size>rX && rY<o.y+o.size;
}

function takeDamage(){
  health--; assets.sfx.hit.play();
}

function scoreValue(t){
  return { soldier:100, rock:50, horse:75, elephant:75 }[t];
}

// Main update & draw
function update(){
  spawnObstacle();
  obstacles.forEach(o=>{
    o.update();
    if(collision(o)){ takeDamage(); o.x=-100; }
    else if(o.x<0){ score += scoreValue(o.type); updateUI(); o.x=-100; }
  });
  obstacles = obstacles.filter(o=>o.x>0);
  if(score>=bonusThreshold && !inBonus){
    inBonus=true; bonusTime=Date.now();
    assets.bgMusic.pause(); assets.bonusMusic.play();
    playVoice('मज़ा आ गया!');
  }
  if(inBonus && Date.now()-bonusTime>20000){
    inBonus=false;
    assets.bonusMusic.pause(); assets.bgMusic.play();
  }
  if(health<=0){ return gameOver(); }
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(imgRaja,50,canvas.height-120,60,80);
  obstacles.forEach(o=>o.draw());
}

// Game loop
function loop(){
  if(health<=0) return;
  update(); draw(); requestAnimationFrame(loop);
}

// Start game
updateUI();
assets.bgMusic.loop=true; assets.bgMusic.volume=0.3;
assets.bonusMusic.loop=true; assets.bonusMusic.volume=0.5;
assets.bgMusic.play();
loop();
