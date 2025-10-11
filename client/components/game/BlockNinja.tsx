import { useEffect, useRef } from "react";

export interface BlockNinjaProps {
  canPlay: boolean;
  onSubmitScore(score: number): Promise<void> | void;
  onAutoStart?: () => void;
  onRequireWallet?: () => void;
  onOpenLeaderboard?: () => void;
}

export default function BlockNinja({
  canPlay,
  onSubmitScore,
  onAutoStart,
  onRequireWallet,
  onOpenLeaderboard,
}: BlockNinjaProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const root = rootRef.current!;
    const $ = (sel: string) => root.querySelector(sel) as HTMLElement;

    // ==== Inject original CSS (scoped by nature of IDs/classes) ====
    // We keep CSS external by importing file via Vite to preserve exact look
    // but as per constraint, include styles here to ensure pixel parity.

    // Game code from original, adapted to scope queries within root.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (function initGame() {
      // Timing multiplier for entire game engine.
      let gameSpeed = 1;

      // Colors
      const BLUE = { r: 0x67, g: 0xd7, b: 0xf0 };
      const GREEN = { r: 0xa6, g: 0xe0, b: 0x2c };
      const PINK = { r: 0xfa, g: 0x24, b: 0x73 };
      const ORANGE = { r: 0xfe, g: 0x95, b: 0x22 };
      const allColors = [BLUE, GREEN, PINK, ORANGE];

      // Gameplay
      const getSpawnDelay = () => {
        const spawnDelayMax = 1400;
        const spawnDelayMin = 550;
        const spawnDelay = spawnDelayMax - state.game.cubeCount * 3.1;
        return Math.max(spawnDelay, spawnDelayMin);
      };
      const doubleStrongEnableScore = 2000;
      const slowmoThreshold = 10;
      const strongThreshold = 25;
      const spinnerThreshold = 25;

      // Interaction state
      let pointerIsDown = false;
      let pointerScreen = { x: 0, y: 0 };
      let pointerScene = { x: 0, y: 0 };
      const minPointerSpeed = 60;
      const hitDampening = 0.1;
      const backboardZ = -400;
      const shadowColor = "#262e36";
      const airDrag = 0.022;
      const gravity = 0.3;
      const sparkColor = "rgba(170,221,255,.9)";
      const sparkThickness = 2.2;
      const airDragSpark = 0.1;
      const touchTrailColor = "rgba(170,221,255,.62)";
      const touchTrailThickness = 7;
      const touchPointLife = 120;
      const touchPoints: any[] = [];
      const targetRadius = 40;
      const targetHitRadius = 50;
      const targetApexThreshold = targetHitRadius * 0.5;
      const makeTargetGlueColor = (_target: any) => "rgb(170,221,255)";
      const fragRadius = targetRadius / 3;

      const canvas = root.querySelector("#c") as HTMLCanvasElement;

      // Sound effects
      const sfx = {
        ninja: new Audio(
          "https://cdn.builder.io/o/assets%2F46bb7f1aa7e846bbae66fe2261f73473%2Fc0296aa3558749399a985a84e757f968?alt=media&token=b26fbe7c-067a-41e8-83e3-de4db7c28967&apiKey=46bb7f1aa7e846bbae66fe2261f73473",
        ),
        click: new Audio(
          "https://cdn.builder.io/o/assets%2F46bb7f1aa7e846bbae66fe2261f73473%2Fe9efecf4b5f84d81ac7139866c9e9e98?alt=media&token=4aaed14f-5b19-4fa4-aa07-079a4a5975d9&apiKey=46bb7f1aa7e846bbae66fe2261f73473",
        ),
      } as const;
      sfx.ninja.preload = "auto";
      sfx.click.preload = "auto";
      sfx.ninja.volume = 0.4;
      sfx.click.volume = 0.3;
      const playSound = (a: HTMLAudioElement) => {
        try {
          a.currentTime = 0;
          void a.play();
        } catch (_) {}
      };

      // 3D camera config
      const cameraDistance = 900;
      const sceneScale = 1;
      const cameraFadeStartZ = 0.45 * cameraDistance;
      const cameraFadeEndZ = 0.65 * cameraDistance;
      const cameraFadeRange = cameraFadeEndZ - cameraFadeStartZ;

      const allVertices: any[] = [];
      const allPolys: any[] = [];
      const allShadowVertices: any[] = [];
      const allShadowPolys: any[] = [];

      // State
      const GAME_MODE_RANKED = Symbol("GAME_MODE_RANKED");
      const GAME_MODE_CASUAL = Symbol("GAME_MODE_CASUAL");
      const MENU_MAIN = Symbol("MENU_MAIN");
      const MENU_PAUSE = Symbol("MENU_PAUSE");
      const MENU_SCORE = Symbol("MENU_SCORE");

      const state: any = {
        game: { mode: GAME_MODE_RANKED, time: 0, score: 0, cubeCount: 0 },
        menus: { active: MENU_MAIN },
      };
      let gameOver = false;

      const isInGame = () => !state.menus.active;
      const isMenuVisible = () => !!state.menus.active;
      const isCasualGame = () => state.game.mode === GAME_MODE_CASUAL;
      const isPaused = () => state.menus.active === MENU_PAUSE;

      const highScoreKey = "__menja__highScore";
      const getHighScore = () => {
        const raw = localStorage.getItem(highScoreKey);
        return raw ? parseInt(raw, 10) : 0;
      };
      let _lastHighscore = getHighScore();
      const setHighScore = (score: number) => {
        _lastHighscore = getHighScore();
        localStorage.setItem(highScoreKey, String(score));
      };
      const isNewHighScore = () => state.game.score > _lastHighscore;

      const handleClick = (element: Element | null, handler: () => void) =>
        element?.addEventListener("click", handler);
      const handlePointerDown = (
        element: Element | null,
        handler: () => void,
      ) => {
        element?.addEventListener("touchstart", handler as any);
        element?.addEventListener("mousedown", handler as any);
      };
      const formatNumber = (num: number) => num.toLocaleString();

      const PI = Math.PI;
      const TAU = Math.PI * 2;
      const ETA = Math.PI * 0.5;

      const clamp = (num: number, min: number, max: number) =>
        Math.min(Math.max(num, min), max);
      const lerp = (a: number, b: number, mix: number) => (b - a) * mix + a;
      const random = (min: number, max: number) =>
        Math.random() * (max - min) + min;
      const randomInt = (min: number, max: number) =>
        ((Math.random() * (max - min + 1)) | 0) + min;
      const pickOne = (arr: any[]) => arr[(Math.random() * arr.length) | 0];

      const colorToHex = (color: any) =>
        "#" +
        (color.r | 0).toString(16).padStart(2, "0") +
        (color.g | 0).toString(16).padStart(2, "0") +
        (color.b | 0).toString(16).padStart(2, "0");
      const shadeColor = (color: any, lightness: number) => {
        let other, mix;
        if (lightness < 0.5) {
          other = 0;
          mix = 1 - lightness * 2;
        } else {
          other = 255;
          mix = lightness * 2 - 1;
        }
        return (
          "#" +
          (lerp(color.r, other, mix) | 0).toString(16).padStart(2, "0") +
          (lerp(color.g, other, mix) | 0).toString(16).padStart(2, "0") +
          (lerp(color.b, other, mix) | 0).toString(16).padStart(2, "0")
        );
      };

      const _allCooldowns: any[] = [];
      const makeCooldown = (rechargeTime: number, units = 1) => {
        let timeRemaining = 0;
        let lastTime = 0;
        const initialOptions = { rechargeTime, units };
        const updateTime = () => {
          const now = state.game.time;
          if (now < lastTime) {
            timeRemaining = 0;
          } else {
            timeRemaining -= now - lastTime;
            if (timeRemaining < 0) timeRemaining = 0;
          }
          lastTime = now;
        };
        const canUse = () => {
          updateTime();
          return timeRemaining <= rechargeTime * (units - 1);
        };
        const cooldown = {
          canUse,
          useIfAble() {
            const usable = canUse();
            if (usable) timeRemaining += rechargeTime;
            return usable;
          },
          mutate(options: any) {
            if (options.rechargeTime) {
              timeRemaining -= rechargeTime - options.rechargeTime;
              if (timeRemaining < 0) timeRemaining = 0;
              (rechargeTime as any) = options.rechargeTime;
            }
            if (options.units) (units as any) = options.units;
          },
          reset() {
            timeRemaining = 0;
            lastTime = 0;
            (this as any).mutate(initialOptions);
          },
        } as any;
        _allCooldowns.push(cooldown);
        return cooldown;
      };
      const resetAllCooldowns = () => _allCooldowns.forEach((c) => c.reset());

      const makeSpawner = ({ chance, cooldownPerSpawn, maxSpawns }: any) => {
        const cooldown = makeCooldown(cooldownPerSpawn, maxSpawns);
        return {
          shouldSpawn() {
            return Math.random() <= chance && cooldown.useIfAble();
          },
          mutate(options: any) {
            if (options.chance) chance = options.chance;
            cooldown.mutate({
              rechargeTime: options.cooldownPerSpawn,
              units: options.maxSpawns,
            });
          },
        };
      };

      const normalize = (v: any) => {
        const mag = Math.hypot(v.x, v.y, v.z);
        return { x: v.x / mag, y: v.y / mag, z: v.z / mag };
      };
      const add = (a: number) => (b: number) => a + b;
      const scaleVector = (scale: number) => (vector: any) => {
        vector.x *= scale;
        vector.y *= scale;
        vector.z *= scale;
      };

      function cloneVertices(vertices: any[]) {
        return vertices.map((v) => ({ x: v.x, y: v.y, z: v.z }));
      }
      function copyVerticesTo(arr1: any[], arr2: any[]) {
        const len = arr1.length;
        for (let i = 0; i < len; i++) {
          const v1 = arr1[i];
          const v2 = arr2[i];
          v2.x = v1.x;
          v2.y = v1.y;
          v2.z = v1.z;
        }
      }
      function computeTriMiddle(poly: any) {
        const v = poly.vertices;
        poly.middle.x = (v[0].x + v[1].x + v[2].x) / 3;
        poly.middle.y = (v[0].y + v[1].y + v[2].y) / 3;
        poly.middle.z = (v[0].z + v[1].z + v[2].z) / 3;
      }
      function computeQuadMiddle(poly: any) {
        const v = poly.vertices;
        poly.middle.x = (v[0].x + v[1].x + v[2].x + v[3].x) / 4;
        poly.middle.y = (v[0].y + v[1].y + v[2].y + v[3].y) / 4;
        poly.middle.z = (v[0].z + v[1].z + v[2].z + v[3].z) / 4;
      }
      function computePolyMiddle(poly: any) {
        if (poly.vertices.length === 3) {
          computeTriMiddle(poly);
        } else {
          computeQuadMiddle(poly);
        }
      }
      function computePolyDepth(poly: any) {
        computePolyMiddle(poly);
        const dX = poly.middle.x;
        const dY = poly.middle.y;
        const dZ = poly.middle.z - cameraDistance;
        poly.depth = Math.hypot(dX, dY, dZ);
      }
      function computePolyNormal(poly: any, normalName: string) {
        const v1 = poly.vertices[0];
        const v2 = poly.vertices[1];
        const v3 = poly.vertices[2];
        const ax = v1.x - v2.x;
        const ay = v1.y - v2.y;
        const az = v1.z - v2.z;
        const bx = v1.x - v3.x;
        const by = v1.y - v3.y;
        const bz = v1.z - v3.z;
        const nx = ay * bz - az * by;
        const ny = az * bx - ax * bz;
        const nz = ax * by - ay * bx;
        const mag = Math.hypot(nx, ny, nz);
        const polyNormal = poly[normalName];
        polyNormal.x = nx / mag;
        polyNormal.y = ny / mag;
        polyNormal.z = nz / mag;
      }
      function transformVertices(
        vertices: any[],
        target: any[],
        tX: number,
        tY: number,
        tZ: number,
        rX: number,
        rY: number,
        rZ: number,
        sX: number,
        sY: number,
        sZ: number,
      ) {
        const sinX = Math.sin(rX);
        const cosX = Math.cos(rX);
        const sinY = Math.sin(rY);
        const cosY = Math.cos(rY);
        const sinZ = Math.sin(rZ);
        const cosZ = Math.cos(rZ);
        vertices.forEach((v, i) => {
          const targetVertex = target[i];
          const x1 = v.x;
          const y1 = v.z * sinX + v.y * cosX;
          const z1 = v.z * cosX - v.y * sinX;
          const x2 = x1 * cosY - z1 * sinY;
          const y2 = y1;
          const z2 = x1 * sinY + z1 * cosY;
          const x3 = x2 * cosZ - y2 * sinZ;
          const y3 = x2 * sinZ + y2 * cosZ;
          const z3 = z2;
          targetVertex.x = x3 * sX + tX;
          targetVertex.y = y3 * sY + tY;
          targetVertex.z = z3 * sZ + tZ;
        });
      }
      const projectVertex = (v: any) => {
        const focalLength = cameraDistance * sceneScale;
        const depth = focalLength / (cameraDistance - v.z);
        v.x = v.x * depth;
        v.y = v.y * depth;
      };
      const projectVertexTo = (v: any, target: any) => {
        const focalLength = cameraDistance * sceneScale;
        const depth = focalLength / (cameraDistance - v.z);
        target.x = v.x * depth;
        target.y = v.y * depth;
      };
      const PERF_START = (_: any) => {};
      const PERF_END = (_: any) => {};
      const PERF_UPDATE = () => {};

      function makeCubeModel({ scale = 1 }: any) {
        return {
          vertices: [
            { x: -scale, y: -scale, z: scale },
            { x: scale, y: -scale, z: scale },
            { x: scale, y: scale, z: scale },
            { x: -scale, y: scale, z: scale },
            { x: -scale, y: -scale, z: -scale },
            { x: scale, y: -scale, z: -scale },
            { x: scale, y: scale, z: -scale },
            { x: -scale, y: scale, z: -scale },
          ],
          polys: [
            { vIndexes: [0, 1, 2, 3] },
            { vIndexes: [7, 6, 5, 4] },
            { vIndexes: [3, 2, 6, 7] },
            { vIndexes: [4, 5, 1, 0] },
            { vIndexes: [5, 6, 2, 1] },
            { vIndexes: [0, 3, 7, 4] },
          ],
        };
      }
      function makeRecursiveCubeModel({
        recursionLevel,
        splitFn,
        scale = 1,
      }: any) {
        const getScaleAtLevel = (level: number) => 1 / 3 ** level;
        let cubeOrigins = [{ x: 0, y: 0, z: 0 }];
        for (let i = 1; i <= recursionLevel; i++) {
          const s = getScaleAtLevel(i) * 2;
          const next: any[] = [];
          cubeOrigins.forEach((origin) => {
            next.push(...splitFn(origin, s));
          });
          cubeOrigins = next;
        }
        const finalModel = { vertices: [] as any[], polys: [] as any[] };
        const cubeModel = makeCubeModel({ scale: 1 });
        cubeModel.vertices.forEach(
          scaleVector(getScaleAtLevel(recursionLevel)),
        );
        const maxComponent =
          getScaleAtLevel(recursionLevel) * (3 ** recursionLevel - 1);
        cubeOrigins.forEach((origin, cubeIndex) => {
          finalModel.vertices.push(
            ...cubeModel.vertices.map((v) => ({
              x: (v.x + origin.x) * scale,
              y: (v.y + origin.y) * scale,
              z: (v.z + origin.z) * scale,
            })),
          );
          finalModel.polys.push(
            ...cubeModel.polys.map((poly) => ({
              vIndexes: poly.vIndexes.map(add(cubeIndex * 8)),
            })),
          );
        });
        return finalModel;
      }
      function mengerSpongeSplit(o: any, s: number) {
        return [
          { x: o.x + s, y: o.y - s, z: o.z + s },
          { x: o.x + s, y: o.y - s, z: o.z + 0 },
          { x: o.x + s, y: o.y - s, z: o.z - s },
          { x: o.x + 0, y: o.y - s, z: o.z + s },
          { x: o.x + 0, y: o.y - s, z: o.z - s },
          { x: o.x - s, y: o.y - s, z: o.z + s },
          { x: o.x - s, y: o.y - s, z: o.z + 0 },
          { x: o.x - s, y: o.y - s, z: o.z - s },
          { x: o.x + s, y: o.y + s, z: o.z + s },
          { x: o.x + s, y: o.y + s, z: o.z + 0 },
          { x: o.x + s, y: o.y + s, z: o.z - s },
          { x: o.x + 0, y: o.y + s, z: o.z + s },
          { x: o.x + 0, y: o.y + s, z: o.z - s },
          { x: o.x - s, y: o.y + s, z: o.z + s },
          { x: o.x - s, y: o.y + s, z: o.z + 0 },
          { x: o.x - s, y: o.y + s, z: o.z - s },
          { x: o.x + s, y: o.y + 0, z: o.z + s },
          { x: o.x + s, y: o.y + 0, z: o.z - s },
          { x: o.x - s, y: o.y + 0, z: o.z + s },
          { x: o.x - s, y: o.y + 0, z: o.z - s },
        ];
      }
      function optimizeModel(model: any, threshold = 0.0001) {
        const { vertices, polys } = model;
        const compareVertices = (v1: any, v2: any) =>
          Math.abs(v1.x - v2.x) < threshold &&
          Math.abs(v1.y - v2.y) < threshold &&
          Math.abs(v1.z - v2.z) < threshold;
        const comparePolys = (p1: any, p2: any) => {
          const v1 = p1.vIndexes;
          const v2 = p2.vIndexes;
          return (
            (v1[0] === v2[0] ||
              v1[0] === v2[1] ||
              v1[0] === v2[2] ||
              v1[0] === v2[3]) &&
            (v1[1] === v2[0] ||
              v1[1] === v2[1] ||
              v1[1] === v2[2] ||
              v1[1] === v2[3]) &&
            (v1[2] === v2[0] ||
              v1[2] === v2[1] ||
              v1[2] === v2[2] ||
              v1[2] === v2[3]) &&
            (v1[3] === v2[0] ||
              v1[3] === v2[1] ||
              v1[3] === v2[2] ||
              v1[3] === v2[3])
          );
        };
        vertices.forEach((v: any, i: number) => {
          (v as any).originalIndexes = [i];
        });
        for (let i = vertices.length - 1; i >= 0; i--) {
          for (let ii = i - 1; ii >= 0; ii--) {
            const v1 = vertices[i];
            const v2 = vertices[ii];
            if (compareVertices(v1, v2)) {
              vertices.splice(i, 1);
              (v2 as any).originalIndexes.push(...(v1 as any).originalIndexes);
              break;
            }
          }
        }
        vertices.forEach((v: any, i: number) => {
          polys.forEach((p: any) => {
            p.vIndexes.forEach((vi: number, ii: number, arr: number[]) => {
              const vo = (v as any).originalIndexes;
              if (vo.includes(vi)) {
                arr[ii] = i;
              }
            });
          });
        });
        polys.forEach((p: any) => {
          const vi = p.vIndexes;
          (p as any).sum = vi[0] + vi[1] + vi[2] + vi[3];
        });
        polys.sort((a: any, b: any) => b.sum - a.sum);
        for (let i = polys.length - 1; i >= 0; i--) {
          for (let ii = i - 1; ii >= 0; ii--) {
            const p1 = polys[i];
            const p2 = polys[ii];
            if (p1.sum !== p2.sum) break;
            if (comparePolys(p1, p2)) {
              polys.splice(i, 1);
              polys.splice(ii, 1);
              i--;
              break;
            }
          }
        }
        return model;
      }

      class Entity {
        model: any;
        vertices: any[];
        polys: any[];
        shadowVertices: any[];
        shadowPolys: any[];
        projected: any;
        color?: any;
        wireframe?: boolean;
        x = 0;
        y = 0;
        z = 0;
        xD = 0;
        yD = 0;
        zD = 0;
        rotateX = 0;
        rotateY = 0;
        rotateZ = 0;
        rotateXD = 0;
        rotateYD = 0;
        rotateZD = 0;
        scaleX = 1;
        scaleY = 1;
        scaleZ = 1;
        constructor({ model, color, wireframe = false }: any) {
          const vertices = cloneVertices(model.vertices);
          const shadowVertices = cloneVertices(model.vertices);
          const colorHex = colorToHex(color);
          const darkColorHex = shadeColor(color, 0.4);
          const polys = model.polys.map((p: any) => ({
            vertices: p.vIndexes.map((vIndex: number) => vertices[vIndex]),
            color,
            wireframe,
            strokeWidth: wireframe ? 2 : 0,
            strokeColor: colorHex,
            strokeColorDark: darkColorHex,
            depth: 0,
            middle: { x: 0, y: 0, z: 0 },
            normalWorld: { x: 0, y: 0, z: 0 },
            normalCamera: { x: 0, y: 0, z: 0 },
          }));
          const shadowPolys = model.polys.map((p: any) => ({
            vertices: p.vIndexes.map(
              (vIndex: number) => shadowVertices[vIndex],
            ),
            wireframe,
            normalWorld: { x: 0, y: 0, z: 0 },
          }));
          this.projected = {};
          this.model = model;
          this.vertices = vertices;
          this.polys = polys;
          this.shadowVertices = shadowVertices;
          this.shadowPolys = shadowPolys;
          this.reset();
        }
        reset() {
          this.x = 0;
          this.y = 0;
          this.z = 0;
          this.xD = 0;
          this.yD = 0;
          this.zD = 0;
          this.rotateX = 0;
          this.rotateY = 0;
          this.rotateZ = 0;
          this.rotateXD = 0;
          this.rotateYD = 0;
          this.rotateZD = 0;
          this.scaleX = 1;
          this.scaleY = 1;
          this.scaleZ = 1;
          (this.projected as any).x = 0;
          (this.projected as any).y = 0;
        }
        transform() {
          transformVertices(
            this.model.vertices,
            this.vertices,
            this.x,
            this.y,
            this.z,
            this.rotateX,
            this.rotateY,
            this.rotateZ,
            this.scaleX,
            this.scaleY,
            this.scaleZ,
          );
          copyVerticesTo(this.vertices, this.shadowVertices);
        }
        project() {
          projectVertexTo(this as any, this.projected);
        }
      }

      const targets: any[] = [];
      const targetPool = new Map(allColors.map((c) => [c, [] as any[]]));
      const targetWireframePool = new Map(
        allColors.map((c) => [c, [] as any[]]),
      );

      const getTarget = (() => {
        const slowmoSpawner = makeSpawner({
          chance: 0.5,
          cooldownPerSpawn: 10000,
          maxSpawns: 1,
        });
        let doubleStrong = false;
        const strongSpawner = makeSpawner({
          chance: 0.3,
          cooldownPerSpawn: 12000,
          maxSpawns: 1,
        });
        const spinnerSpawner = makeSpawner({
          chance: 0.1,
          cooldownPerSpawn: 10000,
          maxSpawns: 1,
        });
        const axisOptions = [
          ["x", "y"],
          ["y", "z"],
          ["z", "x"],
        ];
        function getTargetOfStyle(color: any, wireframe: boolean) {
          const pool = wireframe ? targetWireframePool : targetPool;
          let target: any = (pool.get(color) as any[]).pop();
          if (!target) {
            target = new Entity({
              model: optimizeModel(
                makeRecursiveCubeModel({
                  recursionLevel: 1,
                  splitFn: mengerSpongeSplit,
                  scale: targetRadius,
                }),
              ),
              color,
              wireframe,
            });
            target.color = color;
            target.wireframe = wireframe;
            target.hit = false;
            target.maxHealth = 0;
            target.health = 0;
          }
          return target;
        }
        return function getTarget() {
          if (doubleStrong && state.game.score <= doubleStrongEnableScore) {
            doubleStrong = false;
          } else if (
            !doubleStrong &&
            state.game.score > doubleStrongEnableScore
          ) {
            doubleStrong = true;
            strongSpawner.mutate({ maxSpawns: 2 });
          }
          let color = pickOne([BLUE, GREEN, ORANGE]);
          let wireframe = false;
          let health = 1;
          let maxHealth = 3;
          const spinner =
            state.game.cubeCount >= spinnerThreshold &&
            isInGame() &&
            spinnerSpawner.shouldSpawn();
          if (
            state.game.cubeCount >= slowmoThreshold &&
            slowmoSpawner.shouldSpawn()
          ) {
            color = BLUE;
            wireframe = true;
          } else if (
            state.game.cubeCount >= strongThreshold &&
            strongSpawner.shouldSpawn()
          ) {
            color = PINK;
            health = 3;
          }
          const target = getTargetOfStyle(color, wireframe);
          target.hit = false;
          target.maxHealth = maxHealth;
          target.health = health;
          updateTargetHealth(target, 0);
          const spinSpeeds = [
            Math.random() * 0.1 - 0.05,
            Math.random() * 0.1 - 0.05,
          ];
          if (spinner) {
            spinSpeeds[0] = -0.25;
            spinSpeeds[1] = 0;
            target.rotateZ = random(0, TAU);
          }
          const axes = pickOne(axisOptions);
          spinSpeeds.forEach((spinSpeed, i) => {
            switch (axes[i]) {
              case "x":
                target.rotateXD = spinSpeed;
                break;
              case "y":
                target.rotateYD = spinSpeed;
                break;
              case "z":
                target.rotateZD = spinSpeed;
                break;
            }
          });
          return target;
        };
      })();

      const updateTargetHealth = (target: any, _healthDelta: number) => {
        if (!target.wireframe) {
          const strokeWidth = target.health - 1;
          const strokeColor = makeTargetGlueColor(target);
          for (let p of target.polys) {
            p.strokeWidth = strokeWidth;
            p.strokeColor = strokeColor;
          }
        }
      };
      const returnTarget = (target: any) => {
        target.reset();
        const pool = target.wireframe ? targetWireframePool : targetPool;
        (pool.get(target.color) as any[]).push(target);
      };
      function resetAllTargets() {
        while (targets.length) {
          returnTarget(targets.pop());
        }
      }

      const frags: any[] = [];
      const fragPool = new Map(allColors.map((c) => [c, [] as any[]]));
      const fragWireframePool = new Map(allColors.map((c) => [c, [] as any[]]));
      const createBurst = (() => {
        const basePositions = mengerSpongeSplit(
          { x: 0, y: 0, z: 0 },
          fragRadius * 2,
        );
        const positions = cloneVertices(basePositions);
        const prevPositions = cloneVertices(basePositions);
        const velocities = cloneVertices(basePositions);
        const basePositionNormals = basePositions.map(normalize);
        const positionNormals = cloneVertices(basePositionNormals);
        const fragCount = basePositions.length;
        function getFragForTarget(target: any) {
          const pool = target.wireframe ? fragWireframePool : fragPool;
          let frag: any = (pool.get(target.color) as any[]).pop();
          if (!frag) {
            frag = new Entity({
              model: makeCubeModel({ scale: fragRadius }),
              color: target.color,
              wireframe: target.wireframe,
            });
            frag.color = target.color;
            frag.wireframe = target.wireframe;
          }
          return frag;
        }
        return (target: any, force = 1) => {
          transformVertices(
            basePositions,
            positions,
            target.x,
            target.y,
            target.z,
            target.rotateX,
            target.rotateY,
            target.rotateZ,
            1,
            1,
            1,
          );
          transformVertices(
            basePositions,
            prevPositions,
            target.x - target.xD,
            target.y - target.yD,
            target.z - target.zD,
            target.rotateX - target.rotateXD,
            target.rotateY - target.rotateYD,
            target.rotateZ - target.rotateZD,
            1,
            1,
            1,
          );
          for (let i = 0; i < fragCount; i++) {
            const position = positions[i];
            const prevPosition = prevPositions[i];
            const velocity = velocities[i];
            velocity.x = position.x - prevPosition.x;
            velocity.y = position.y - prevPosition.y;
            velocity.z = position.z - prevPosition.z;
          }
          transformVertices(
            basePositionNormals,
            positionNormals,
            0,
            0,
            0,
            target.rotateX,
            target.rotateY,
            target.rotateZ,
            1,
            1,
            1,
          );
          for (let i = 0; i < fragCount; i++) {
            const position = positions[i];
            const velocity = velocities[i];
            const normal = positionNormals[i];
            const frag = getFragForTarget(target);
            frag.x = position.x;
            frag.y = position.y;
            frag.z = position.z;
            frag.rotateX = target.rotateX;
            frag.rotateY = target.rotateY;
            frag.rotateZ = target.rotateZ;
            const burstSpeed = 2 * force;
            const randSpeed = 2 * force;
            const rotateScale = 0.015;
            frag.xD =
              velocity.x + normal.x * burstSpeed + Math.random() * randSpeed;
            frag.yD =
              velocity.y + normal.y * burstSpeed + Math.random() * randSpeed;
            frag.zD =
              velocity.z + normal.z * burstSpeed + Math.random() * randSpeed;
            frag.rotateXD = frag.xD * rotateScale;
            frag.rotateYD = frag.yD * rotateScale;
            frag.rotateZD = frag.zD * rotateScale;
            frags.push(frag);
          }
        };
      })();
      const returnFrag = (frag: any) => {
        frag.reset();
        const pool = frag.wireframe ? fragWireframePool : fragPool;
        (pool.get(frag.color) as any[]).push(frag);
      };

      const sparks: any[] = [];
      const sparkPool: any[] = [];
      function addSpark(x: number, y: number, xD: number, yD: number) {
        const spark = sparkPool.pop() || {};
        (spark as any).x = x + xD * 0.5;
        (spark as any).y = y + yD * 0.5;
        (spark as any).xD = xD;
        (spark as any).yD = yD;
        (spark as any).life = random(200, 300);
        (spark as any).maxLife = (spark as any).life;
        sparks.push(spark);
        return spark;
      }
      function sparkBurst(
        x: number,
        y: number,
        count: number,
        maxSpeed: number,
      ) {
        const angleInc = TAU / count;
        for (let i = 0; i < count; i++) {
          const angle = i * angleInc + angleInc * Math.random();
          const speed = (1 - Math.random() ** 3) * maxSpeed;
          addSpark(x, y, Math.sin(angle) * speed, Math.cos(angle) * speed);
        }
      }
      let glueShedVertices: any[] | undefined;
      function glueShedSparks(target: any) {
        if (!glueShedVertices) {
          glueShedVertices = cloneVertices(target.vertices);
        } else {
          copyVerticesTo(target.vertices, glueShedVertices);
        }
        glueShedVertices.forEach((v: any) => {
          if (Math.random() < 0.4) {
            projectVertex(v);
            addSpark(v.x, v.y, random(-12, 12), random(-12, 12));
          }
        });
      }
      function returnSpark(spark: any) {
        sparkPool.push(spark);
      }

      const hudContainerNode = $(".hud");
      function setHudVisibility(visible: boolean) {
        if (visible) {
          (hudContainerNode as any).style.display = "block";
        } else {
          (hudContainerNode as any).style.display = "none";
        }
      }
      const scoreNode = $(".score-lbl");
      const cubeCountNode = $(".cube-count-lbl");
      function renderScoreHud() {
        (scoreNode as any).innerText = `SCORE: ${state.game.score}`;
        (scoreNode as any).style.display = "block";
        (cubeCountNode as any).style.opacity = isCasualGame() ? 1 : 0.65;
        (cubeCountNode as any).innerText =
          `CUBES SMASHED: ${state.game.cubeCount}`;
      }
      renderScoreHud();
      handlePointerDown($(".pause-btn"), () => pauseGame());

      const slowmoNode = $(".slowmo");
      const slowmoBarNode = $(".slowmo__bar");
      function renderSlowmoStatus(percentRemaining: number) {
        (slowmoNode as any).style.opacity = percentRemaining === 0 ? 0 : 1;
        (slowmoBarNode as any).style.transform =
          `scaleX(${percentRemaining.toFixed(3)})`;
      }

      const menuContainerNode = $(".menus");
      const menuMainNode = root.querySelector(".menu--main");
      const menuPauseNode = root.querySelector(".menu--pause");
      const menuScoreNode = root.querySelector(".menu--score");
      const finalScoreLblNode = $(".final-score-lbl");
      const highScoreLblNode = $(".high-score-lbl");

      function showMenu(node: Element | null) {
        node && node.classList.add("active");
      }
      function hideMenu(node: Element | null) {
        node && node.classList.remove("active");
      }
      function renderMenus() {
        hideMenu(menuMainNode);
        hideMenu(menuPauseNode);
        hideMenu(menuScoreNode);
        switch (state.menus.active) {
          case MENU_MAIN:
            showMenu(menuMainNode);
            break;
          case MENU_PAUSE:
            showMenu(menuPauseNode);
            break;
          case MENU_SCORE:
            if (gameOver) {
              (finalScoreLblNode as any).textContent = formatNumber(
                state.game.score,
              );
              if (isNewHighScore()) {
                (highScoreLblNode as any).textContent = "New High Score!";
              } else {
                (highScoreLblNode as any).textContent =
                  `High Score: ${formatNumber(getHighScore())}`;
              }
              showMenu(menuScoreNode);
            } else {
              // Ignore spurious score menu requests while playing
              state.menus.active = null;
            }
            break;
        }
        (menuContainerNode as any).classList.toggle(
          "has-active",
          isMenuVisible(),
        );
        (menuContainerNode as any).classList.toggle(
          "interactive-mode",
          isMenuVisible() && pointerIsDown,
        );
        setHudVisibility(!isMenuVisible());
        (canvas as any).style.pointerEvents = isMenuVisible() ? "none" : "auto";
      }
      renderMenus();

      // Button Actions
      handleClick(root.querySelector(".play-normal-btn"), () => {
        if (!external.canPlay()) {
          external.requireWallet();
          return;
        }
        setGameMode(GAME_MODE_RANKED);
        setActiveMenu(null);
        resetGame();
      });
      handleClick(root.querySelector(".play-casual-btn"), () => {
        if (!external.canPlay()) {
          external.requireWallet();
          return;
        }
        setGameMode(GAME_MODE_CASUAL);
        setActiveMenu(null);
        resetGame();
      });
      handleClick(root.querySelector(".resume-btn"), () => resumeGame());
      handleClick(root.querySelector(".menu-btn--pause"), () =>
        setActiveMenu(MENU_MAIN),
      );
      handleClick(root.querySelector(".play-again-btn"), () => {
        setActiveMenu(null);
        resetGame();
      });
      handleClick(root.querySelector(".menu-btn--score"), () =>
        setActiveMenu(MENU_MAIN),
      );
      handleClick(root.querySelector(".submit-score-btn"), () => {
        external.submitScore(state.game.score);
      });
      handleClick(root.querySelector(".menu--main .leaderboard-btn"), () =>
        external.openLeaderboard(),
      );
      handleClick(root.querySelector(".menu--score .leaderboard-btn"), () =>
        external.openLeaderboard(),
      );

      function setActiveMenu(menu: any) {
        state.menus.active = menu;
        renderMenus();
      }
      function setScore(score: number) {
        state.game.score = score;
        renderScoreHud();
      }
      function incrementScore(inc: number) {
        if (isInGame()) {
          state.game.score += inc;
          if (state.game.score < 0) state.game.score = 0;
          renderScoreHud();
        }
      }
      function setCubeCount(count: number) {
        state.game.cubeCount = count;
        renderScoreHud();
      }
      function incrementCubeCount(inc: number) {
        if (isInGame()) {
          state.game.cubeCount += inc;
          renderScoreHud();
        }
      }
      function setGameMode(mode: any) {
        state.game.mode = mode;
      }
      function resetGame() {
        gameOver = false;
        resetAllTargets();
        state.game.time = 0;
        resetAllCooldowns();
        setScore(0);
        setCubeCount(0);
        spawnTime = getSpawnDelay();
      }
      function pauseGame() {
        isInGame() && setActiveMenu(MENU_PAUSE);
      }
      function resumeGame() {
        isPaused() && setActiveMenu(null);
      }
      function endGame() {
        handleCanvasPointerUp();
        if (isNewHighScore()) {
          setHighScore(state.game.score);
        }
        gameOver = true;
        setActiveMenu(MENU_SCORE);
      }
      (window as any).addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key === "p") {
          isPaused() ? resumeGame() : pauseGame();
        }
      });

      let spawnTime = 0;
      const maxSpawnX = 450;
      const pointerDelta = { x: 0, y: 0 };
      const pointerDeltaScaled = { x: 0, y: 0 };
      const slowmoDuration = 1500;
      let slowmoRemaining = 0;
      let spawnExtra = 0;
      const spawnExtraDelay = 300;
      let targetSpeed = 1;

      function tick(
        width: number,
        height: number,
        simTime: number,
        simSpeed: number,
        lag: number,
      ) {
        PERF_START("frame");
        PERF_START("tick");
        state.game.time += simTime;
        if (slowmoRemaining > 0) {
          slowmoRemaining -= simTime;
          if (slowmoRemaining < 0) slowmoRemaining = 0;
          targetSpeed = pointerIsDown ? 0.075 : 0.3;
        } else {
          const menuPointerDown = isMenuVisible() && pointerIsDown;
          targetSpeed = menuPointerDown ? 0.025 : 1;
        }
        renderSlowmoStatus(slowmoRemaining / slowmoDuration);
        gameSpeed += ((targetSpeed - gameSpeed) / 22) * lag;
        gameSpeed = clamp(gameSpeed, 0, 1);
        const centerX = width / 2;
        const centerY = height / 2;
        const simAirDrag = 1 - airDrag * simSpeed;
        const simAirDragSpark = 1 - airDragSpark * simSpeed;
        const forceMultiplier = 1 / (simSpeed * 0.75 + 0.25);
        pointerDelta.x = 0;
        pointerDelta.y = 0;
        pointerDeltaScaled.x = 0;
        pointerDeltaScaled.y = 0;
        const lastPointer = touchPoints[touchPoints.length - 1] as any;
        if (pointerIsDown && lastPointer && !lastPointer.touchBreak) {
          pointerDelta.x = pointerScene.x - lastPointer.x;
          pointerDelta.y = pointerScene.y - lastPointer.y;
          pointerDeltaScaled.x = pointerDelta.x * forceMultiplier;
          pointerDeltaScaled.y = pointerDelta.y * forceMultiplier;
        }
        const pointerSpeed = Math.hypot(pointerDelta.x, pointerDelta.y);
        const pointerSpeedScaled = pointerSpeed * forceMultiplier;
        touchPoints.forEach((p) => ((p as any).life -= simTime));
        if (pointerIsDown) {
          touchPoints.push({
            x: pointerScene.x,
            y: pointerScene.y,
            life: touchPointLife,
          });
        }
        while (touchPoints[0] && (touchPoints[0] as any).life <= 0) {
          touchPoints.shift();
        }
        PERF_START("entities");
        spawnTime -= simTime;
        if (spawnTime <= 0) {
          if (spawnExtra > 0) {
            spawnExtra--;
            spawnTime = spawnExtraDelay;
          } else {
            spawnTime = getSpawnDelay();
          }
          const target = getTarget();
          const spawnRadius = Math.min(centerX * 0.8, maxSpawnX);
          target.x = Math.random() * spawnRadius * 2 - spawnRadius;
          target.y = centerY + targetHitRadius * 2;
          target.z = Math.random() * targetRadius * 2 - targetRadius;
          target.xD = Math.random() * ((target.x * -2) / 120);
          target.yD = -20;
          const targetData = target as any;
          targetData.spawnY = target.y;
          targetData.minY = target.y;
          targetData.hasPeaked = false;
          targets.push(target);
        }
        const leftBound = -centerX + targetRadius;
        const rightBound = centerX - targetRadius;
        const ceiling = -centerY - 120;
        const boundDamping = 0.4;
        targetLoop: for (let i = targets.length - 1; i >= 0; i--) {
          const target = targets[i];
          const targetData = target as any;
          target.x += target.xD * simSpeed;
          target.y += target.yD * simSpeed;
          if (target.y < ceiling) {
            target.y = ceiling;
            target.yD = 0;
          }
          if (target.x < leftBound) {
            target.x = leftBound;
            target.xD *= -boundDamping;
          } else if (target.x > rightBound) {
            target.x = rightBound;
            target.xD *= -boundDamping;
          }
          if (target.z < backboardZ) {
            target.z = backboardZ;
            target.zD *= -boundDamping;
          }
          if (targetData.minY === undefined || target.y < targetData.minY) {
            targetData.minY = target.y;
          }
          target.yD += gravity * simSpeed;
          if (
            targetData.hasPeaked === false &&
            target.yD > 0 &&
            targetData.spawnY !== undefined
          ) {
            const apexTravel =
              (targetData.spawnY as number) -
              (targetData.minY ?? targetData.spawnY);
            if (apexTravel >= targetApexThreshold) {
              targetData.hasPeaked = true;
            }
          }
          target.rotateX += target.rotateXD * simSpeed;
          target.rotateY += target.rotateYD * simSpeed;
          target.rotateZ += target.rotateZD * simSpeed;
          target.transform();
          target.project();
          if (target.y > centerY + targetHitRadius * 2) {
            const peaked = targetData.hasPeaked === true;
            targets.splice(i, 1);
            returnTarget(target);
            if (isInGame() && peaked) {
              endGame();
            }
            continue;
          }
          const hitTestCount = Math.ceil((pointerSpeed / targetRadius) * 2);
          for (let ii = 1; ii <= hitTestCount; ii++) {
            const percent = 1 - ii / hitTestCount;
            const hitX = pointerScene.x - pointerDelta.x * percent;
            const hitY = pointerScene.y - pointerDelta.y * percent;
            const distance = Math.hypot(
              hitX - (target.projected as any).x,
              hitY - (target.projected as any).y,
            );
            if (distance <= targetHitRadius) {
              if (!target.hit) {
                target.hit = true;
                target.xD += pointerDeltaScaled.x * hitDampening;
                target.yD += pointerDeltaScaled.y * hitDampening;
                target.rotateXD += pointerDeltaScaled.y * 0.001;
                target.rotateYD += pointerDeltaScaled.x * 0.001;
                const sparkSpeed = 7 + pointerSpeedScaled * 0.125;
                if (pointerSpeedScaled > minPointerSpeed) {
                  target.health--;
                  incrementScore(10);
                  playSound(sfx.ninja);
                  if (target.health <= 0) {
                    incrementCubeCount(1);
                    createBurst(target, forceMultiplier);
                    sparkBurst(hitX, hitY, 8, sparkSpeed);
                    if (target.wireframe) {
                      slowmoRemaining = slowmoDuration;
                      spawnTime = 0;
                      spawnExtra = 2;
                    }
                    targets.splice(i, 1);
                    returnTarget(target);
                  } else {
                    sparkBurst(hitX, hitY, 8, sparkSpeed);
                    glueShedSparks(target);
                    updateTargetHealth(target, 0);
                  }
                } else {
                  incrementScore(5);
                  playSound(sfx.ninja);
                  sparkBurst(hitX, hitY, 3, sparkSpeed);
                }
              }
              continue targetLoop;
            }
          }
          target.hit = false;
        }
        const fragBackboardZ = backboardZ + fragRadius;
        const fragLeftBound = -width;
        const fragRightBound = width;
        for (let i = frags.length - 1; i >= 0; i--) {
          const frag = frags[i];
          frag.x += frag.xD * simSpeed;
          frag.y += frag.yD * simSpeed;
          frag.z += frag.zD * simSpeed;
          frag.xD *= simAirDrag;
          frag.yD *= simAirDrag;
          frag.zD *= simAirDrag;
          if (frag.y < ceiling) {
            frag.y = ceiling;
            frag.yD = 0;
          }
          if (frag.z < fragBackboardZ) {
            frag.z = fragBackboardZ;
            frag.zD *= -boundDamping;
          }
          frag.yD += gravity * simSpeed;
          frag.rotateX += frag.rotateXD * simSpeed;
          frag.rotateY += frag.rotateYD * simSpeed;
          frag.rotateZ += frag.rotateZD * simSpeed;
          frag.transform();
          frag.project();
          if (
            (frag.projected as any).y > centerY + targetHitRadius ||
            (frag.projected as any).x < fragLeftBound ||
            (frag.projected as any).x > fragRightBound ||
            frag.z > cameraFadeEndZ
          ) {
            frags.splice(i, 1);
            returnFrag(frag);
            continue;
          }
        }
        for (let i = sparks.length - 1; i >= 0; i--) {
          const spark = sparks[i];
          (spark as any).life -= simTime;
          if ((spark as any).life <= 0) {
            sparks.splice(i, 1);
            returnSpark(spark);
            continue;
          }
          (spark as any).x += (spark as any).xD * simSpeed;
          (spark as any).y += (spark as any).yD * simSpeed;
          (spark as any).xD *= simAirDragSpark;
          (spark as any).yD *= simAirDragSpark;
          (spark as any).yD += gravity * simSpeed;
        }
        PERF_END("entities");
        PERF_START("3D");
        allVertices.length = 0;
        allPolys.length = 0;
        allShadowVertices.length = 0;
        allShadowPolys.length = 0;
        targets.forEach((entity) => {
          allVertices.push(...entity.vertices);
          allPolys.push(...entity.polys);
          allShadowVertices.push(...entity.shadowVertices);
          allShadowPolys.push(...entity.shadowPolys);
        });
        frags.forEach((entity) => {
          allVertices.push(...entity.vertices);
          allPolys.push(...entity.polys);
          allShadowVertices.push(...entity.shadowVertices);
          allShadowPolys.push(...entity.shadowPolys);
        });
        allPolys.forEach((p) => computePolyNormal(p, "normalWorld"));
        allPolys.forEach(computePolyDepth);
        allPolys.sort((a, b) => b.depth - a.depth);
        allVertices.forEach(projectVertex);
        allPolys.forEach((p) => computePolyNormal(p, "normalCamera"));
        PERF_END("3D");
        PERF_START("shadows");
        transformVertices(
          allShadowVertices,
          allShadowVertices,
          0,
          0,
          0,
          TAU / 8,
          0,
          0,
          1,
          1,
          1,
        );
        allShadowPolys.forEach((p) => computePolyNormal(p, "normalWorld"));
        const shadowDistanceMult = Math.hypot(1, 1);
        const shadowVerticesLength = allShadowVertices.length;
        for (let i = 0; i < shadowVerticesLength; i++) {
          const distance = allVertices[i].z - backboardZ;
          allShadowVertices[i].z -= shadowDistanceMult * distance;
        }
        transformVertices(
          allShadowVertices,
          allShadowVertices,
          0,
          0,
          0,
          -TAU / 8,
          0,
          0,
          1,
          1,
          1,
        );
        allShadowVertices.forEach(projectVertex);
        PERF_END("shadows");
        PERF_END("tick");
      }

      function draw(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        viewScale: number,
      ) {
        PERF_START("draw");
        const halfW = width / 2;
        const halfH = height / 2;
        ctx.lineJoin = "bevel";
        PERF_START("drawShadows");
        ctx.fillStyle = shadowColor;
        ctx.strokeStyle = shadowColor;
        allShadowPolys.forEach((p) => {
          if (p.wireframe) {
            ctx.lineWidth = 2;
            ctx.beginPath();
            const { vertices } = p;
            const vCount = vertices.length;
            const firstV = vertices[0];
            ctx.moveTo(firstV.x, firstV.y);
            for (let i = 1; i < vCount; i++) {
              const v = vertices[i];
              ctx.lineTo(v.x, v.y);
            }
            ctx.closePath();
            ctx.stroke();
          } else {
            ctx.beginPath();
            const { vertices } = p;
            const vCount = vertices.length;
            const firstV = vertices[0];
            ctx.moveTo(firstV.x, firstV.y);
            for (let i = 1; i < vCount; i++) {
              const v = vertices[i];
              ctx.lineTo(v.x, v.y);
            }
            ctx.closePath();
            ctx.fill();
          }
        });
        PERF_END("drawShadows");
        PERF_START("drawPolys");
        allPolys.forEach((p) => {
          if (!p.wireframe && p.normalCamera.z < 0) return;
          if (p.strokeWidth !== 0) {
            ctx.lineWidth =
              p.normalCamera.z < 0 ? p.strokeWidth * 0.5 : p.strokeWidth;
            ctx.strokeStyle =
              p.normalCamera.z < 0 ? p.strokeColorDark : p.strokeColor;
          }
          const { vertices } = p;
          const lastV = vertices[vertices.length - 1];
          const fadeOut = p.middle.z > cameraFadeStartZ;
          if (!p.wireframe) {
            const normalLight = p.normalWorld.y * 0.5 + p.normalWorld.z * -0.5;
            const lightness =
              normalLight > 0
                ? 0.1
                : ((normalLight ** 32 - normalLight) / 2) * 0.9 + 0.1;
            ctx.fillStyle = shadeColor(p.color, lightness);
          }
          if (fadeOut) {
            ctx.globalAlpha = Math.max(
              0,
              1 - (p.middle.z - cameraFadeStartZ) / cameraFadeRange,
            );
          }
          ctx.beginPath();
          ctx.moveTo(lastV.x, lastV.y);
          for (let v of vertices) {
            ctx.lineTo(v.x, v.y);
          }
          if (!p.wireframe) {
            ctx.fill();
          }
          if (p.strokeWidth !== 0) {
            ctx.stroke();
          }
          if (fadeOut) {
            ctx.globalAlpha = 1;
          }
        });
        PERF_END("drawPolys");
        PERF_START("draw2D");
        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = sparkThickness;
        ctx.beginPath();
        sparks.forEach((spark) => {
          ctx.moveTo((spark as any).x, (spark as any).y);
          const scale =
            ((spark as any).life / (spark as any).maxLife) ** 0.5 * 1.5;
          ctx.lineTo(
            (spark as any).x - (spark as any).xD * scale,
            (spark as any).y - (spark as any).yD * scale,
          );
        });
        ctx.stroke();
        ctx.strokeStyle = touchTrailColor;
        const touchPointCount = touchPoints.length;
        for (let i = 1; i < touchPointCount; i++) {
          const current = touchPoints[i] as any;
          const prev = touchPoints[i - 1] as any;
          if (current.touchBreak || prev.touchBreak) {
            continue;
          }
          const scale = current.life / touchPointLife;
          ctx.lineWidth = scale * touchTrailThickness;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(current.x, current.y);
          ctx.stroke();
        }
        PERF_END("draw2D");
        PERF_END("draw");
        PERF_END("frame");
        PERF_UPDATE();
      }

      function setupCanvas() {
        const ctx = canvas.getContext("2d")!;
        const dpr = (window as any).devicePixelRatio || 1;
        let viewScale: number;
        let width: number, height: number;
        function handleResize() {
          const w = window.innerWidth;
          const h = window.innerHeight;
          viewScale = h / 1000;
          width = w / viewScale;
          height = h / viewScale;
          canvas.width = w * dpr;
          canvas.height = h * dpr;
          (canvas as any).style.width = w + "px";
          (canvas as any).style.height = h + "px";
        }
        handleResize();
        (window as any).addEventListener("resize", handleResize);
        let lastTimestamp = 0;
        function frameHandler(timestamp: number) {
          let frameTime = timestamp - lastTimestamp;
          lastTimestamp = timestamp;
          raf();
          // Halt updates when any menu is visible (main, pause, or score)
          if (isMenuVisible()) return;
          if (frameTime < 0) {
            frameTime = 17;
          } else if (frameTime > 68) {
            frameTime = 68;
          }
          const halfW = width / 2;
          const halfH = height / 2;
          pointerScene.x = (pointerScreen.x as any) / viewScale - halfW;
          pointerScene.y = (pointerScreen.y as any) / viewScale - halfH;
          const lag = frameTime / 16.6667;
          const simTime = gameSpeed * frameTime;
          const simSpeed = gameSpeed * lag;
          tick(width, height, simTime, simSpeed, lag);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const drawScale = dpr * viewScale;
          ctx.scale(drawScale, drawScale);
          ctx.translate(halfW, halfH);
          draw(ctx, width, height, viewScale);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        const raf = () => requestAnimationFrame(frameHandler);
        raf();
      }

      function handleCanvasPointerDown(x: number, y: number) {
        if (isMenuVisible()) {
          return;
        }
        if (!pointerIsDown) {
          pointerIsDown = true;
          (pointerScreen as any).x = x;
          (pointerScreen as any).y = y;
          playSound(sfx.click);
        }
      }
      function handleCanvasPointerUp() {
        if (pointerIsDown) {
          pointerIsDown = false;
          touchPoints.push({ touchBreak: true, life: touchPointLife });
          if (isMenuVisible()) renderMenus();
        }
      }
      function handleCanvasPointerMove(x: number, y: number) {
        if (pointerIsDown) {
          (pointerScreen as any).x = x;
          (pointerScreen as any).y = y;
        }
      }
      if ("PointerEvent" in window) {
        canvas.addEventListener("pointerdown", (event) => {
          (event as any).isPrimary &&
            handleCanvasPointerDown(
              (event as PointerEvent).clientX,
              (event as PointerEvent).clientY,
            );
        });
        canvas.addEventListener("pointerup", (event) => {
          (event as any).isPrimary && handleCanvasPointerUp();
        });
        canvas.addEventListener("pointermove", (event) => {
          (event as any).isPrimary &&
            handleCanvasPointerMove(
              (event as PointerEvent).clientX,
              (event as PointerEvent).clientY,
            );
        });
        document.body.addEventListener("mouseleave", handleCanvasPointerUp);
      } else {
        let activeTouchId: number | null = null;
        canvas.addEventListener("touchstart", (event) => {
          if (!pointerIsDown) {
            const touch = (event as TouchEvent).changedTouches[0];
            activeTouchId = touch.identifier;
            handleCanvasPointerDown(touch.clientX, touch.clientY);
          }
        });
        canvas.addEventListener("touchend", (event) => {
          for (let touch of (event as TouchEvent).changedTouches) {
            if (touch.identifier === activeTouchId) {
              handleCanvasPointerUp();
              break;
            }
          }
        });
        canvas.addEventListener(
          "touchmove",
          (event) => {
            for (let touch of (event as TouchEvent).changedTouches) {
              if (touch.identifier === activeTouchId) {
                handleCanvasPointerMove(touch.clientX, touch.clientY);
                (event as any).preventDefault();
                break;
              }
            }
          },
          { passive: false } as any,
        );
      }

      setupCanvas();

      const external = {
        canPlay: () => canPlay,
        requireWallet: () => {
          onRequireWallet && onRequireWallet();
        },
        submitScore: (score: number) => {
          onSubmitScore(score);
        },
        openLeaderboard: () => {
          onOpenLeaderboard && onOpenLeaderboard();
        },
        startIfReady: () => {
          if (canPlay && !startedRef.current) {
            startedRef.current = true;
            setActiveMenu(null);
            resetGame();
            onAutoStart && onAutoStart();
          }
        },
        getCurrentScore: () => state.game.score,
      };

      (root as any).__blockNinjaApi = external;
    })();

    return () => {
      // cleanup not strictly needed for single-page use
    };
  }, [canPlay, onSubmitScore, onAutoStart]);

  useEffect(() => {
    const api = (rootRef.current as any)?.__blockNinjaApi;
    if (api) api.startIfReady();
  }, [canPlay]);

  return (
    <div ref={rootRef} className="block-ninja-root">
      <canvas id="c"></canvas>
      <div className="hud">
        <div className="hud__score">
          <div className="score-lbl"></div>
          <div className="cube-count-lbl"></div>
        </div>
        <div className="pause-btn">
          <div></div>
        </div>
        <div className="slowmo">
          <div className="slowmo__bar"></div>
        </div>
      </div>
      <div className="menus">
        <div className="menu menu--main">
          <h1>Block Ninja</h1>
          <button type="button" className="play-normal-btn">
            PLAY GAME
          </button>
          <button type="button" className="play-casual-btn">
            CASUAL MODE
          </button>
          <button type="button" className="leaderboard-btn">
            LEADERBOARD
          </button>
        </div>
        <div className="menu menu--pause">
          <h1>Paused</h1>
          <button type="button" className="resume-btn">
            RESUME GAME
          </button>
          <button type="button" className="menu-btn--pause">
            MAIN MENU
          </button>
        </div>
        <div className="menu menu--score">
          <h1>Game Over</h1>
          <h2>Your Score:</h2>
          <div className="final-score-lbl"></div>
          <div className="high-score-lbl"></div>
          <button type="button" className="play-again-btn">
            PLAY AGAIN
          </button>
          <button type="button" className="menu-btn--score">
            MAIN MENU
          </button>
          <button type="button" className="submit-score-btn">
            SUBMIT SCORE
          </button>
          <button type="button" className="leaderboard-btn">
            LEADERBOARD
          </button>
        </div>
      </div>
    </div>
  );
}
