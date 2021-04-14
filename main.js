let deg2rad = (deg) => {
	return deg * (Math.PI / 180);
};
let rad2deg = (rad) => {
	return rad * (180 / Math.PI);
};
let randomNumber = (min, max) => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

let LEFT = false;
let RIGHT = false;

document.onkeydown = (e) => {
	if (e.keyCode == 37) LEFT = true;
	if (e.keyCode == 39) RIGHT = true;
};

document.onkeyup = (e) => {
	if (e.keyCode == 37) LEFT = false;
	if (e.keyCode == 39) RIGHT = false;
};

let score = 0;
let boxes = [];
let orbs = [];
let players = [];
let time = new Date();
let speed = 0.5;
let gameOver = '';
let boxDifficulty = [
	{ difficulty: 0, color: '#32a852' },
	{ difficulty: 1, color: '#d6ed09' },
	{ difficulty: 2, color: '#ed7e07' },
	{ difficulty: 3, color: '#e61c09' },
];

let createBoxes = () => {
	let id = 0;
	for (let i = 1; i <= 4; i++) {
		//5
		for (let j = 0; j <= 11; j++) {
			//31
			let x = 150 * j;
			let y = i * 50;
			boxes.push({
				id: id,
				x: x,
				y: y,
				width: 150,
				height: 50,
				difficulty: boxDifficulty[randomNumber(0, 3)],
				destroyed: false,
			});
			id++;
		}
	}
};

let drawBoxes = (ctx) => {
	boxes.forEach((box) => {
		if (!box.destroyed) {
			ctx.beginPath();
			ctx.strokeStyle = 'black';
			ctx.fillStyle = box.difficulty.color;
			ctx.fillRect(box.x, box.y, box.width, box.height);
			ctx.strokeRect(box.x, box.y, box.width, box.height);
			ctx.stroke();
		}
	});
};

let createOrb = (el) => {
	let x = Math.floor(el.width / 2);
	let y = Math.floor(el.height / 1.1);
	let angle = Math.floor(Math.random() * -180);
	orbs.push({ x: x, y: y, angle: angle });
};

let drawOrb = (ctx, el) => {
	orbs.forEach((orb) => {
		ctx.beginPath();
		ctx.arc(orb.x, orb.y, 5, 0, 2 * Math.PI);
		orb.x += Math.cos(deg2rad(orb.angle)) / speed;
		orb.y += Math.sin(deg2rad(orb.angle)) / speed;
		ctx.fillStyle = '#5F5F5F';
		ctx.fill();
		ctx.closePath();
		if (orb.x < 0 || orb.x > el.width) orb.angle = 180 - orb.angle;
		if (orb.y < 0 || orb.y > el.height) orb.angle = 360 - orb.angle;
		let distPlayer = Math.abs(orb.x - players[0].x - 200 / 2);
		if (orb.y + 5 > players[0].y && distPlayer < 95) {
			orb.angle = 360 - orb.angle;
		}
	});
};

let drawPlayer = (ctx, el) => {
	let x = players[0].x;
	let y = players[0].y;
	ctx.fillStyle = '#FFFFFF';
	ctx.beginPath();
	ctx.moveTo(players[0].x, players[0].y);
	ctx.fillRect(x, y, 200, 20);
	ctx.strokeRect(x, y, 200, 20);
	ctx.fill();
	if (players[0].x < 0) {
		LEFT = false;
	}

	if (players[0].x + 200 > el.width) {
		RIGHT = false;
	}
	ctx.closePath();
};

let createPlayer = (el) => {
	let x = Math.floor(el.width / 2 - 200);
	let y = Math.floor(el.height / 1.07);
	let speed = 2;
	players.push({ x: x, y: y, speed: speed });
};

let collision = () => {
	boxes.forEach((box) => {
		if (
			orbs[0].x >= box.x &&
			orbs[0].x <= box.x + box.width &&
			orbs[0].y >= box.y &&
			orbs[0].y <= box.y + box.height &&
			box.destroyed === false
		) {
			console.log(box.difficulty);
			if (box.difficulty.difficulty > 0) {
				boxes[box.id].difficulty = boxDifficulty[box.difficulty.difficulty - 1];
				score++;
			} else {
				box.destroyed = true;
				score++;
			}
			if (orbs[0].x >= box.x || orbs[0].x <= box.width) {
				orbs[0].angle = 360 - orbs[0].angle;
				return true;
			}
			if (orbs[0].y >= box.y || orbs[0].y > box.height) {
				orbs[0].angle = 360 - orbs[0].angle;
				return true;
			}
			return true;
		} else {
			return false;
		}
	});
};

let isFinished = () => {
	if (boxes.length === 0) {
		gameOver = 'You Won!';
		return true;
	} else if (orbs[0].y > players[0].y) {
		gameOver = 'Game over!';
		return true;
	}
};

let movePlayer = (el) => {
	if (LEFT) {
		if (players[0].x < 0) {
			LEFT = false;
		} else {
			players[0].x -= players[0].speed;
		}
	}
	if (RIGHT) {
		if (players[0].x + 200 > el.width) {
			RIGHT = false;
		} else {
			players[0].x += players[0].speed;
		}
	}
};

let information = (ctx) => {
	ctx.font = '26px Verdana';
	ctx.fillText(`Score: ${score}`, 6, 800);
	ctx.fillText(
		`Blocks left: ${boxes.filter((x) => !x.destroyed).length}`,
		6,
		850
	);
	ctx.fillText(
		`Time: ${(new Date().getTime() - time.getTime()) / 1000}`,
		6,
		900
	);
};

window.addEventListener('load', (event) => {
	let el = document.querySelector('#canvas');
	el.width = window.innerWidth;
	el.height = window.innerHeight;
	let ctx = el.getContext('2d');
	createBoxes();
	createOrb(el);
	createPlayer(el);
	let interval = setInterval(() => {
		movePlayer(el);
		collision();
		ctx.clearRect(0, 0, el.width, el.height);
		information(ctx);
		if (isFinished()) {
			ctx.font = '40px Verdana';
			ctx.fillText(`${gameOver}`, el.width / 2 - 200, el.height / 2);
			clearInterval(interval);
		}
		drawPlayer(ctx, el);
		drawBoxes(ctx);
		drawOrb(ctx, el);
	});
});
