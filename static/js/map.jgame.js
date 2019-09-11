var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var jgwg;
(function (jgwg) {
    var debug = function (val) {
        console.log(val);
    };
    var World = (function () {
        function World(width, height) {
            this.tasks = new Array();
            this.width = width ? width : 400;
            this.height = height ? height : 200;
            this.w2 = this.width / 2;
            this.h2 = this.height / 2;
            this.scale = {
                x: 180 / (this.w2),
                y: 90 / (this.h2)
            };
            this.index = 0;
        }
        World.prototype.getLatitude = function (y) {
            return (this.h2 - y) * this.scale.y;
        };
        World.prototype.getLongitude = function (x) {
            return (this.w2 - x) * this.scale.x;
        };
        World.prototype.addTask = function (task) {
            task.world = this;
            this.tasks.push(task);
        };
        World.prototype.step = function () {
            this.index++;
            if(this.tasks.length == 0) {
                return false;
            }
            if(this.tasks[0].step() == false) {
                this.tasks.splice(0, 1);
                if(this.tasks.length == 0) {
                    return false;
                }
            }
            return true;
        };
        World.prototype.render = function (imageData, map) {
            var imgData = imageData.data;
            var w = imageData.width;
            var h = imageData.height;
            if(map === undefined) {
                map = this.map;
            }
            for(var x = 0; x < w; x++) {
                for(var y = 0; y < h; y++) {
                    if(map[x][y].disable) {
                        continue;
                    }
                    var l = Math.floor(map[x][y].l * 0.02);
                    imgData[x * 4 + y * w * 4] = 0;
                    if(l > 0) {
                        imgData[1 + x * 4 + y * w * 4] = (205 - l) + 50;
                    } else {
                        imgData[1 + x * 4 + y * w * 4] = 0;
                    }
                    if(l <= 0) {
                        imgData[2 + x * 4 + y * w * 4] = (205 + l) + 50;
                    } else {
                        imgData[2 + x * 4 + y * w * 4] = 0;
                    }
                }
            }
        };
        return World;
    })();
    jgwg.World = World;    
    var Module = (function () {
        function Module() {
            this.index = 0;
        }
        Module.prototype.step = function () {
            if(this.index == 0) {
                this.init();
            }
            this.index++;
            return false;
        };
        Module.prototype.init = function () {
        };
        return Module;
    })();
    jgwg.Module = Module;    
    var Task = (function () {
        function Task() {
            this.modules = new Array();
            this.index = 0;
        }
        Task.prototype.step = function () {
            if(this.index == 0) {
                this.init();
            }
            this.index++;
            if(this.modules.length == 0) {
                return false;
            }
            if(this.modules[0].step() == false) {
                this.modules.splice(0, 1);
                if(this.modules.length == 0) {
                    return false;
                }
            }
            return true;
        };
        Task.prototype.addModule = function (m) {
            m.task = this;
            this.modules.push(m);
        };
        Task.prototype.init = function () {
        };
        return Task;
    })();
    jgwg.Task = Task;    
    (function (Map) {
        var Util = (function () {
            function Util() { }
            Util.Sanson2EP = function Sanson2EP(world, org) {
                var map = [];
                var w = org.length;
                var h = org[0].length;
                for(var x = 0; x < w; x++) {
                    map[x] = [];
                    for(var y = 0; y < h; y++) {
                        map[x][y] = new Chip();
                    }
                }
                for(var y = 0; y < h; y++) {
                    var latitude = world.getLatitude(y);
                    var cos = Math.cos(latitude / 180 * Math.PI);
                    for(var x = 0; x < w; x++) {
                        var x2 = Math.round((x - world.w2) * cos + world.w2);
                        map[x][y] = org[x2][y];
                    }
                }
                return map;
            };
            Util.EP2Sanson = function EP2Sanson(world, org) {
                var map = [];
                var w = org.length;
                var h = org[0].length;
                for(var x = 0; x < w; x++) {
                    map[x] = [];
                    for(var y = 0; y < h; y++) {
                        map[x][y] = new Chip(true);
                    }
                }
                for(var y = 0; y < h; y++) {
                    var latitude = world.getLatitude(y);
                    var cos = Math.cos(latitude / 180 * Math.PI);
                    for(var x = 0; x < w; x++) {
                        var x2 = Math.round((x - world.w2) * cos + world.w2);
                        map[x2][y] = org[x][y];
                    }
                }
                return map;
            };
            return Util;
        })();
        Map.Util = Util;        
        var Chip = (function () {
            function Chip(disable) {
                this.c = 0;
                this.l = -200;
                this.t = 0;
                this.disable = disable === undefined ? false : disable;
            }
            return Chip;
        })();
        Map.Chip = Chip;        
        var MapGenerator = (function (_super) {
            __extends(MapGenerator, _super);
            function MapGenerator(sanson) {
                        _super.call(this);
                this.sanson = sanson === undefined ? false : sanson;
                this.yloop = false;
                this.xloop = true;
            }
            MapGenerator.prototype.init = function () {
                if(!this.world.map) {
                    var w = this.world.width;
                    var h = this.world.height;
                    var map = new Array();
                    for(var x = 0; x < w; x++) {
                        map[x] = new Array();
                        for(var y = 0; y < h; y++) {
                            map[x][y] = new Chip(this.sanson);
                        }
                    }
                    if(this.sanson) {
                        for(var y = 0; y < h; y++) {
                            var latitude = this.world.getLatitude(y);
                            var cos = Math.cos(latitude / 180 * Math.PI);
                            for(var x = 0; x < w; x++) {
                                var x2 = Math.round((x - this.world.w2) * cos + this.world.w2);
                                map[x2][y].disable = false;
                            }
                        }
                    }
                    this.world.map = map;
                }
                this.map = this.world.map;
            };
            return MapGenerator;
        })(Task);
        Map.MapGenerator = MapGenerator;        
        var MapModule = (function (_super) {
            __extends(MapModule, _super);
            function MapModule() {
                        _super.call(this);
            }
            return MapModule;
        })(Module);
        Map.MapModule = MapModule;        
        var Altitude = (function (_super) {
            __extends(Altitude, _super);
            function Altitude() {
                _super.apply(this, arguments);

            }
            Altitude.prototype.init = function () {
                this.machines = new Array();
                var w = this.task.world.width;
                var h = this.task.world.height;
                var len = w * h;
                for(var i = 0; i < len; i++) {
                    var r = Math.random();
                    if(r < 0.2) {
                        this.machines.push(new UpperMachine(Math.floor(Math.random() * w), Math.floor(Math.random() * h)));
                    } else if(r < 0.4) {
                        this.machines.push(new DownerMachine(Math.floor(Math.random() * w), Math.floor(Math.random() * h)));
                    }
                }
            };
            Altitude.prototype.impact = function (map, impact, x, y) {
                var absImpact = Math.abs(impact);
                var min = {
                    x: x - absImpact + 1,
                    y: y - absImpact + 1
                };
                var max = {
                    x: x + absImpact - 1,
                    y: y + absImpact - 1
                };
                var w = map.length;
                var h = map[0].length;
                var generator = this.task;
                for(var x2 = min.x; x2 <= max.x; x2++) {
                    for(var y2 = min.y; y2 <= max.y; y2++) {
                        var distance = Math.abs(x2 - x) + Math.abs(y2 - y);
                        if(distance > absImpact) {
                            continue;
                        }
                        var x3 = x2;
                        var y3 = y2;
                        if(generator.xloop) {
                            while(x3 < 0) {
                                x3 += w;
                            }
                            while(x3 >= w) {
                                x3 -= w;
                            }
                        } else {
                            if(x3 < 0 || x3 >= w) {
                                continue;
                            }
                        }
                        if(generator.yloop) {
                            while(y3 < 0) {
                                y3 += h;
                            }
                            while(y3 >= h) {
                                y3 -= h;
                            }
                        } else {
                            if(y3 < 0 || y3 >= h) {
                                continue;
                            }
                        }
                        if(map[x3][y3].disable) {
                            continue;
                        }
                        if(impact < 0) {
                            map[x3][y3].l += (impact + distance);
                        } else {
                            map[x3][y3].l += (impact - distance);
                        }
                    }
                }
            };
            Altitude.prototype.step = function () {
                _super.prototype.step.call(this);
                var len = this.machines.length;
                var map = this.task.world.map;
                var impactMap = new Array();
                var w = map.length;
                var h = map[0].length;
                for(var x = 0; x < w; x++) {
                    impactMap[x] = new Array();
                    for(var y = 0; y < h; y++) {
                        impactMap[x][y] = 0;
                    }
                }
                for(var i = 0; i < len; i++) {
                    impactMap[this.machines[i].x][this.machines[i].y] += this.machines[i].power;
                }
                for(var x = 0; x < w; x++) {
                    for(var y = 0; y < h; y++) {
                        if(impactMap[x][y]) {
                            this.impact(map, impactMap[x][y], x, y);
                        }
                    }
                }
                for(var i = 0; i < this.machines.length; i++) {
                    if(Math.random() < 0.15) {
                        this.machines.splice(i, 1);
                        i--;
                    } else {
                        this.machines[i].increment();
                    }
                }
                return this.machines.length > 0;
            };
            return Altitude;
        })(MapModule);
        Map.Altitude = Altitude;        
        var MapChip = (function (_super) {
            __extends(MapChip, _super);
            function MapChip() {
                _super.apply(this, arguments);

            }
            return MapChip;
        })(MapModule);
        Map.MapChip = MapChip;        
        var Wind = (function (_super) {
            __extends(Wind, _super);
            function Wind() {
                _super.apply(this, arguments);

            }
            return Wind;
        })(MapModule);
        Map.Wind = Wind;        
        var Temperature = (function (_super) {
            __extends(Temperature, _super);
            function Temperature() {
                _super.apply(this, arguments);

            }
            return Temperature;
        })(MapModule);
        Map.Temperature = Temperature;        
        var Elemetanl = (function (_super) {
            __extends(Elemetanl, _super);
            function Elemetanl() {
                _super.apply(this, arguments);

            }
            return Elemetanl;
        })(MapModule);
        Map.Elemetanl = Elemetanl;        
        var Naming = (function (_super) {
            __extends(Naming, _super);
            function Naming() {
                _super.apply(this, arguments);

            }
            return Naming;
        })(MapModule);
        Map.Naming = Naming;        
        var Machine = (function () {
            function Machine(x, y) {
                this.power = 0;
                this.x = x;
                this.y = y;
            }
            Machine.prototype.moveTo = function (x, y) {
                this.x = x;
                this.y = y;
            };
            Machine.prototype.increment = function (p) {
            };
            return Machine;
        })();
        Map.Machine = Machine;        
        var UpperMachine = (function (_super) {
            __extends(UpperMachine, _super);
            function UpperMachine(x, y) {
                        _super.call(this, x, y);
                this.power = 1;
            }
            UpperMachine.prototype.increment = function (p) {
                if(p) {
                    this.power += p;
                } else {
                    this.power++;
                }
            };
            return UpperMachine;
        })(Machine);
        Map.UpperMachine = UpperMachine;        
        var DownerMachine = (function (_super) {
            __extends(DownerMachine, _super);
            function DownerMachine(x, y) {
                        _super.call(this, x, y);
                this.power = -1;
            }
            DownerMachine.prototype.increment = function (p) {
                if(p) {
                    this.power -= p;
                } else {
                    this.power--;
                }
            };
            return DownerMachine;
        })(Machine);
        Map.DownerMachine = DownerMachine;        
    })(jgwg.Map || (jgwg.Map = {}));
    var Map = jgwg.Map;
})(jgwg || (jgwg = {}));
var TestScene = (function (_super) {
    __extends(TestScene, _super);
    function TestScene(game) {
        _super.call(this, game);
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
    return TestScene;
})(Scene);
var MapScene = (function (_super) {
    __extends(MapScene, _super);
    function MapScene(game) {
        var _this = this;
        _super.call(this, game);
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
        this.started.handle(this, function () {
            _this.game.update.handle(_this, _this.step);
            _this.started.removeAll(_this);
        });
    }
    MapScene.prototype.createTexture = function () {
        var sprite = this.pixel.createSprite();
        return sprite.image;
    };
    MapScene.prototype.createMap = function (map) {
        var pixel = new Pixel(this.pixel.width, this.pixel.height);
        var d = pixel.imageData.data;
        if(map === undefined) {
            map = this.world.map;
        }
        var w = map.length;
        var h = map[0].length;
        for(var x = 0; x < w; x++) {
            for(var y = 0; y < h; y++) {
                var index = x * 4 + y * w * 4;
                var r, g, b;
                if(map[x][y].l <= 0) {
                    r = 0;
                    g = 0;
                    b = (205 + Math.floor(map[x][y].l * 0.02)) + 50;
                } else {
                    r = 0;
                    g = 255;
                    b = 0;
                }
                d[index] = r;
                d[index + 1] = g;
                d[index + 2] = b;
                d[index + 3] = 255;
            }
        }
        return pixel.createSprite().image;
    };
    MapScene.prototype.createBumpMap = function (map) {
        var pixel = new Pixel(this.pixel.width, this.pixel.height);
        var d = pixel.imageData.data;
        if(map === undefined) {
            map = this.world.map;
        }
        var w = map.length;
        var h = map[0].length;
        for(var x = 0; x < w; x++) {
            for(var y = 0; y < h; y++) {
                var index = x * 4 + y * w * 4;
                var rgb;
                if(map[x][y].l <= 0) {
                    rgb = 0;
                } else {
                    rgb = map[x][y].l * 0.05;
                    if(rgb > 255) {
                        rgb = 255;
                    }
                }
                d[index] = rgb;
                d[index + 1] = rgb;
                d[index + 2] = rgb;
                d[index + 3] = 255;
            }
        }
        return pixel.createSprite().image;
    };
    MapScene.prototype.step = function () {
        var ret = this.world.step();
        if(ret === false) {
            this.game.update.remove(this, this.step);
        }
        this.world.render(this.pixel.imageData);
        this.pixel.updated();
    };
    return MapScene;
})(Scene);
