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
		this._color = '#eee';
	}
	get color() {
		return this._color;
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
		this._speedX = 150;
		this._speedY = 150;
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
		this.pos = new Vec(canvas.width / 2 - this.size.x / 2, canvas.height - 10);
		this.vel = new Vec(10, 10);
	}

	moveRight() {
		if (this.right >= canvas.width || this._isBlocked) return;
		this.pos.x += this.vel.x
	}

	moveLeft() {
		if (this.left <= 0 || this._isBlocked) return;
		this.pos.x -= this.vel.x
	}

	block() {
		this._isBlocked = true;
	}

	unblock() {
		this._isBlocked = false;
	}
}

class Enemy extends Rect {
	constructor(x, y) {
		super(20, 10);
		this.pos = new Vec(x, y);
	}
	destroy() {
		if (--this.lives === 0) return true;
	}
}

class SimpleEnemy extends Enemy {
	constructor(x, y) {
		super(x, y);
		this.lives = 1;
	}
}

class SuperEnemy extends Enemy {
	constructor(x, y) {
		super(x, y);
		this.lives = 2;
		this._color = '#ff6600';
	}

	get color() {
		switch(this.lives) {
			case 2:
				return this._color;
				break;
			case 1:
				return '#eee';
				break;
		}
	}
}

class Game {
	constructor() {
		this.init();
		this.attachEvents();
		this.reset();
		this.lastTime = 0;
		this.draw();
		this.score = 0;
		this.lives = 3;
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
		const enemiesMap = [
			'1012112101',
			'1211111121',
			'0210220120',
			'0210220120',
			'1211111121',
			'1012112101',
			]
		let enemies = [];

		enemiesMap.forEach((row, y) => {
			row.split('').forEach((ememy, x) => {
				let item;
				switch (ememy) {
					case '1':
						item =  new SimpleEnemy(x * 20 + x * 10, 30 + y * 20);
						break;
					case '2':
						item =  new SuperEnemy(x * 20 + x * 10, 30 + y * 20);
						break;
				}
				item && enemies.push(item);
			})
		})

		// let h = 20;
		// while (150 - h > 0) {
		// 	let w = 0
		// 	while (canvas.width - w > 0) {
		// 		enemies.push(new SuperEnemy(w, h));
		// 		w += 30
		// 	}
		// 	h += 20
		// }

		this.enemies = enemies
	}
	reset() {
		this.ball.stop();
		this.isHooked = true;
	}

	start() {
		if (this.ball.vel.x !== 0 && this.ball.vel.y !== 0) return;

		if (this.isGameOver) {
			this.player.unblock();
			this.lives = 3;
			this.score = 0;
			this.genEnemies();
			this.isGameOver = false;
		}

		this.ball.start();
		this.isHooked = false;
	}

	lose() {
		return this.ball.bottom >= canvas.height;
	}

	gameEnd() {
		this.reset();
		this.player.block();
		this.isGameOver = true;
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

		this.enemies.forEach((enemy, ind) => {
			var coll = collide(this.ball, enemy)
			if (coll) {
				this.ball.vel = scalar(this.ball.vel, coll);
				if (enemy.destroy()) {
					delete this.enemies[ind];
				}
				this.score++;
			}
		})

		this.ball.pos.x += this.ball.vel.x * dt;
		this.ball.pos.y += this.ball.vel.y * dt;

		if (this.isHooked) {
			this.ball.pos.x = this.player.centerX - this.ball.size.x / 2;
			this.ball.pos.y = this.player.pos.y - this.ball.size.y;
		}

		if (this.lose()) {
			this.reset();
			this.lives--;
		}


		context.fillStyle = '#333';
		context.fillRect(0, 0, canvas.width, canvas.height);

		fillRect(this.ball)
		fillRect(this.player)
		this.enemies.forEach(enemy => fillRect(enemy));

		context.fillStyle = this.ball.color;
		context.font = '14px monospace';
		context.textAlign = 'left';
		context.fillText(`Score: ${this.score}`, 10, 15);

		context.textAlign = 'right';
		context.fillText(`Lives: ${this.lives}`, canvas.width - 10, 15);

		if (this.lives === 0) {
			context.font = '24px monospace';
			context.textAlign = 'center';
			context.fillText(`Game Over`, canvas.width / 2, canvas.height / 2);
			this.gameEnd();
		}

		if (!this.enemies.some(enemy => !!enemy)) {
			context.font = '24px monospace';
			context.textAlign = 'center';
			context.fillText(`Win!`, canvas.width / 2, canvas.height / 2);
			this.gameEnd();
		}

		requestAnimationFrame(this.draw.bind(this));
	}

}

function fillRect(rect) {
	if (!rect) return;
	context.fillStyle = rect.color;
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