class TestScene extends Scene {
	ep400:Sprite;
	map:Sprite;
	map2:Sprite;

	constructor(game:Game) {
		super(game);
		this.ep400 = new Sprite(400, 200, game.r("ep400"));
		this.ep400.moveTo(0, 0);
		this.append(this.ep400);

		this.map = new Sprite(400, 200, window.createCanvas(400, 200));
		this.map.moveTo(0, 200);
		this.append(this.map);

		this.map2 = new Sprite(400, 200, window.createCanvas(400, 200));
		this.map2.moveTo(0, 400);
		this.append(this.map2);
	}
}

class MapScene extends Scene {
	world:jgwg.World;
	pixel:Pixel;
	pixel2:Pixel;
	constructor(game:Game) {
		super(game);
		this.world = new jgwg.World(400, 200);
		var map = new jgwg.Map.MapGenerator();
		map.addModule(new jgwg.Map.Altitude());
		map.addModule(new jgwg.Map.Altitude());
		map.addModule(new jgwg.Map.Altitude());
		this.world.addTask(map);

		var l1 = this.createLayer("l1");
		this.pixel = new Pixel(400, 200);
		this.pixel.clear(255, 255, 255, 255);
		this.pixel.moveTo(0, 0);
		l1.append(this.pixel);

		var l2 = this.createLayer("l2");
		this.pixel2 = new Pixel(400, 200);
		this.pixel2.clear(255, 255, 255, 255);
		this.pixel2.moveTo(0, 200);
		l2.append(this.pixel2);

		this.started.handle(this, () => {
			this.game.update.handle(this, this.step);
			this.started.removeAll(this);
		});
	}

	createTexture() {
		var sprite = this.pixel.createSprite();
		return sprite.image;
	}	

	createMap(map?:jgwg.Map.Chip[][]) {
		var pixel = new Pixel(this.pixel.width, this.pixel.height);
		var d = pixel.imageData.data;
		if (map === undefined) {
			map = this.world.map;
			//map = jgwg.Map.Util.Sanson2EP(this.world, this.world.map);
		}
		var w = map.length;
		var h = map[0].length;
		for (var x=0; x<w; x++) {
			for (var y=0; y<h; y++) {
				var index = x*4+y*w*4;
				var r,g,b;
				if (map[x][y].l <= 0) {
					r = 0;
					g = 0;
					//b = 255;
					b = (205+Math.floor(map[x][y].l * 0.02)) + 50;
				} else {
					r = 0;
					g = 255;
					b = 0;
				}
				d[index  ] = r;
				d[index+1] = g;
				d[index+2] = b;
				d[index+3] = 255;
			}
		}
		return pixel.createSprite().image;
	}

	createBumpMap(map?:jgwg.Map.Chip[][]) {
		var pixel = new Pixel(this.pixel.width, this.pixel.height);
		var d = pixel.imageData.data;
		if (map === undefined) {
			map = this.world.map;
			//map = jgwg.Map.Util.Sanson2EP(this.world, this.world.map);
		}
		var w = map.length;
		var h = map[0].length;
		for (var x=0; x<w; x++) {
			for (var y=0; y<h; y++) {
				var index = x*4+y*w*4;
				var rgb;
				if (map[x][y].l <= 0) {
					rgb = 0;
				} else {
					rgb = map[x][y].l * 0.05;
					if (rgb > 255)
						rgb = 255;
				}
				d[index  ] = rgb;
				d[index+1] = rgb;
				d[index+2] = rgb;
				d[index+3] = 255;
			}
		}
		return pixel.createSprite().image;
	}

	step() {
		var ret = this.world.step();
		if (ret === false)
			this.game.update.remove(this, this.step);
		this.world.render(this.pixel.imageData);
		this.pixel.updated();
	}
}