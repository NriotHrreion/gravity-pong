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

    multiply(n) {
        this.x *= n;
        this.y *= n;
    }

    get length() {
        return Math.sqrt(this.x * this.x, this.y * this.y);
    }
}

const g = new Vector(0, 4); // gravity

class Pong {
    constructor(app) {
        this.app = app;
        this.hasBegun = false;

        this.init();
    }

    init() {
        this.score = 0;
        this.ball = new Ball(50, 50);
        this.board = new Board(0);

        // Render the first frame
        this.render(0);

        // Listeners
        document.body.addEventListener("keydown", (e) => {
            if(!this.hasBegun) {
                this.hasBegun = true;
                this.start();
                return;
            }

            switch(e.key) {
                case "ArrowUp":
                    this.board.moving = 1;
                    break;
                case "ArrowDown":
                    this.board.moving = -1;
                    break;
            }
        });

        document.body.addEventListener("keyup", () => this.board.moving = 0);

        this.app.view.addEventListener("click", () => {
            if(this.hasBegun) return;

            this.hasBegun = true;
            this.start();
        });
    }

    start() {
        this.app.ticker.add((delta) => this.render(delta));
    }

    render(delta) {
        // Reset Canvas
        if(this.frame) this.app.stage.removeChild(this.frame);
        this.frame = new PIXI.Graphics();
    
        // Ball
        this.ball.render(this, delta);
        // Board
        this.board.render(this, delta);
        // Score
        var scoreText = new PIXI.Text(this.score.toString(), {
            fontSize: 36,
            fill: 0xffffff
        });
        scoreText.x = window.innerWidth - scoreText.width - 50;
        scoreText.y = 50;
        this.frame.addChild(scoreText);
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

    restart() {
        window.location.reload();
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
        this.speed.add(g);
        this.x += this.speed.x;
        this.y += this.speed.y;

        if(this.y >= window.innerHeight - this.radius) {
            this.speed.y = -this.speed.y;
            this.y = window.innerHeight - this.radius;
        }

        if(this.x >= window.innerWidth - this.radius) {
            this.speed.x = -this.speed.x;
            this.x = window.innerWidth - this.radius;
            this.speed.x = -getRandom(10, 35);
            this.speed.y -= 50;
        }

        if(this.y <= this.radius) {
            this.speed.y = -this.speed.y;
            this.y = this.radius;
            this.speed.y = 20;
        }

        if(
            (this.x <= game.board.size + this.radius) &&
            (this.y >= game.board.top && this.y <= game.board.top + game.board.length)
        ) {
            this.speed.x = -this.speed.x;
            this.x = game.board.size + this.radius;
            this.speed.x = getRandom(10, 35);
            this.speed.y -= 50;

            game.score++;
        } else if(this.x <= 0) {
            game.restart();
        }

        game.frame.beginFill(0xffffff);
        game.frame.drawCircle(this.x, this.y, this.radius);
        game.frame.endFill();
    }
}

class Board {
    constructor(top) {
        this.top = top;
        this.size = 10;
        this.length = 400;
        this.speed = 10;

        this.moving = 0;
    }

    render(game, delta) {
        if(this.moving === 1 && this.top > 0) this.top -= this.speed;
        if(this.moving === -1 && this.top < window.innerHeight - this.length) this.top += this.speed;

        game.frame.beginFill(0xffffff);
        game.frame.drawRect(0, this.top, this.size, this.length);
        game.frame.endFill();
    }
}

// Launch the Game
new Pong(app);

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
