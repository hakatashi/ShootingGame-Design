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
};

Shooting.prototype.onComplete = function () {
	this.stage = new createjs.Stage('canvas');
	createjs.Ticker.on('tick', this.ticker, this);

	this.background = new Shooting.Background(this);
};

Shooting.prototype.ticker = function (event) {
	this.background.ticker(event);
	this.stage.update();
};

Shooting.Background = function (shooting) {
	this.shooting = shooting;

	this.images = [new createjs.Bitmap(shooting.queue.getResult('background'))];
	this.shooting.stage.addChild(this.images[0]);

	this.y = 0;
};

Shooting.Background.prototype.ticker = function (event) {
	var background = this;
	var shooting = this.shooting;

	this.y += event.delta / 1000 * 100;

	if (this.y > 0) {
		var newImage = new createjs.Bitmap(shooting.queue.getResult('background'));

		this.images.unshift(newImage);
		this.y -= newImage.image.height;
		shooting.stage.addChild(newImage);
	};

	var removes = [];

	this.images.reduce(function (y, image, index) {
		if (y <= shooting.height) {
			image.y = y;
		} else {
			shooting.stage.removeChild(image);
			background.images.splice(index);
		}

		return y + image.image.height;
	}, this.y);
};
