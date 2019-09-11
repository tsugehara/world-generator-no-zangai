module jgwg {
	var debug = (val:string) => {
		console.log(val);
	}
	export class World {
		tasks:Task[];
		index:number;
		map:Map.Chip[][];
		scale:CommonOffset;
		width:number;
		height:number;
		w2:number;
		h2:number;

		constructor(width:number, height:number) {
			this.tasks = new Task[];
			this.width = width ? width : 400;
			this.height = height ? height : 200;
			this.w2 = this.width / 2;
			this.h2 = this.height / 2;
			this.scale = {
				x: 180 / (this.w2),
				y: 90 / (this.h2)
			}
			this.index = 0;
		}

		getLatitude(y:number) {
			return (this.h2-y) * this.scale.y;
		}
		getLongitude(x:number) {
			return (this.w2-x) * this.scale.x;
		}

		addTask(task:Task) {
			task.world = this;
			this.tasks.push(task);
		}

		step():bool {
			this.index++;
			if (this.tasks.length == 0)
				return false;
			if (this.tasks[0].step() == false) {
				this.tasks.splice(0, 1);
				if (this.tasks.length == 0)
					return false;
			}
			return true;
		}

		render(imageData:ImageData, map?:Map.Chip[][]) {
			var imgData = imageData.data;
			var w = imageData.width;
			var h = imageData.height;
			//var generator = <Map.MapGenerator>this.tasks[0];
			if (map === undefined)
				map = this.map;
			for (var x=0; x<w; x++) {
				for (var y=0; y<h; y++) {
					if (map[x][y].disable)
						continue;
					var l = Math.floor(map[x][y].l * 0.02);
					//R
					imgData[x * 4 + y * w * 4] = 0;
					//G
					if (l > 0) {
						imgData[1 + x * 4 + y * w * 4] = (205 - l) + 50;
					} else {
						imgData[1 + x * 4 + y * w * 4] = 0;
					}
					//B
					if (l <= 0) {
						imgData[2 + x * 4 + y * w * 4] = (205+l) + 50;
					} else {
						imgData[2 + x * 4 + y * w * 4] = 0;
					}
				}
			}
		}
	}

	export class Module {
		task:Task;
		index:number;
		constructor() {
			this.index = 0;
		}

		step():bool {
			if (this.index == 0)
				this.init();
			this.index++;
			return false;
		}

		init() {

		}
	}

	export class Task {
		world:World;
		modules:Module[];
		index:number;

		constructor() {
			this.modules = new Module[];
			this.index = 0;
		}

		step():bool {
			if (this.index == 0)
				this.init();
			this.index++;
			if (this.modules.length == 0)
				return false;
			if (this.modules[0].step() == false) {
				this.modules.splice(0, 1);
				if (this.modules.length == 0)
					return false;
			}
			return true;
		}

		addModule(m:Module) {
			m.task = this;
			this.modules.push(m);
		}

		init() {}
	}

	export module Map {
		export class Util {
			static Sanson2EP(world:World, org:Chip[][]) {
				var map = [];
				var w = org.length;
				var h = org[0].length;
				for (var x = 0; x<w; x++) {
					map[x] = [];
					for (var y=0; y<h; y++) {
						map[x][y] = new Chip();
					}
				}

				for (var y=0; y<h; y++) {
					var latitude = world.getLatitude(y);
					var cos = Math.cos(latitude / 180 * Math.PI);
					for (var x=0; x<w; x++) {
						var x2 = Math.round((x-world.w2) * cos + world.w2);
						map[x][y] = org[x2][y];
					}
				}

				return map;
			}

			static EP2Sanson(world:World, org:Chip[][]) {
				var map = [];
				var w = org.length;
				var h = org[0].length;
				for (var x = 0; x<w; x++) {
					map[x] = [];
					for (var y=0; y<h; y++) {
						map[x][y] = new Chip(true);
					}
				}

				for (var y=0; y<h; y++) {
					var latitude = world.getLatitude(y);
					var cos = Math.cos(latitude / 180 * Math.PI);
					for (var x=0; x<w; x++) {
						var x2 = Math.round((x-world.w2) * cos + world.w2);
						map[x2][y] = org[x][y];
					}
				}

				return map;
			}
		}
		export class Chip {
			c:number;
			l:number;
			t:number;
			disable:bool;
			constructor(disable?:bool) {
				this.c = 0;
				this.l = -200;
				this.t = 0;
				this.disable = disable === undefined ? false : disable;
			}
		}

		export class MapGenerator extends Task {
			sanson:bool;
			map:Map.Chip[][];
			yloop:bool;
			xloop:bool;

			constructor(sanson?:bool) {
				super();
				this.sanson = sanson === undefined ? false : sanson;
				this.yloop = false;
				this.xloop = true;
			}

			init() {
				if (! this.world.map) {
					var w = this.world.width;
					var h = this.world.height;
					var map = new Chip[][];
					for (var x=0; x<w; x++) {
						map[x] = new Chip[];
						for (var y=0; y<h; y++) {
							map[x][y] = new Chip(this.sanson);
						}
					}

					if (this.sanson) {
						for (var y=0; y<h; y++) {
							var latitude = this.world.getLatitude(y);
							var cos = Math.cos(latitude / 180 * Math.PI);
							for (var x=0; x<w; x++) {
								var x2 = Math.round((x-this.world.w2) * cos + this.world.w2);
								map[x2][y].disable = false;
							}
						}
					}
					this.world.map = map;
				}
				this.map = this.world.map;
			}
		}

		export class MapModule extends Module {
			constructor() {
				super();
			}
		}

		export class Altitude extends MapModule {
			machines:Machine[];
			init() {
				this.machines = new Machine[];
				var w = this.task.world.width;
				var h = this.task.world.height;
				var len = w * h;
				for (var i=0; i<len; i++) {
					var r = Math.random();
					if (r < 0.2) {
						this.machines.push(new UpperMachine(
							Math.floor(Math.random() * w),
							Math.floor(Math.random() * h)
						));
					} else if (r < 0.4) {
						this.machines.push(new DownerMachine(
							Math.floor(Math.random() * w),
							Math.floor(Math.random() * h)
						));
					}
				}
			}

			impact(map:Chip[][], impact:number, x:number, y:number) {
				var absImpact = Math.abs(impact);
				var min = {
					x: x-absImpact+1,
					y: y-absImpact+1
				}
				var max = {
					x: x+absImpact-1,
					y: y+absImpact-1
				}
				var w = map.length;
				var h = map[0].length;
				var generator = <MapGenerator>this.task;
				for (var x2=min.x; x2<=max.x; x2++) {
					for (var y2=min.y; y2<=max.y; y2++) {
						var distance = Math.abs(x2 - x) + Math.abs(y2 - y);
						if (distance > absImpact)
							continue;

						var x3 = x2;
						var y3 = y2;
						if (generator.xloop) {
							while (x3 < 0)
								x3 += w;
							while (x3 >= w)
								x3 -= w;
						} else {
							if (x3 < 0 || x3 >= w)
								continue;
						}
						if (generator.yloop) {
							while (y3 < 0)
								y3 += h;
							while (y3 >= h)
								y3 -= h;
						}  else {
							if (y3 < 0 || y3 >= h)
								continue;
						}
						if (map[x3][y3].disable)
							continue;

						if (impact < 0)
							map[x3][y3].l += (impact + distance);
						else
							map[x3][y3].l += (impact - distance);
					}
				}
			}

			step() {
				super.step();

				var len = this.machines.length;
				var map = this.task.world.map;
				var impactMap = new number[][];
				var w = map.length;
				var h = map[0].length;
				for (var x=0; x<w; x++) {
					impactMap[x] = new number[];
					for (var y=0; y<h; y++) {
						impactMap[x][y] = 0;
					}
				}

				for (var i=0; i<len; i++) {
					impactMap[this.machines[i].x][this.machines[i].y] += this.machines[i].power;
				}

				for (var x=0; x<w; x++) {
					for (var y=0; y<h; y++) {
						if (impactMap[x][y]) {
							this.impact(map, impactMap[x][y], x, y);
						}
					}
				}

				for (var i=0; i<this.machines.length; i++) {
					if (Math.random() < 0.15) {
						this.machines.splice(i, 1);
						i--;
					} else {
						this.machines[i].increment();
					}
				}

				return this.machines.length > 0;
			}
		}

		export class MapChip extends MapModule {

		}

		export class Wind extends MapModule {

		}

		export class Temperature extends MapModule {

		}

		export class Elemetanl extends MapModule {

		}

		export class Naming extends MapModule {

		}

		export class Machine {
			power:number;
			x:number;
			y:number;

			constructor(x?:number, y?:number) {
				this.power = 0;
				this.x = x;
				this.y = y;
			}

			moveTo(x:number, y:number) {
				this.x = x;
				this.y = y;
			}

			increment(p?:number) { }
		}

		export class UpperMachine extends Machine {
			constructor(x?:number, y?:number) {
				super(x, y);
				this.power = 1;
			}

			increment(p?:number) {
				if (p)
					this.power += p;
				else
					this.power++;
			}
		}

		export class DownerMachine extends Machine {
			constructor(x?:number, y?:number) {
				super(x, y);
				this.power = -1;
			}

			increment(p?:number) {
				if (p)
					this.power -= p;
				else
					this.power--;
			}
		}
	}
}