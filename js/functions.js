
//global variables 
const canvas = document.getElementById('game'); //element for canvas
const ctx = canvas.getContext("2d"); //context set to 2d
const startBtn = document.getElementById('start-btn'); //start button to start game
canvas.width = 650; //game width set to 650px
canvas.height = 400; //game height set to 400px
const audio = document.querySelector("#background-sound"); //background audio while playing
audio.volume = 0.4; //volume of game audio 
const gameOverChime = document.getElementById('gameover-chime'); //audio plays when game over displayed
const gameOverContainer = document.getElementById('gameOver-container'); //container div for gameover display
const playAgainBtn = document.getElementById('playAgain-btn'); //button to allow player to play again
const livesContainer = document.querySelector('.livesContainer'); //container to display lives count
var lives = 3; //lives player gets is 3
livesContainer.appendChild(document.createTextNode(`${lives}`)); //appends lives to lives container
var gameStart; //start game var for setInterval

//event listener for start button. when clicked the game starts 
startBtn.addEventListener('click', function() {
    const startForm = document.getElementById('playGame-container'); 
    startForm.style.display='none';  //sets play game menu to none
    canvas.style.display='block'; //game now appears on screen
    livesContainer.style.display='flex'; //lives container appears on screen
    gameStart = setInterval(gameLoop, 1000 / 60); //setInterval to start game loop
});

//event listener for play again button. when clicked page refreshes for new game
playAgainBtn.addEventListener('click', function() {
    window.location.reload();
});

//gameLoop to run game
function gameLoop() {
    ctx.fillStyle = "black"; //canvas color set to black
    ctx.fillRect(0, 0, canvas.width, canvas.height); //fills whole canvas as black
    bulletController.draw(ctx); // draws bullets on grid
    player.draw(ctx); //draws player on grid
    populateBlocks(); //populates blocks on grid
    audio.play(); // plays game audio on loop
}


//sets css for main player in IIFE 
(function setCommonStyle() {
    ctx.shadowColor = "#d53";
    ctx.shadowBlur = 20; 
    ctx.lineJoin = "bevel";
    ctx.lineWidth = 10; 
})()

//class for Player
class Player {
    //takes a x position, y position, and bulletcontroller to shoot bullets
    constructor(x, y, bulletController) {
        this.x = x; //x coordinate to start player on canvas
        this.y = y;  //y coordinate to start player on canvas
        this.bulletController = bulletController;  //gives the ability of player to shoot bullets
        this.width = 30; //sets width of player
        this.height = 30; //sets height of player
        this.speed = 5; //speed of player to turn left and right

        //event listeners to move player
        document.addEventListener('keydown', this.keydown); 
        document.addEventListener('keyup', this.keyup);
    }

    //draws player on canvas
    draw(ctx) {
        this.move();
        ctx.strokeStyle = "#ea00d9";
        ctx.fillStyle = "#133e7c";
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.fillRect(this.x, this.y, this.width, this.height);
        this.shoot()
    }
    //controls player movement 
    move() {
        //max x coordinate a player can move left and right 
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
    //shoot function for bullets
    shoot() {
       if (this.shootPressed) {
           const speed = 6; 
           const delay = 20; 
           const damage = 1; 
           const bulletX = this.x + this.width / 2; 
           const bulletY = this.y; 
           this.bulletController.shoot(bulletX, bulletY, speed, damage, delay);
       }
    }
}

//bullet controller class to allow how many bullets to fire from player
class BulletController {

    bullets = []; //creates a bullet array
    timeTillNextBullet = 0; 
    //takes the canvas as a param to initialize the bullets on screen
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
    //draws bullets to canvas 
    draw(ctx) {
        this.bullets.forEach((bullet) => {
            if (this.isBulletOffScreen(bullet)) {
                const index = this.bullets.indexOf(bullet)
                this.bullets.splice(index, 1);
            }
            bullet.draw(ctx);
        }); 
    }

