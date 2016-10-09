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
		this.vel = new Vec(100, 100);
	}
}

class Player extends Rect {
	constructor() {
		super(100, 10)
		this.pos = new Vec(canvas.width / 2 - this.size.x / 2, canvas.height - 20);
		this.vel = new Vec(5, 5);
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
	constructor() {
		super(150, 150);
		this.pos = new Vec(100, 100);
	}
}

const enemy = new Enemy();

const player = new Player();

const ball = new Ball();

reset();

let lastTime = 0;

function collide(item) {
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

	// left
	if (dtCollideLeft > 0 && dtTop > 0 && dtBottom < 0 && dtLeft < 0) {
		return new Vec(-1, 1);
	}

	// right

	if (dtCollideRight < 0 && dtTop > 0 && dtBottom < 0 && dtRight > 0) {
		return new Vec(-1, 1);
	}


}

function lose() {
	return ball.bottom >= canvas.height;
}

function reset() {
	ball.vel.x = 0;
	ball.vel.y = 0;
	ball.pos.x = player.centerX;
	ball.pos.y = player.pos.y - ball.size.y;
}

function start() {
	if (ball.vel.x !== 0 && ball.vel.y !== 0) return;

	ball.vel.x = Math.random > .5 ? 100 : -100;
	ball.vel.y = -100;
}

function scalar(vec1, vec2) {
	return new Vec(vec1.x * vec2.x, vec1.y * vec2.y);
}

function draw(time = 0) {

	const dt = ((time - lastTime)/500).toPrecision(1);
	lastTime = time;

	if (ball.right >= canvas.width || ball.left <= 0) {
		ball.vel.x = -ball.vel.x;
	}
	if (ball.top <= 0) {
		ball.vel.y = -ball.vel.y;
	}

	if (collide(player)) {
		ball.vel = scalar(ball.vel, collide(player));
	}

	if (collide(enemy)) {
		ball.vel = scalar(ball.vel, collide(enemy));
	}

	ball.pos.x += ball.vel.x * dt;
	ball.pos.y += ball.vel.y * dt;

	if (lose()) {
		reset();
	}

	context.fillStyle = '#333';
	context.fillRect(0, 0, canvas.width, canvas.height);

	context.fillStyle = '#eee'
	context.fillRect(ball.pos.x, ball.pos.y, ball.size.x, ball.size.y);

	context.fillStyle = '#eee'
	context.fillRect(player.pos.x, player.pos.y, player.size.x, player.size.y);

	context.fillStyle = '#eee'
	context.fillRect(enemy.pos.x, enemy.pos.y, enemy.size.x, enemy.size.y);

	requestAnimationFrame(draw);
}

document.body.addEventListener('keydown', event => {
	if (event.keyCode === 39) {
		event.preventDefault();
		player.moveRight();
	}
	if (event.keyCode === 37) {
		event.preventDefault();
		player.moveLeft();
	}
	if (event.keyCode === 32) {
		event.preventDefault();
		start();
	}
})

draw();