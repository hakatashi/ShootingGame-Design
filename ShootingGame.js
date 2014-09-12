(function () {
	var Shooting = function () {
		this.width = 400;
		this.height = 600;

		this.queue = new createjs.LoadQueue();

		this.queue.on('complete', this.onComplete, this);
		this.queue.loadManifest([
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

	Shooting.prototype.onComplete = function () {
		this.stage = new createjs.Stage('canvas');
		createjs.Ticker.on('tick', this.ticker, this);

		this.background = new Background(this);
		this.stage.addChild(this.background);
		this.player = new Player(this);
		this.stage.addChild(this.player);
	};

	Shooting.prototype.ticker = function (event) {
		this.background.ticker(event);
		this.player.ticker(event);
		this.stage.update();
	};

	// Background

	var Background = function (shooting) {
		this.initialize();
		this.shooting = shooting;

		this.addChild(new createjs.Bitmap(shooting.queue.getResult('background')));
		this.top = 0;
	};

	Background.prototype = new createjs.Container();

	Background.prototype.ticker = function (event) {
		var background = this;
		var shooting = this.shooting;

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

	var Player = function (shooting) {
		this.initialize();
		this.shooting = shooting;

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
	};

	window.Shooting = Shooting;
})();