    //checks if bullets has left the grid
    isBulletOffScreen(bullet) {
        return bullet.y <= 0;
    }
//returns true if the bullet has collided with an object and if so it is deleted from array
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
//class bullet that takes x and y coordinate, its bullet speed, and its damage
class Bullet {
    constructor(x, y, speed, damage) {
        this.x = x; 
        this.y = y; 
        this.speed = speed; 
        this.damage = damage; 

        this.width = 5; //bullet width at 5 
        this.height = 25; //bullet height at 25
        this.color = '#00ff9f'; //color set to neon green
    }

//draw function to draw bullets
//when fires a blaster noise is made
    draw(ctx) {
        ctx.fillStyle = this.color;
        this.y -= this.speed; 
        ctx.fillRect(this.x, this.y, this.width, this.height); 
        const blaster = document.querySelector('#blaster');
        blaster.volume = 0.2;
        blaster.play();
    }
//function to see if bullet has collided with a block
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
//block class that displays answers falling down screen
//takes x and y coordinates, formula text, if its a wrong or right answer, and its position to fall on the grid
class Block {
    constructor(x, y, text, correct, xIndex) {
        this.x = x; 
        this.y = y; 
        this.color = `rgb(${randomRGBGenerator()}, ${randomRGBGenerator()}, ${randomRGBGenerator()})` 
        this.text = text; 
        this.correct = correct;
        this.width = 35; 
        this.height = 150;
        this.xIndex = xIndex;
    }
    //draws block to screen
    draw(ctx, index) {

        ctx.fillStyle = this.color; 

        ctx.fillRect(this.x, this.y, this.width, this.height); 

        //Draw Text
        ctx.fillStyle = 'black';
        ctx.font = '25px Arial';
        let test = this.text.split(' ');
        ctx.fillText(test[0], this.x + this.width / 6, this.y + this.height / 5);
        ctx.fillText(test[1], this.x + this.width / 6, this.y + this.height / 2.9);
        ctx.fillText(test[2], this.x + this.width / 6, this.y + this.height / 1.9);
        ctx.fillText(test[3], this.x + this.width / 6, this.y + this.height / 1.4);
        ctx.fillText(test[4], this.x + this.width / 6, this.y + this.height / 1.1);

        this.y += .7;

        //if a block has left the visible grid replace with random new block 
        if (this.y >= 450) {
        
        //if the block has a wrong equation that passes through, player loses a life
            if (this.correct == false) {
                lives--;
                livesContainer.childNodes[3].data = lives;
                console.log("You let an incorrect answer pass!");
                console.log(this.text);
                //if there are no lives left the game is over 
                    if (lives == 0) {
                        canvas.style.display ='none';
                        livesContainer.style.display='none';
                        gameOverContainer.style.display = 'flex';
                        gameOverChime.play();
                        gameOverChime.volume = 0.4;
                        clearInterval(gameStart);
                    }
            }
            this.y = randomYCordinate(); //gives this block a new y coordinate
            let newBlock = reserveBlocks[randomBlock()]; //recieves a new block to display on grid
            newBlock.y = randomYCordinate(); //assigns new block a new y coordinate
            newBlock.xIndex = this.xIndex; //new block x position index changed to previous blocks index
            newBlock.x = randomXCoordinate(newBlock.xIndex); //new block assigned a new x position
            blocks.splice(index, 1, newBlock); //replaces old block with new block from reserve array
        }

    }
}

//function to populate the blocks on the canvas
function populateBlocks() {

    blocks.forEach((block) => {
        //if statement if the bullets hits a block
        if (bulletController.collideWith(block)) {
            //if a bullet hits a correct answer a life is deducted
            if (block.correct == true) {
                lives--;
                livesContainer.childNodes[3].data = lives;
                console.log("You shot a correct answer!");
                console.log(block.text);
            }
            //if lives are zero the game is over
            if (lives == 0) {
                canvas.style.display ='none';
                livesContainer.style.display='none';
                gameOverContainer.style.display = 'flex';
                gameOverChime.play();
                gameOverChime.volume = 0.4;
                clearInterval(gameStart);
            }
            let index = blocks.indexOf(block);//takes index of hit block
            let newBlock = reserveBlocks[randomBlock()]; //newBlock is a random block from reserveBlocks array
            newBlock.y = randomYCordinate(); //gives a new block a random y axis to fall down the grid
            newBlock.xIndex = block.xIndex; //assigns the xIndex to new block
            newBlock.x = randomXCoordinate(newBlock.xIndex); //assigns random x value to block
            blocks.splice(index, 1, newBlock); //replace old block that was hit with new block

        } else {
            let index = blocks.indexOf(block); //get index of block
            block.draw(ctx, index); //redraw on grid
        }
        
    });
}

//places random RGB values for blocks 
//adds 50 to value to make sure blocks are lighter colored

function randomRGBGenerator() {
    const max = 256 - 50;
    return Math.floor(Math.random() * max) + 50;
}

//places the y axis of new Block between -200 and -450 
function randomYCordinate() {
        const min = 200;
        const max = 400;
    return Math.floor(Math.random() * (max - min) + min) * -1;
}

//function takes the xIndex coordinate and produces a random x value
//for the newly added block to the game array 
function randomXCoordinate(xIndex) {
    let choice = xIndex;
    let x;
    let coordinate = function(max, min) {
        return Math.floor(Math.random() * (max - min) + min);
    };

    switch (choice) {
        case 1: x = coordinate(80, 10);
            break;
        case 2: x = coordinate(190, 130);
            break;
        case 3: x = coordinate(300, 240);
            break; 
        case 4: x = coordinate(480, 400);
            break;
        case 5: x = coordinate(580, 520);
    }
    return x;
}

//function to produce a random block from reserveBlock array
//if the randomly chosen block is not in the current game array it is returned
function randomBlock() {
    let block;
    let index;
    do {
        index = randomArrayIndex();
        block = reserveBlocks[index];
    } while(!notInBlocksArray(block));

    return index;
}

//function to see if the current block is already in the game array 
//if the block is then it will return false
function notInBlocksArray(block) {
    for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].text == block.text) {
            return false;
        } 
    } return true;
}

//function to get a random array index from the reserveBlocks array
// returns a number from 0 to 50 
function randomArrayIndex() {
    let max = 50;
    return Math.floor(Math.random() * max);
}

