var Shooting = function () {
	var shooting = this;

	shooting.initialize = function () {
		shooting.stage = new createjs.Stage('canvas');

		shooting.width = 400;
		shooting.height = 600;

		shooting.queue = new createjs.LoadQueue();

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
		key('up, down, right, left', function () {return false});
	};

	shooting.onComplete = function () {
		createjs.Ticker.on('tick', shooting.ticker);
		shooting.background = new Background();
		shooting.stage.addChild(shooting.background);
		shooting.player = new Player();
		shooting.stage.addChild(shooting.player);
	};

	shooting.ticker = function (event) {
		shooting.stage.children.forEach(function (child) {
			child.ticker(event);
		});
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

		if (key.isPressed('z')) {
			shooting.stage.addChild(new PlayerBullet(this.x, this.y - 20));
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

	shooting.initialize();
};
