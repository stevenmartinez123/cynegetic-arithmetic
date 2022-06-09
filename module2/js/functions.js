const canvas = document.getElementById('game');
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById('start-btn');
canvas.width = 650; 
canvas.height = 400; 
var lives = 3;
const audio = document.querySelector("#background-sound");
const gameOverChime = document.getElementById('gameover-chime');
const gameOverContainer = document.getElementById('gameOver-container');
const playAgainBtn = document.getElementById('playAgain-btn');
const livesContainer = document.querySelector('.livesContainer');
livesContainer.appendChild(document.createTextNode(`${lives}`));

startBtn.addEventListener('click', function() {
    const startForm = document.getElementById('playGame-container');
    startForm.style.display='none';
    canvas.style.display='block';
    livesContainer.style.display='flex';
    setInterval(gameLoop, 1000 / 90);
});

playAgainBtn.addEventListener('click', function() {
    window.location.reload();
});

function gameLoop() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    bulletController.draw(ctx);
    player.draw(ctx);
    populateBlocks();
    audio.volume = 0.2;
    audio.play();  
}

(function setCommonStyle() {
    ctx.shadowColor = "#d53";
    ctx.shadowBlur = 20; 
    ctx.lineJoin = "bevel";
    ctx.lineWidth = 10; 
})()

class Player {
    
    constructor(x, y, bulletController) {
        this.x = x; 
        this.y = y; 
        this.bulletController = bulletController; 
        this.width = 50; 
        this.height = 50;
        this.speed = 4;
        document.addEventListener('keydown', this.keydown); 
        document.addEventListener('keyup', this.keyup);
    }

    draw(ctx) {
        this.move();
        ctx.strokeStyle = "#ea00d9";
        ctx.fillStyle = "#133e7c";
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.fillRect(this.x, this.y, this.width, this.height);
        this.shoot()
    }

    move() {

        if (this.leftPressed) {
            if (this.x <= 7) {
                return;
            }
            this.x -= this.speed;  
        }

        if (this.rightPressed) {
            if (this.x >= 592) {
                return;
            }
            this.x += this.speed;
        }
    }

    keydown = (e) => {

        if (e.code === "ArrowLeft") {
            this.leftPressed = true;
        }

        if (e.code === "ArrowRight") {
            this.rightPressed = true;
        }

        if (e.code === "Space") {
            this.shootPressed = true;
        }
     }

    keyup = (e) => {
        if (e.code === "ArrowLeft") {
            this.leftPressed = false;
        }

        if (e.code === "ArrowRight") {
            this.rightPressed = false;
        }

        if (e.code === "Space") {
            this.shootPressed = false;
        }
    }

    shoot() {
       if (this.shootPressed) {
           const speed = 5; 
           const delay = 25; 
           const damage = 1; 
           const bulletX = this.x + this.width / 2; 
           const bulletY = this.y; 
           this.bulletController.shoot(bulletX, bulletY, speed, damage, delay);
       }
    }
}

class BulletController {

    bullets = []; 
    timeTillNextBullet = 0; 
    constructor(canvas) {
        this.canvas = canvas; 
    }

    shoot(x, y, speed, damage, delay) {
        if (this.timeTillNextBullet <= 0) {
            this.bullets.push(new Bullet(x, y, speed, damage)); 
            this.timeTillNextBullet = delay; 
        }

        this.timeTillNextBullet--; 
    }

    draw(ctx) {
        this.bullets.forEach((bullet) => {
            if (this.isBulletOffScreen(bullet)) {
                const index = this.bullets.indexOf(bullet)
                this.bullets.splice(index, 1);
            }
            bullet.draw(ctx);
        }); 
    }

    isBulletOffScreen(bullet) {
        return bullet.y <= -bullet.height;
    }

    collideWith(sprite) {
        return this.bullets.some((bullet) => {
            if (bullet.collideWith(sprite)) {
                this.bullets.splice(this.bullets.indexOf(bullet), 1);
                return true;
            } 
            return false;
        });
    }

}

class Bullet {
    constructor(x, y, speed, damage) {
        this.x = x; 
        this.y = y; 
        this.speed = speed; 
        this.damage = damage; 

        this.width = 5; 
        this.height = 25; 
        this.color = '#00ff9f';
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        this.y -= this.speed; 
        ctx.fillRect(this.x, this.y, this.width, this.height); 
        const blaster = document.querySelector('#blaster');
        blaster.volume = 0.2;
        blaster.play();
    }

    collideWith(sprite) {
        if (
            this.x < sprite.x + sprite.width &&
            this.x + this.width > sprite.x &&
            this.y < sprite.y + sprite.height &&
            this.y + this.height > sprite.y) {
                return true;
            }
            return false;
    }
}

class Block {
    constructor(x, y, color, text, good) {
        this.x = x; 
        this.y = y; 
        this.color = color; 
        this.text = text; 
        this.good = good;
        this.width = 35; 
        this.height = 150; 
    }

    draw(ctx) {

        ctx.fillStyle = this.color; 
       // ctx.strokeStyle = 'yellow';

        ctx.fillRect(this.x, this.y, this.width, this.height); 
       // ctx.strokeRect(this.x, this.y, this.width, this.height); 

        //Draw Text
        ctx.fillStyle = 'black';
        ctx.font = '25px Arial';
        let test = this.text.split(' ');
        ctx.fillText(test[0], this.x + this.width / 6, this.y + this.height / 5);
        ctx.fillText(test[1], this.x + this.width / 6, this.y + this.height / 2.9);
        ctx.fillText(test[2], this.x + this.width / 6, this.y + this.height / 1.9);
        ctx.fillText(test[3], this.x + this.width / 6, this.y + this.height / 1.4);
        ctx.fillText(test[4], this.x + this.width / 6, this.y + this.height / 1.1);

        this.y += .5;

        if (this.y >= 450) {
            if (this.good == false) {
                lives--;
                livesContainer.childNodes[3].data = lives;
                if (lives==0) {
                    canvas.style.display ='none';
                    livesContainer.style.display='none';
                    gameOverContainer.style.display = 'flex';
                    gameOverChime.play();
                    gameOverChime.volume = 0.4;
                }
            }
            this.y = -200;
        }

    }
}
const bulletController = new BulletController(canvas);
const player = new Player(canvas.width /2.2, canvas.height / 1.16, bulletController);
var blocks = [
    new Block(8, -200, 'orange', '4 + 2 = 6', true), new Block(80, -200, 'red', '2 / 2 = 1', true),
    new Block(150, -200, 'green', '4 + 2 = 8', false), new Block(220, -200, 'teal', '4 x 4 = 16', true),
    new Block(280, -200, 'pink', '4 x 8 = 32', true), new Block(340, -200, 'white', '4 x 3 = 12', true)
];

function populateBlocks() {

    blocks.forEach((block) => {
        if (bulletController.collideWith(block)) {
            if (block.good == true) {
                lives--;
                livesContainer.childNodes[3].data = lives;
            }

            if (lives == 0) {
                canvas.style.display ='none';
                livesContainer.style.display='none';
                gameOverContainer.style.display = 'flex';
                gameOverChime.play();
                gameOverChime.volume = 0.4;
            }
            const index = blocks.indexOf(block);
            blocks.splice(index, 1);

        } else {
                block.draw(ctx);
        }
        
    });
}

function random() {
    let max = blocks.length - 1;
    let min = 0;
    return Math.floor(Math.random() * (max - min + 1) + min);
}

