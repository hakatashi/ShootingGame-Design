var Shooting = function () {
	var shooting = this;

	shooting.initialize = function () {
		shooting.stage = new createjs.Stage('canvas');

		shooting.width = 400;
		shooting.height = 600;

		shooting.queue = new createjs.LoadQueue(false);

		shooting.queue.on('complete', shooting.onComplete);
		shooting.queue.loadManifest([
			'background',
			'bullet1',
			'bullet2',
			'enemy',
			'player',
			'playerbullet',
		].map(function (id) {
			return {id: id, src: 'images/' + id + '.png', type: createjs.LoadQueue.IMAGE};
		}), true);

		createjs.Ticker.setFPS(60);

		// prevent defaults
		key('up, down, right, left, shift, z', function () {return false});
	};

	shooting.onComplete = function () {
		createjs.Ticker.on('tick', shooting.ticker);

		shooting.background = new Background();
		shooting.stage.addChild(shooting.background);

		shooting.player = new Player();
		shooting.stage.addChild(shooting.player);

		shooting.playerBullets = new PlayerBullets();
		shooting.stage.addChild(shooting.playerBullets);

		shooting.bullets = new Bullets();
		shooting.stage.addChild(shooting.bullets);

		shooting.enemy = new Enemy();
		shooting.stage.addChild(shooting.enemy);

		shooting.game = new Game(1);
	};

	shooting.ticker = function (event) {
		shooting.stage.children.forEach(function (child) {
			child.ticker(event);
		});

		shooting.game.ticker(event);

		shooting.stage.update();
	};

	// Background

	var Background = function () {
		this.initialize();

		this.addChild(new createjs.Bitmap(shooting.queue.getResult('background')));
		this.top = 0;
	};

	Background.prototype = new createjs.Container();

	Background.prototype.ticker = function (event) {
		var background = this;

		this.top += event.delta / 1000 * 100;

		if (this.top > 0) {
			var newImage = new createjs.Bitmap(shooting.queue.getResult('background'));
			this.addChild(newImage);
			this.top -= newImage.image.height;
		};

		this.children.reduce(function (y, image) {
			if (y <= shooting.height) {
				image.y = y;
			} else {
				background.removeChild(image);
			}

			return y + image.image.height;
		}, this.top);
	};

	// Player

	var Player = function () {
		this.initialize();

		this.image = new createjs.Bitmap(shooting.queue.getResult('player'))
		this.image.x = - this.image.image.width / 2;
		this.image.y = - this.image.image.height / 2;
		this.addChild(this.image);

		this.x = shooting.width / 2;
		this.y = shooting.height * 0.75;

		this.v = 300;
	};

	Player.prototype = new createjs.Container();

	Player.prototype.ticker = function (event) {
		if (key.shift) this.v = 100;
		else this.v = 300;

		var direction = {x: 0, y: 0};

		if (key.isPressed('right')) direction.x += 1;
		if (key.isPressed('left'))  direction.x -= 1;
		if (key.isPressed('up'))    direction.y -= 1;
		if (key.isPressed('down'))  direction.y += 1;

		this.x += direction.x * event.delta / 1000 * this.v;
		this.y += direction.y * event.delta / 1000 * this.v;

		this.x = Math.min(shooting.width, Math.max(0, this.x));
		this.y = Math.min(shooting.height, Math.max(0, this.y));

		if (key.isPressed('z')) {
			shooting.playerBullets.addChild(new PlayerBullet(this.x, this.y - 20));
		}
	};

	// PlayerBullet

	var PlayerBullet = function (x, y) {
		this.initialize();

		this.image = new createjs.Bitmap(shooting.queue.getResult('playerbullet'))
		this.image.x = - this.image.image.width / 2;
		this.image.y = - this.image.image.height / 2;
		this.addChild(this.image);

		this.x = x;
		this.y = y;
	};

	PlayerBullet.prototype = new createjs.Container();

	PlayerBullet.prototype.ticker = function (event) {
		this.y -= event.delta / 1000 * 1000;

		if (this.y < 0) shooting.stage.removeChild(this);
	};

	// PlayerBullets

	var PlayerBullets = function () {
		this.initialize();
	};

	PlayerBullets.prototype = new createjs.Container();

	PlayerBullets.prototype.ticker = function (event) {
		this.children.forEach(function (child) {
			child.ticker(event);
		});
	};

	// Enemy

	var Enemy = function () {
		this.initialize();

		this.image = new createjs.Bitmap(shooting.queue.getResult('enemy'))
		this.image.x = - this.image.image.width / 2;
		this.image.y = - this.image.image.height / 2;
		this.addChild(this.image);

		this.x = shooting.width / 2;
		this.y = shooting.height * 0.3;

		this.hp = 1000;
		this.size = 50;
	};

	Enemy.prototype = new createjs.Container();

	Enemy.prototype.ticker = function (event) {
		var enemy = this;

		shooting.playerBullets.children.forEach(function (playerBullet) {
			if (distance(playerBullet, enemy) < enemy.size) {
				shooting.playerBullets.removeChild(playerBullet);
				enemy.hp -= 1;
			}
		});
	};

	// Bullet

	var Bullet = function (image, x, y, v, angle) {
		this.initialize();

		this.image = new createjs.Bitmap(shooting.queue.getResult(image))
		this.image.x = - this.image.image.width / 2;
		this.image.y = - this.image.image.height / 2;
		this.addChild(this.image);

		this.x = x;
		this.y = y;

		this.tick = 0;

		this.v = v;
		this.rotation = angle;
		this.angle = angle
	};

	Bullet.prototype = new createjs.Container();

	Bullet.prototype.ticker = function (event) {
		var margin = 10;

		this.x += Math.sin(this.angle / 180 * Math.PI) * this.v * event.delta / 1000;
		this.y -= Math.cos(this.angle / 180 * Math.PI) * this.v * event.delta / 1000;

		if (
			this.x < -margin
			|| shooting.width + margin < this.x
			|| this.y < -margin
			|| shooting.height + margin < this.y
		) {
			shooting.bullets.removeChild(this);
			return;
		}

		this.tick++;

		this.rotation = this.angle;
	};

	// Bullets

	var Bullets = function () {
		this.initialize();

		this.compositeOperation = 'lighter';
	};

	Bullets.prototype = new createjs.Container();

	Bullets.prototype.ticker = function (event) {
		this.children.forEach(function (child) {
			child.ticker(event);
		});
	};

	Bullets.prototype.clear = function () {
		this.children.forEach(function (child) {
			this.removeChild(child);
		});
	};

	// Game Controller

	var Game = function (level) {
		this.level = level;
		this.phase = 'initialize';
		this.tick = 0;
		this.children = [];
	};

	Game.prototype.ticker = function (event) {
		switch (this.level) {
			case 0:
				if (this.tick % 200 === 0) {
					var angle = Math.random() * Math.PI;
					this.addChild(new Level1(false, angle));
					this.addChild(new Level1(true, angle));
				}
				break;
			case 1:
				if (this.tick === 0) {
					this.addChild(new Level2());
				}
				break;
		}

		this.children.forEach(function (child) {
			child.ticker(event);
		});

		this.tick++;
	};

	Game.prototype.addChild = function (child) {
		this.children.push(child);
	};

	Game.prototype.removeChild = function (childToRemove) {
		var game = this;

		for (var i = 0; i < this.children.length; i++) {
			if (this.children[i] === childToRemove) {
				this.children.splice(i, 1);
				return;
			}
		}
	}

	// Level1

	var Level1 = function (type, angle) {
		var level1 = this;

		this.tick = 0;
		this.type = type;

		this.angle = angle;

		this.vertices = [0, 1, 2, 3, 4, 5].map(function (vertex, index) {
			var angle = Math.PI * 2 / 5 * index * 2 + level1.angle + (level1.type ? 0 : Math.PI);
			var radial = level1.type ? 120 : 200;
			return {
				x: Math.sin(angle) * radial + shooting.enemy.x,
				y: -Math.cos(angle) * radial + shooting.enemy.y
			};
		});

		this.phase = 'writeStar';
	};

	Level1.prototype.ticker = function (event) {
		var level1 = this;

		switch (this.phase) {
			case 'writeStar':
				for (var i = 0; i < 3; i++) {
					if (location.href.substr(-9) !== '?moderate' || i === 0) {
						var index = Math.floor(this.tick / 50);
						var order = this.tick % 50;
						if (index >= 5) {
							this.goto('waitBeforeFlare');
							break;
						}

						var from = this.vertices[index];
						var to = this.vertices[index + 1];

						var bullet = new Bullet(
							'bullet1',
							from.x + (to.x - from.x) / 50 * order,
							from.y + (to.y - from.y) / 50 * order,
							0, Math.random() * 360
						);
						bullet._v = 100 + Math.random() * 100;
						bullet._flare = 'wait';
						bullet._parent = this;
						shooting.bullets.addChild(bullet);
					}

					this.tick++;
				}
				this.tick--;
				break;
			case 'waitBeforeFlare':
				if (this.tick >= (this.type ? 100 : 10)) {
					this.tick = -1;
					this.phase = 'flare';
					shooting.bullets.children.forEach(function (bullet) {
						if (bullet._flare === 'wait' && bullet._parent === level1) {
							bullet._flare = 'flaring';
						}
					});
				}
				break;
			case 'flare':
				var duration = this.type ? 150 : 200;

				shooting.bullets.children.forEach(function (bullet) {
					if (bullet._flare === 'flaring' && bullet._parent === level1) {
						bullet.v = bullet._v * level1.tick / duration;
						if (level1.tick === duration) bullet._flare = 'flared';
					}
				});

				if (level1.tick === duration) {
					shooting.game.removeChild(this);
				}
				break;
		}

		this.tick++;
	};

	Level1.prototype.wait = function (ticks, nextPhase) {
		if (this.tick >= ticks) {
			this.tick = -1;
			this.phase = nextPhase;
		}
	};

	Level1.prototype.goto = function (phase) {
		this.tick = -1;
		this.phase = phase;
	};

	// Level2

	var Level2 = function () {
		var Level2 = this;

		this.tick = 0;
		this.cnt = 0;
	};

	Level2.prototype.ticker = function (event) {
		var Level2 = this;

		for (var i = 0; i < 3; i++) {
			var bullet = new Bullet('bullet2', shooting.enemy.x, shooting.enemy.y, 1000, this.cnt * 11);
			bullet._baseAngle = bullet.angle;
			bullet._wind = Math.sin(this.cnt / 300) * (this.cnt % 2 ? 1 : -1) * 50;
			shooting.bullets.addChild(bullet);
			this.cnt++;
		}

		shooting.bullets.children.forEach(function (bullet) {
			if (bullet.tick > 3) {
				bullet.v = Math.max(100, bullet.v - 50);
				bullet.angle = bullet._baseAngle + (1000 - bullet.v) / 900 * bullet._wind;
			}
		});

		this.tick++;
	};

	// utils

	var distance = function (a, b) {
		return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
	};

	shooting.initialize();
};
