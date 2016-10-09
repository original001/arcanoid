const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

class Vec {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
}

class Rect {
	constructor(w, h) {
		this.pos = new Vec;
		this.size = new Vec(w, h);
	}
	get left() {
		return this.pos.x;
	}

	get right() {
		return this.pos.x + this.size.x;
	}

	get top() {
		return this.pos.y;
	}

	get bottom() {
		return this.pos.y + this.size.y;
	}

	get centerX() {
		return this.pos.x + this.size.x / 2;
	}

	get centerY() {
		return this.pos.y + this.size.y / 2;
	}
}

class Ball extends Rect {
	constructor() {
		super(10, 10);
		this._speedX = 200;
		this._speedY = 200;
		this.vel = new Vec(this._speedX, this._speedY);
	}
	stop() {
		this.vel.x = 0;
		this.vel.y = 0;
	}
	start() {
		this.vel.x = Math.random > .5 ? this._speedX : -this._speedX;
		this.vel.y = -this._speedY;
	}
}

class Player extends Rect {
	constructor() {
		super(100, 10)
		this.pos = new Vec(canvas.width / 2 - this.size.x / 2, canvas.height - 20);
		this.vel = new Vec(10, 10);
	}

	moveRight() {
		if (this.right >= canvas.width) return;
		this.pos.x += this.vel.x
	}

	moveLeft() {
		if (this.left <= 0) return;
		this.pos.x -= this.vel.x
	}
}

class Enemy extends Rect {
	constructor(x, y) {
		super(20, 10);
		this.pos = new Vec(x, y);
	}
	destroy() {
		this.pos = new Vec(-100, 100)
	}
}

class Game {
	constructor() {
		this.init();
		this.attachEvents();
		this.reset();
		this.lastTime = 0;
		this.draw();
	}
	attachEvents() {
		document.body.addEventListener('keydown', event => {
			if (event.keyCode === 39) {
				event.preventDefault();
				this.player.moveRight();
			}
			if (event.keyCode === 37) {
				event.preventDefault();
				this.player.moveLeft();
			}
			if (event.keyCode === 32) {
				event.preventDefault();
				this.start();
			}
		});
	}
	init() {
		this.player = new Player();
		this.ball = new Ball();
		this.genEnemies();
	}
	genEnemies() {
		let enemies = [];
		let h = 20;
		while (150 - h > 0) {
			let w = 0
			while (canvas.width - w > 0) {
				enemies.push(new Enemy(w, h));
				w += 30
			}
			h += 20
		}

		this.enemies = enemies
	}
	reset() {
		this.ball.stop();
		this.ball.pos.x = this.player.centerX - this.ball.size.x / 2;
		this.ball.pos.y = this.player.pos.y - this.ball.size.y;
	}

	start() {
		if (this.ball.vel.x !== 0 && this.ball.vel.y !== 0) return;

		this.ball.start();
	}

	lose() {
		return this.ball.bottom >= canvas.height;
	}

	draw(time = 0) {
		const dt = ((time - this.lastTime)/500).toPrecision(1);
		this.lastTime = time;

		if (this.ball.right >= canvas.width || this.ball.left <= 0) {
			this.ball.vel.x = -this.ball.vel.x;
		}
		if (this.ball.top <= 0) {
			this.ball.vel.y = -this.ball.vel.y;
		}

		var coll = collide(this.ball, this.player)
		if (coll) {
			this.ball.vel = scalar(this.ball.vel, coll);
		}

		this.enemies.forEach(enemy => {
			var coll = collide(this.ball, enemy)
			if (coll) {
				this.ball.vel = scalar(this.ball.vel, coll);
				enemy.destroy()
			}
		})

		this.ball.pos.x += this.ball.vel.x * dt;
		this.ball.pos.y += this.ball.vel.y * dt;

		if (this.lose()) {
			this.reset();
		}

		context.fillStyle = '#333';
		context.fillRect(0, 0, canvas.width, canvas.height);

		fillRect(this.ball)
		fillRect(this.player)
		this.enemies.forEach(enemy => fillRect(enemy));

		requestAnimationFrame(this.draw.bind(this));
	}

}

function fillRect(rect) {
	context.fillStyle = '#eee'
	context.fillRect(rect.pos.x, rect.pos.y, rect.size.x, rect.size.y);
} 

function collide(ball, item) {
	var dtTop = ball.top - item.top;
	var dtBottom = ball.bottom - item.bottom;
	var dtCollideTop = ball.bottom - item.top;
	var dtCollideBottom = ball.top - item.bottom;
	var dtLeft = ball.left - item.left;
	var dtRight = ball.right - item.right;
	var dtCollideLeft = ball.right - item.left;
	var dtCollideRight = ball.left - item.right;

	if (dtCollideBottom <= 0 && dtCollideRight <= 0 && dtCollideLeft >= 0 && dtBottom > 0) {
		if (Math.abs(dtCollideBottom) > Math.abs(dtCollideRight) || Math.abs(dtCollideBottom) > Math.abs(dtCollideLeft))
			return new Vec(-1, 1);
		else
			return new Vec(1, -1);
	}

	if (dtCollideTop > 0 && dtCollideRight < 0 && dtCollideLeft > 0 && dtTop < 0) {
		if (Math.abs(dtCollideTop) > Math.abs(dtCollideRight) || Math.abs(dtCollideTop) > Math.abs(dtCollideLeft))
			return new Vec(-1, 1);
		else
			return new Vec(1, -1);
	}

	if (dtCollideLeft > 0 && dtTop > 0 && dtBottom < 0 && dtLeft < 0) {
		return new Vec(-1, 1);
	}

	if (dtCollideRight < 0 && dtTop > 0 && dtBottom < 0 && dtRight > 0) {
		return new Vec(-1, 1);
	}
}

function scalar(vec1, vec2) {
	return new Vec(vec1.x * vec2.x, vec1.y * vec2.y);
}

new Game;