//instantiates bullet controller to shoot bullets, takes canvas as a parameter
const bulletController = new BulletController(canvas);
//instantiates game player, sets x and y coordinates, as well as adds bullet controller as a parameter
const player = new Player(canvas.width /2.2, canvas.height / 1.1, bulletController);

//game blocks array that appears on the canvas grid
var blocks = [
    new Block(30, -350, '4 + 2 = 6', true, 1), new Block(150, -325, '2 / 2 = 1', true, 2),
    new Block(280, -200,'2 x 2 = 5', false, 3), new Block(400, -225,  '5 x 8 = 40', true, 4),
    new Block(530, -300, '4 x 3 = 11', false, 5)
];

//This array repopulates the blocks game array so theres an endless stream of possible blocks appearing on screen
var reserveBlocks = [   new Block(540, randomYCordinate(), '4 x 3 = 12', true, 5), new Block(545, randomYCordinate(), '4 x 6 = 26', false, 5), //1
                        new Block(560, randomYCordinate(), '11 + 7 = 18', true, 5), new Block(550, randomYCordinate(), '28 / 6 = 7', false, 5), //3
                        new Block(560, randomYCordinate(), '6 / 2 = 3', true, 5), new Block(560, randomYCordinate(), '5 + 0 = 15', false, 5), //5
                        new Block(560, randomYCordinate(), '9 + 6 = 15', true, 5), new Block(556, randomYCordinate(), '16 - 9 = 8', false, 5), //7
                        new Block(540, randomYCordinate(), '4 x 8 = 32', true, 5), new Block(535, randomYCordinate(), '13 + 8 = 22', false, 5),//9
                        new Block(460, randomYCordinate(), '4 + 1 = 5', true, 4), new Block(460, randomYCordinate(), '11 + 12 = 21', false, 4),//11
                        new Block(450, randomYCordinate(), '14 - 5 = 9', true, 4), new Block(430, randomYCordinate(), '8 - 3 = 6', false, 4),//13
                        new Block(410, randomYCordinate(), '16 / 4 = 4', true, 4), new Block(445, randomYCordinate(), '9 + 6 = 17', false, 4),//15
                        new Block(440, randomYCordinate(), '14 x 2 = 28', true, 4), new Block(440, randomYCordinate(), '3 + 1 = 5', false, 4),//17
                        new Block(400, randomYCordinate(), '5 x 8 = 40', true, 4), new Block(480, randomYCordinate(), '13 - 5 = 7', false, 4),//19
                        new Block(280, randomYCordinate(), '14 - 9 = 5', true, 3), new Block(290, randomYCordinate(), '16 / 4 = 6', false, 3), //21
                        new Block(260, randomYCordinate(), '24 / 6 = 4', true, 3), new Block(260, randomYCordinate(), '3 x 1 = 13', false, 3), //23
                        new Block(280, randomYCordinate(), '9 x 7 = 63', true, 3), new Block(230, randomYCordinate(), '2 x 2 = 5', false, 3),//25
                        new Block(260, randomYCordinate(), '7 + 12 = 19', true, 3), new Block(240, randomYCordinate(), '3 x 1 = 4', false, 3),//27
                        new Block(240, randomYCordinate(), '15 / 3 = 5', true, 3), new Block(260, randomYCordinate(), '7 - 3 = 3', false, 3),//29
                        new Block(130, randomYCordinate(), '18 - 13 = 5', true, 2), new Block(184, randomYCordinate(), '2 + 4 = 8', false, 2),//31
                        new Block(150, randomYCordinate(), '13 - 11 = 2', true, 2), new Block(190, randomYCordinate(), '13 - 8 = 6', false, 2), //33
                        new Block(170, randomYCordinate(), '4 + 13 = 17', true, 2), new Block(170, randomYCordinate(), '6 x 8 = 44', false, 2),//35
                        new Block(170, randomYCordinate(), '15 / 3 = 5', true, 2), new Block(180, randomYCordinate(), '26 / 3 = 12', false, 2),//37
                        new Block(180, randomYCordinate(), '2 / 2 = 1', true, 2), new Block(160, randomYCordinate(), '4 x 12 = 52', false, 2),//39
                        new Block(50,  randomYCordinate(), '48 / 4 = 12', true, 1), new Block(80, randomYCordinate(), '4 x 3 = 11', false, 1),//41
                        new Block(70,  randomYCordinate(), '33 x 3 = 99', true, 1), new Block(40, randomYCordinate(), '14 + 8 = 24', false, 1),//43
                        new Block(10,  randomYCordinate(), '15 - 3 = 12', true, 1), new Block(10, randomYCordinate(), '15 - 4 = 13', false, 1),//45
                        new Block(50,  randomYCordinate(), '18 x 3 = 54', true, 1), new Block(50, randomYCordinate(), '12 x 3 = 33', false, 1),//47
                        new Block(30,  randomYCordinate(),  '4 + 2 = 6', true, 1), new Block(40, randomYCordinate(), '8 + 13 = 23', false, 1),//49
                        new Block(24,  randomYCordinate(), '4 + 13 = 18', false, 1) //50
                    ];
