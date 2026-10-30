import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { RoomItemId } from "@/lib/room-content";

export type RoomObject = {
  root: T.Group;
  pieces: { node: T.Object3D; home: T.Vector3; offset: T.Vector3 }[];
};
const mats = {
  wood: new T.MeshStandardMaterial({ color: "#795036", roughness: 0.65 }),
  edge: new T.MeshStandardMaterial({ color: "#3d281e", roughness: 0.65 }),
  brass: new T.MeshStandardMaterial({
    color: "#c29a59",
    metalness: 0.68,
    roughness: 0.3,
  }),
  black: new T.MeshStandardMaterial({
    color: "#171c22",
    roughness: 0.72,
    metalness: 0.08,
  }),
  rubber: new T.MeshStandardMaterial({ color: "#101316", roughness: 0.85 }),
  silver: new T.MeshStandardMaterial({
    color: "#c5cbd0",
    metalness: 0.92,
    roughness: 0.34,
  }),
  cream: new T.MeshStandardMaterial({ color: "#d8ccb1", roughness: 0.7 }),
  green: new T.MeshStandardMaterial({
    color: "#3e6655",
    metalness: 0.2,
    roughness: 0.4,
  }),
  glass: new T.MeshPhysicalMaterial({
    color: "#14201e",
    metalness: 0.18,
    roughness: 0.09,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    ior: 1.52,
  }),
};
function prepareSurfaceTextures() {
  const grain = texture((c) => {
    c.fillStyle = "#a69a87";
    c.fillRect(0, 0, 768, 480);
    for (let i = 0; i < 420; i++) {
      const x = (i * 127.31) % 768;
      c.strokeStyle = i % 3 ? "rgba(49,37,24,.12)" : "rgba(235,219,191,.13)";
      c.lineWidth = 0.4 + (i % 4) * 0.3;
      c.beginPath();
      c.moveTo(x, 0);
      c.bezierCurveTo(x + Math.sin(i) * 8, 160, x - Math.cos(i) * 6, 320, x + 2, 480);
      c.stroke();
    }
  });
  grain.wrapS = grain.wrapT = T.RepeatWrapping;
  grain.repeat.set(2, 1);
  mats.wood.map = grain;
  mats.wood.bumpMap = grain;
  mats.wood.bumpScale = 0.012;
  mats.edge.map = grain;
  mats.edge.bumpMap = grain;
  mats.edge.bumpScale = 0.008;
  // Fine leather grain on the camera body and soft-touch black surfaces.
  const leather = texture((c) => {
    c.fillStyle = "#b6b6b6";
    c.fillRect(0, 0, 768, 480);
    for (let i = 0; i < 18000; i++) {
      const x = (i * 73.163) % 768, y = (i * 97.733) % 480;
      c.fillStyle = i % 2 ? "#888888" : "#dddddd";
      c.fillRect(x, y, 1.2, 1.2);
    }
  });
  leather.colorSpace = T.NoColorSpace;
  mats.black.bumpMap = leather;
  mats.black.bumpScale = 0.004;
  for (const mat of Object.values(mats)) mat.needsUpdate = true;
}
// Mesh primitives are shared within this scene; the renderer disposes them on teardown.
function box(
  parent: T.Object3D,
  size: [number, number, number],
  pos: [number, number, number],
  mat: T.Material,
  radius = 0.02,
) {
  const mesh = new T.Mesh(new RoundedBoxGeometry(...size, 2, radius), mat);
  mesh.position.set(...pos);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
function cylinder(
  parent: T.Object3D,
  radius: number,
  depth: number,
  pos: [number, number, number],
  mat: T.Material,
  front = false,
) {
  const mesh = new T.Mesh(
    new T.CylinderGeometry(radius, radius, depth, 40),
    mat,
  );
  mesh.position.set(...pos);
  if (front) mesh.rotation.x = Math.PI / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
function piece(
  object: RoomObject,
  node: T.Object3D,
  offset: [number, number, number],
) {
  object.pieces.push({
    node,
    home: node.position.clone(),
    offset: new T.Vector3(...offset),
  });
  return node;
}
function object(): RoomObject {
  return { root: new T.Group(), pieces: [] };
}
function texture(draw: (context: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 480;
  const context = canvas.getContext("2d")!;
  draw(context);
  const result = new T.CanvasTexture(canvas);
  result.colorSpace = T.SRGBColorSpace;
  return result;
}
function laptop() {
  const obj = object();
  const bottom = box(obj.root, [1.55, 0.08, 1.02], [0, 0.06, 0], mats.silver);
  piece(obj, bottom, [0, -0.2, 0]);
  const keyboard = new T.Group();
  keyboard.position.y = 0.115;
  obj.root.add(keyboard);
  box(keyboard, [1.3, 0.015, 0.48], [0, 0, -0.13], mats.black, 0.008);
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 12; col++)
      box(
        keyboard,
        [0.084, 0.015, 0.07],
        [-0.59 + col * 0.108, 0.014, -0.3 + row * 0.11],
        mats.rubber,
        0.006,
      );
  box(keyboard, [0.48, 0.008, 0.27], [0, 0.003, 0.3], mats.silver, 0.015);
  piece(obj, keyboard, [0, 0.22, 0.1]);
  const lid = new T.Group();
  lid.position.set(0, 0.61, -0.43);
  lid.rotation.x = -0.16;
  obj.root.add(lid);
  box(lid, [1.55, 0.98, 0.065], [0, 0, 0], mats.silver);
  box(lid, [1.46, 0.89, 0.02], [0, 0, 0.045], mats.black);
  const screen = texture((c) => {
    c.fillStyle = "#111d23";
    c.fillRect(0, 0, 768, 480);
    c.fillStyle = "#9daea4";
    c.font = "20px monospace";
    c.fillText("SOFTWARE ENGINEERING", 52, 80);
    c.fillStyle = "#f0e5ce";
    c.font = "bold 56px sans-serif";
    c.fillText("Lucio Nigro", 50, 174);
    c.fillStyle = "#cbaa77";
    c.font = "25px monospace";
    c.fillText("Payments. Systems. AI.", 52, 234);
    c.fillStyle = "#53675e";
    c.fillRect(52, 292, 664, 2);
    c.fillStyle = "#a3b5ad";
    c.font = "20px monospace";
    c.fillText("Building things that work.", 52, 348);
  });
  const display = new T.Mesh(
    new T.PlaneGeometry(1.34, 0.76),
    new T.MeshBasicMaterial({ map: screen }),
  );
  display.position.set(0, 0.015, 0.059);
  lid.add(display);
  piece(obj, lid, [0, 0.65, -0.12]);
  return obj;
}
function camera() {
  const obj = object();
  const body = box(obj.root, [1.2, 0.7, 0.5], [0, 0.45, 0], mats.black, 0.055);
  piece(obj, body, [0, 0, -0.22]);
  const top = new T.Group();
  top.position.y = 0.83;
  obj.root.add(top);
  box(top, [1.23, 0.13, 0.52], [0, 0, 0], mats.silver);
  box(top, [0.38, 0.2, 0.39], [0.09, 0.1, -0.035], mats.silver);
  cylinder(top, 0.12, 0.07, [-0.4, 0.1, 0], mats.black);
  cylinder(top, 0.14, 0.08, [0.4, 0.1, 0], mats.silver);
  cylinder(top, 0.035, 0.05, [0.5, 0.15, 0.14], mats.brass);
  piece(obj, top, [0, 0.38, 0]);
  box(obj.root, [0.48, 0.08, 0.01], [-0.19, 0.68, 0.26], mats.silver, 0.003);
  const mount = new T.Mesh(
    new T.TorusGeometry(0.265, 0.036, 12, 48),
    mats.silver,
  );
  mount.position.set(0.12, 0.43, 0.31);
  obj.root.add(mount);
  piece(obj, mount, [0, 0, 0.25]);
  const lens = new T.Group();
  lens.position.set(0.12, 0.43, 0.51);
  obj.root.add(lens);
  cylinder(lens, 0.29, 0.3, [0, 0, 0], mats.black, true);
  for (let i = 0; i < 7; i++)
    cylinder(
      lens,
      0.299,
      0.013,
      [0, 0, -0.1 + i * 0.033],
      mats.rubber,
      true,
    );
  // Focus-ring knurling and a recessed front element, rather than chrome discs.
  for (let i = 0; i < 40; i++) {
    const angle = i * Math.PI * 2 / 40;
    const ridge = box(lens, [0.009, 0.018, 0.12],
      [Math.cos(angle) * 0.3, Math.sin(angle) * 0.3, 0], mats.black, 0.002);
    ridge.rotation.z = angle;
  }
  const rim = new T.Mesh(new T.TorusGeometry(0.246, 0.016, 10, 64), mats.black);
  rim.position.z = 0.17;
  lens.add(rim);
  const optics = texture((c) => {
    c.save(); c.scale(768, 480);
    const surface = c.createRadialGradient(0.48, 0.46, 0.08, 0.5, 0.5, 0.52);
    surface.addColorStop(0, "#060b0b");
    surface.addColorStop(0.5, "#0c1716");
    surface.addColorStop(0.8, "#293e37");
    surface.addColorStop(1, "#111b18");
    c.fillStyle = surface; c.fillRect(0, 0, 1, 1);
    c.strokeStyle = "#718c7d"; c.lineWidth = 0.007;
    c.beginPath(); c.arc(0.5, 0.5, 0.43, 3.3, 4.8); c.stroke();
    c.fillStyle = "#040908"; c.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = i * Math.PI / 3;
      c.lineTo(0.5 + Math.cos(angle) * 0.17, 0.5 + Math.sin(angle) * 0.17);
    }
    c.closePath(); c.fill(); c.restore();
  });
  mats.glass.map = optics;
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 512; labelCanvas.height = 96;
  const labelContext = labelCanvas.getContext("2d")!;
  labelContext.fillStyle = "#222421"; labelContext.fillRect(0, 0, 512, 96);
  labelContext.fillStyle = "#c8cac3"; labelContext.font = "500 48px sans-serif";
  labelContext.fillText("AV-1", 24, 65);
  const labelMap = new T.CanvasTexture(labelCanvas);
  labelMap.colorSpace = T.SRGBColorSpace;
  const label = new T.Mesh(new T.PlaneGeometry(0.46, 0.086), new T.MeshBasicMaterial({ map: labelMap }));
  label.position.set(-0.2, 0.68, 0.267);
  obj.root.add(label);
  piece(obj, lens, [0, 0, 0.6]);
  const glass = cylinder(
    obj.root,
    0.228,
    0.012,
    [0.12, 0.43, 0.674],
    mats.glass,
    true,
  );
  piece(obj, glass, [0, 0, 1.0]);
  cylinder(obj.root, 0.07, 0.02, [-0.46, 0.48, 0.26], mats.brass, true);
  return obj;
}
function guitar() {
  const obj = object();
  const shape = new T.Shape();
  shape.moveTo(0, 0.05);
  shape.bezierCurveTo(-0.57, -0.03, -0.7, 0.35, -0.48, 0.66);
  shape.bezierCurveTo(-0.28, 0.94, -0.45, 1.03, -0.24, 1.16);
  shape.lineTo(-0.1, 0.94);
  shape.lineTo(0.1, 0.94);
  shape.lineTo(0.26, 1.18);
  shape.bezierCurveTo(0.45, 1.08, 0.29, 0.92, 0.49, 0.68);
  shape.bezierCurveTo(0.75, 0.35, 0.55, -0.03, 0, 0.05);
  const body = new T.Mesh(
    new T.ExtrudeGeometry(shape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.045,
      bevelThickness: 0.035,
    }),
    mats.edge,
  );
  body.castShadow = true;
  obj.root.add(body);
  piece(obj, body, [-0.3, 0, -0.1]);
  const pickguard = box(
    obj.root,
    [0.36, 0.53, 0.035],
    [0.07, 0.6, 0.23],
    mats.cream,
    0.08,
  );
  piece(obj, pickguard, [0.25, 0, 0.3]);
  const neck = new T.Group();
  neck.position.set(0, 1.02, 0.13);
  obj.root.add(neck);
  box(neck, [0.17, 1.35, 0.08], [0, 0.64, 0], mats.wood);
  box(neck, [0.15, 1.27, 0.02], [0, 0.6, 0.05], mats.rubber, 0.005);
  for (let i = 0; i < 16; i++)
    box(
      neck,
      [0.15, 0.009, 0.025],
      [0, 0.02 + i * 0.075, 0.065],
      mats.silver,
      0.002,
    );
  box(neck, [0.25, 0.34, 0.08], [0.025, 1.45, 0], mats.wood);
  for (let i = 0; i < 6; i++) {
    const side = i < 3 ? -1 : 1;
    cylinder(
      neck,
      0.035,
      0.045,
      [side * 0.155, 1.35 + (i % 3) * 0.085, 0],
      mats.silver,
      true,
    );
  }
  piece(obj, neck, [0, 0.65, 0]);
  const hardware = new T.Group();
  hardware.position.z = 0.26;
  obj.root.add(hardware);
  box(hardware, [0.23, 0.07, 0.04], [0, 0.31, 0], mats.silver);
  box(hardware, [0.24, 0.08, 0.025], [0, 0.55, 0], mats.black);
  box(hardware, [0.24, 0.08, 0.025], [0, 0.8, 0], mats.black);
  for (let i = 0; i < 3; i++)
    cylinder(
      hardware,
      0.035,
      0.025,
      [0.3, 0.37 + i * 0.13, 0],
      mats.brass,
      true,
    );
  for (let i = 0; i < 6; i++)
    box(
      hardware,
      [0.002, 2.09, 0.002],
      [-0.05 + i * 0.02, 1.36, 0.02],
      mats.silver,
      0.0005,
    );
  piece(obj, hardware, [0.35, 0, 0.42]);
  obj.root.rotation.z = -0.08;
  return obj;
}
function books() {
  const obj = object();
  const colors = ["#797147", "#973f35", "#314f56", "#5d664b", "#b49d78"];
  for (let i = 0; i < 5; i++) {
    const book = new T.Group();
    book.position.set((i - 2) * 0.25, 0.55, 0);
    book.rotation.z = i === 4 ? -0.1 : 0;
    obj.root.add(book);
    const cover = new T.MeshStandardMaterial({
      color: colors[i],
      roughness: 0.8,
    });
    box(book, [0.2, 1.05, 0.65], [0, 0, 0], cover, 0.012);
    box(book, [0.155, 0.98, 0.58], [0, 0, 0.045], mats.cream, 0.005);
    box(book, [0.2, 1.05, 0.025], [0, 0, 0.35], cover, 0.005);
    for (const y of [-0.33, 0.29, 0.37])
      box(book, [0.12, 0.012, 0.008], [0, y, 0.37], mats.brass, 0.002);
    piece(obj, book, [(i - 2) * 0.18, (i % 2) * 0.24, 0]);
  }
  return obj;
}
function cinema() {
  const obj = object();
  const shell = box(
    obj.root,
    [1.8, 1.16, 0.33],
    [0, 0.72, 0],
    mats.black,
    0.06,
  );
  piece(obj, shell, [0, 0, -0.25]);
  box(obj.root, [0.12, 0.22, 0.22], [0, 0.11, 0], mats.black);
  box(obj.root, [0.72, 0.05, 0.45], [0, 0.025, 0.06], mats.black);
  const display = new T.Group();
  display.position.set(0, 0.73, 0.19);
  obj.root.add(display);
  const spiral = texture((c) => {
    c.fillStyle = "#111a22";
    c.fillRect(0, 0, 768, 480);
    c.save();
    c.translate(384, 240);
    c.strokeStyle = "#e3d7bc";
    c.lineWidth = 8;
    c.beginPath();
    for (let a = 0; a < Math.PI * 17; a += 0.03) {
      const r = a * 6.4;
      const x = Math.cos(a) * r,
        y = Math.sin(a) * r * 0.8;
      if (a === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.stroke();
    c.restore();
    c.fillStyle = "#f0e7d4";
    c.font = "500 62px serif";
    c.fillText("VERTIGO", 225, 262);
  });
  const panel = new T.Mesh(
    new T.PlaneGeometry(1.63, 0.94),
    new T.MeshBasicMaterial({ map: spiral }),
  );
  display.add(panel);
  piece(obj, display, [0, 0, 0.55]);
  const frame = box(
    obj.root,
    [1.85, 1.2, 0.04],
    [0, 0.72, 0.24],
    mats.edge,
    0.045,
  );
  // An open bezel, rather than a solid rectangle in front of the image.
  obj.root.remove(frame);
  frame.geometry.dispose();
  const bezel = new T.Group();
  bezel.position.set(0, 0.72, 0.24);
  obj.root.add(bezel);
  box(bezel, [1.84, 0.065, 0.045], [0, 0.565, 0], mats.edge);
  box(bezel, [1.84, 0.065, 0.045], [0, -0.565, 0], mats.edge);
  box(bezel, [0.065, 1.12, 0.045], [-0.89, 0, 0], mats.edge);
  box(bezel, [0.065, 1.12, 0.045], [0.89, 0, 0], mats.edge);
  piece(obj, bezel, [0, 0, 0.85]);
  return obj;
}
export function buildObjects(): Record<RoomItemId, RoomObject> {
  return {
    work: laptop(),
    photo: camera(),
    music: guitar(),
    books: books(),
    cinema: cinema(),
  };
}
export function buildRoom() {
  prepareSurfaceTextures();
  const shell = new T.Group();
  box(shell, [6.7, 0.18, 4.5], [0, -0.16, 0], mats.edge, 0.045);
  for (let i = 0; i < 20; i++)
    box(
      shell,
      [0.326, 0.025, 4.42],
      [-3.17 + i * 0.334, -0.055, 0],
      mats.wood,
      0.003,
    );
  const wall = new T.MeshStandardMaterial({
    color: "#484b43",
    roughness: 0.92,
  });
  box(shell, [6.7, 3.5, 0.12], [0, 1.66, -2.23], wall);
  box(shell, [0.12, 3.5, 4.5], [-3.3, 1.66, 0], wall);
  box(shell, [6.7, 0.1, 0.08], [0, 0.02, -2.14], mats.edge);
  box(shell, [0.08, 0.1, 4.4], [-3.21, 0.02, 0], mats.edge);
  // Desk, shelf, window and lamps echo the original room's layout.
  box(shell, [3.15, 0.13, 1.2], [-0.1, 1.02, -0.65], mats.wood, 0.025);
  for (const x of [-1.5, 1.3])
    for (const z of [-1.1, -0.2])
      box(shell, [0.095, 1, 0.095], [x, 0.46, z], mats.edge);
  const shelfX = -2.58;
  for (const x of [shelfX - 0.53, shelfX + 0.53])
    box(shell, [0.095, 2.65, 0.68], [x, 1.3, -1.59], mats.edge);
  for (const y of [0.02, 0.69, 1.36, 2.03, 2.64])
    box(shell, [1.15, 0.075, 0.72], [shelfX, y, -1.59], mats.wood);
  for (let level = 0; level < 3; level++)
    for (let b = 0; b < 8; b++) {
      const mat = new T.MeshStandardMaterial({
        color: ["#6b4c39", "#5c674c", "#9a704d", "#253b47"][b % 4],
        roughness: 0.8,
      });
      box(
        shell,
        [0.09, 0.34 + (b % 3) * 0.07, 0.43],
        [shelfX - 0.41 + b * 0.115, 0.27 + level * 0.67, -1.57],
        mat,
        0.008,
      );
    }
  // Rug.
  box(
    shell,
    [3.65, 0.015, 1.55],
    [0.1, -0.025, 1.1],
    new T.MeshStandardMaterial({ color: "#663c37", roughness: 1 }),
    0.008,
  );
  for (const z of [0.43, 1.76])
    box(shell, [3.42, 0.008, 0.045], [0.1, -0.01, z], mats.cream, 0.002);
  const window = new T.Group();
  window.position.set(1.85, 2, -2.145);
  shell.add(window);
  box(
    window,
    [1.36, 1.8, 0.05],
    [0, 0, 0],
    new T.MeshStandardMaterial({
      color: "#071c34",
      emissive: "#244664",
      emissiveIntensity: 0.38,
      roughness: 0.5,
    }),
  );
  for (const x of [-0.71, 0, 0.71])
    box(window, [0.06, 1.92, 0.1], [x, 0, 0.04], mats.edge);
  for (const y of [-0.94, 0, 0.94])
    box(window, [1.48, 0.06, 0.1], [0, y, 0.04], mats.edge);
  const moon = new T.Mesh(
    new T.SphereGeometry(0.09, 20, 12),
    new T.MeshBasicMaterial({ color: "#c9e0ed" }),
  );
  moon.position.set(0.31, 0.56, 0.06);
  window.add(moon);
  // Desk lamp.
  cylinder(shell, 0.16, 0.035, [-1.22, 1.12, -0.8], mats.brass);
  cylinder(shell, 0.022, 0.52, [-1.22, 1.4, -0.8], mats.brass);
  const shade = new T.Mesh(
    new T.ConeGeometry(0.26, 0.18, 32, 1, true),
    mats.green,
  );
  shade.position.set(-1.22, 1.73, -0.8);
  shell.add(shade);
  const lamp = new T.PointLight("#ffc681", 6, 2.8, 2);
  lamp.position.set(-1.22, 1.63, -0.7);
  shell.add(lamp);
  // Record player.
  box(shell, [0.92, 0.68, 0.75], [2.32, 0.3, 0.5], mats.edge);
  box(shell, [1, 0.12, 0.8], [2.32, 0.73, 0.5], mats.wood);
  cylinder(shell, 0.32, 0.025, [2.26, 0.81, 0.5], mats.rubber);
  cylinder(shell, 0.09, 0.03, [2.26, 0.83, 0.5], mats.cream);
  box(shell, [0.025, 0.02, 0.38], [2.62, 0.85, 0.49], mats.silver);
  cylinder(shell, 0.028, 0.04, [2.62, 0.84, 0.28], mats.brass);
  return shell;
}
