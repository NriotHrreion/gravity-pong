/* Copyright (c) NriotHrreion 2024 */
var app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight });
document.body.appendChild(app.view);

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
    }

    getMultiplied(n) {
        return new Vector(this.x * n, this.y * n);
    }

    get length() {
        return Math.sqrt(this.x * this.x, this.y * this.y);
    }
}

const g = new Vector(0, 5); // gravity

class Pong {
    constructor(app) {
        this.app = app;
        this.hasBegun = false;
        this.ticker = (delta) => this.render(delta);

        this.init();
        this.registerListeners();
    }

    init() {
        this.turn = "right"; // left, right
        this.ball = new Ball(50, 50);
        this.boardLeft = new Board(0, 0);
        this.boardRight = new Board(window.innerWidth - Board.size, 0);

        // Render the first frame
        this.render(0);
    }

    registerListeners() {
        document.body.addEventListener("keydown", (e) => {
            if(!this.hasBegun) {
                this.hasBegun = true;
                this.start();
                return;
            }

            switch(e.key) {
                case "ArrowUp":
                    this.turn === "left"
                    ? this.boardLeft.moving = 1
                    : this.boardRight.moving = 1;
                    break;
                case "ArrowDown":
                    this.turn === "left"
                    ? this.boardLeft.moving = -1
                    : this.boardRight.moving = -1;
                    break;
            }
        });

        document.body.addEventListener("keyup", () => this.boardLeft.moving = this.boardRight.moving = 0);

        this.app.view.addEventListener("click", () => {
            if(this.hasBegun) return;

            this.hasBegun = true;
            this.start();
        });
    }

    start() {
        this.app.ticker.add(this.ticker);
    }

    render(delta) {
        // Reset Canvas
        if(this.frame) this.app.stage.removeChild(this.frame);
        this.frame = new PIXI.Graphics();
    
        // Ball
        this.ball.render(this, delta);
        // Board
        this.boardLeft.render(this, delta);
        this.boardRight.render(this, delta);
        // Player Left Score
        var leftScoreText = new PIXI.Text(this.boardLeft.score.toString(), {
            fontSize: 64,
            fill: 0xffffff
        });
        leftScoreText.x = 200;
        leftScoreText.y = 50;
        this.frame.addChild(leftScoreText);
        // Player Right Score
        var rightScoreText = new PIXI.Text(this.boardRight.score.toString(), {
            fontSize: 64,
            fill: 0xffffff
        });
        rightScoreText.x = window.innerWidth - rightScoreText.width - 200;
        rightScoreText.y = 50;
        this.frame.addChild(rightScoreText);
        // Starting text
        if(!this.hasBegun) {
            var startingText = new PIXI.Text("Press any key to start...", {
                fontSize: 34,
                fill: 0xffffff
            });
            startingText.x = window.innerWidth / 2 - startingText.width / 2;
            startingText.y = window.innerHeight / 2 - startingText.height / 2;
            this.frame.addChild(startingText);
        }

        this.app.stage.addChild(this.frame);
    }
}

class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.speed = new Vector(getRandom(10, 35), 0);
    }

    render(game, delta) {
        // Move
        this.speed.add(g.getMultiplied(delta));
        this.x += this.speed.x;
        this.y += this.speed.y;

        if(this.y >= window.innerHeight - this.radius) {
            this.speed.y = -this.speed.y;
            this.y = window.innerHeight - this.radius;
        }

        if(this.y <= this.radius) {
            this.speed.y = -this.speed.y;
            this.y = this.radius;
            this.speed.y = 20;
        }

        if(
            game.turn === "left" &&
            this.x <= Board.size + this.radius &&
            (this.y >= game.boardLeft.top && this.y <= game.boardLeft.top + game.boardLeft.length)
        ) {
            this.speed.x = -this.speed.x;
            this.x = Board.size + this.radius;
            this.speed.x = getRandom(10, 35);
            this.speed.y -= 50;

            game.boardLeft.score++;
            game.turn = "right";
        } else if(this.x <= this.radius) {
            this.speed.x = -this.speed.x;
            this.x = this.radius;
            this.speed.x = getRandom(10, 35);
            this.speed.y -= 50;

            game.boardLeft.score--;
            game.turn = "right"
        }

        if(
            game.turn === "right" &&
            this.x >= window.innerWidth - Board.size - this.radius &&
            (this.y >= game.boardRight.top && this.y <= game.boardRight.top + game.boardRight.length)
        ) {
            this.speed.x = -this.speed.x;
            this.x = window.innerWidth - Board.size - this.radius;
            this.speed.x = -getRandom(10, 35);
            this.speed.y -= 50;

            game.boardRight.score++;
            game.turn = "left";
        } else if(this.x >= window.innerWidth - this.radius) {
            this.speed.x = -this.speed.x;
            this.x = window.innerWidth - this.radius;
            this.speed.x = -getRandom(10, 35);
            this.speed.y -= 50;

            game.boardRight.score--;
            game.turn = "left";
        }

        game.frame.beginFill(0xffffff);
        game.frame.drawCircle(this.x, this.y, this.radius);
        game.frame.endFill();
    }
}

class Board {
    static size = 10;

    constructor(x, y) {
        this.x = x;
        this.top = y;
        this.length = window.innerHeight * .4;
        this.speed = 10;
        this.score = 0;

        this.moving = 0;
    }

    render(game, delta) {
        if(this.moving === 1 && this.top > 0) this.top -= this.speed;
        if(this.moving === -1 && this.top < window.innerHeight - this.length) this.top += this.speed;

        game.frame.beginFill(0xffffff);
        game.frame.drawRect(this.x, this.top, Board.size, this.length);
        game.frame.endFill();
    }
}

// Launch the Game
new Pong(app);

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
