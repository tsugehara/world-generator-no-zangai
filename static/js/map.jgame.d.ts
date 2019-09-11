module jgwg {
    class World {
        public tasks: Task[];
        public index: number;
        public map: Map.Chip[][];
        public scale: CommonOffset;
        public width: number;
        public height: number;
        public w2: number;
        public h2: number;
        constructor(width: number, height: number);
        public getLatitude(y: number): number;
        public getLongitude(x: number): number;
        public addTask(task: Task): void;
        public step(): bool;
        public render(imageData: ImageData, map?: Map.Chip[][]): void;
    }
    class Module {
        public task: Task;
        public index: number;
        constructor();
        public step(): bool;
        public init(): void;
    }
    class Task {
        public world: World;
        public modules: Module[];
        public index: number;
        constructor();
        public step(): bool;
        public addModule(m: Module): void;
        public init(): void;
    }
    module Map {
        class Util {
            static Sanson2EP(world: World, org: Chip[][]): any[];
            static EP2Sanson(world: World, org: Chip[][]): any[];
        }
        class Chip {
            public c: number;
            public l: number;
            public t: number;
            public disable: bool;
            constructor(disable?: bool);
        }
        class MapGenerator extends Task {
            public sanson: bool;
            public map: Chip[][];
            public yloop: bool;
            public xloop: bool;
            constructor(sanson?: bool);
            public init(): void;
        }
        class MapModule extends Module {
            constructor();
        }
        class Altitude extends MapModule {
            public machines: Machine[];
            public init(): void;
            public impact(map: Chip[][], impact: number, x: number, y: number): void;
            public step(): bool;
        }
        class MapChip extends MapModule {
        }
        class Wind extends MapModule {
        }
        class Temperature extends MapModule {
        }
        class Elemetanl extends MapModule {
        }
        class Naming extends MapModule {
        }
        class Machine {
            public power: number;
            public x: number;
            public y: number;
            constructor(x?: number, y?: number);
            public moveTo(x: number, y: number): void;
            public increment(p?: number): void;
        }
        class UpperMachine extends Machine {
            constructor(x?: number, y?: number);
            public increment(p?: number): void;
        }
        class DownerMachine extends Machine {
            constructor(x?: number, y?: number);
            public increment(p?: number): void;
        }
    }
}
class TestScene extends Scene {
    public ep400: Sprite;
    public map: Sprite;
    public map2: Sprite;
    constructor(game: Game);
}
class MapScene extends Scene {
    public world: jgwg.World;
    public pixel: Pixel;
    public pixel2: Pixel;
    constructor(game: Game);
    public createTexture();
    public createMap(map?: jgwg.Map.Chip[][]);
    public createBumpMap(map?: jgwg.Map.Chip[][]);
    public step(): void;
}
