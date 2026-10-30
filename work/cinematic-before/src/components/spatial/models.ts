import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { terminalSurface, vertigoSurface, cityWindow } from "./live-surfaces";
import type { RoomItemId } from "@/lib/room-content";

export type RoomObject = {
  root: T.Group;
  update?: (seconds: number) => void;
  hover?: (active: boolean) => void;
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
  const terminal = terminalSurface();
  terminal.mesh.position.set(0, 0.015, 0.059);
  lid.add(terminal.mesh);
  obj.update = terminal.update;
  const screenLight = new T.PointLight("#b4c7b0", 0.16, 1.1, 2);
  screenLight.position.set(0, 0.25, 0.25);
  lid.add(screenLight);
  piece(obj, lid, [0, 0.65, -0.12]);
  return obj;
}
function faceLabel(parent: T.Object3D, text: string, width: number, height: number, position: [number, number, number], dark = false, italic = false) {
  const canvas = document.createElement("canvas"); canvas.width = 768; canvas.height = 160;
  const c = canvas.getContext("2d")!;
  c.fillStyle = dark ? "#161917" : "#bec2bd"; c.fillRect(0, 0, 768, 160);
  c.fillStyle = dark ? "#e4e5dd" : "#111513";
  c.font = `${italic ? "italic " : ""}bold ${text.length > 14 ? 55 : 110}px ${italic ? "serif" : "sans-serif"}`;
  c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(text, 384, 86);
  const map = new T.CanvasTexture(canvas); map.colorSpace = T.SRGBColorSpace;
  const label = new T.Mesh(new T.PlaneGeometry(width, height), new T.MeshStandardMaterial({ map, roughness: .45, metalness: .3 }));
  label.position.set(...position); parent.add(label); return label;
}
function camera() {
  const obj = object(); obj.root.name = "Canon AV-1 · FD 50mm";
  const chrome = new T.MeshStandardMaterial({ color: "#b7bcb9", metalness: .82, roughness: .28 });
  const body = box(obj.root, [1.3, .66, .43], [0, .4, 0], mats.black, .035);
  piece(obj, body, [0, 0, -.22]);
  box(obj.root, [1.32, .065, .46], [0, .086, 0], chrome, .016);
  const top = new T.Group(); top.position.y = .755; obj.root.add(top);
  box(top, [1.32, .13, .46], [0, 0, 0], chrome, .02);
  // The characteristic sloped pentaprism, rather than a rectangular block.
  const prism = new T.Shape(); prism.moveTo(-.25, -.015); prism.lineTo(-.24, .15); prism.lineTo(-.12, .27);
  prism.lineTo(.13, .27); prism.lineTo(.25, .15); prism.lineTo(.26, -.015); prism.closePath();
  const hood = new T.Mesh(new T.ExtrudeGeometry(prism, { depth: .34, bevelEnabled: true, bevelSize: .015, bevelThickness: .012, bevelSegments: 2, steps: 1 }), chrome);
  hood.position.set(.035, 0, -.2); top.add(hood);
  box(top, [.23, .035, .22], [.04, .29, -.055], mats.black, .004);
  for (const x of [-.07, .15]) box(top, [.025, .02, .21], [x, .315, -.055], chrome, .003);
  cylinder(top, .115, .068, [-.46, .107, -.035], mats.black);
  box(top, [.15, .015, .035], [-.42, .15, -.035], chrome, .005);
  cylinder(top, .135, .07, [.44, .11, -.02], mats.black);
  cylinder(top, .12, .012, [.44, .15, -.02], chrome);
  cylinder(top, .047, .04, [.49, .12, .15], chrome);
  box(top, [.2, .025, .055], [.47, .05, -.24], mats.black, .01).rotation.y = -.3;
  faceLabel(top, "Canon", .37, .085, [.04, .105, .159]);
  faceLabel(obj.root, "AV-1", .26, .066, [-.44, .68, .237]);
  // Leatherette front panels, shutter timer, strap lugs and lens release.
  box(obj.root, [.22, .31, .014], [-.47, .4, .225], mats.black, .015);
  for (const x of [-.66, .66]) {
    const lug = new T.Mesh(new T.TorusGeometry(.027, .009, 8, 16), chrome);
    lug.position.set(x, .66, .1); obj.root.add(lug);
  }
  cylinder(obj.root, .026, .025, [-.43, .53, .24], chrome, true);
  cylinder(obj.root, .019, .016, [-.43, .53, .26], mats.black, true);
  const lens = new T.Group(); lens.position.set(.08, .4, .28); obj.root.add(lens);
  cylinder(lens, .285, .07, [0, 0, 0], chrome, true);
  cylinder(lens, .27, .29, [0, 0, .17], mats.black, true);
  for (let i = 0; i < 56; i++) {
    const angle = i * Math.PI * 2 / 56;
    const ridge = box(lens, [.009, .018, .13], [Math.cos(angle) * .271, Math.sin(angle) * .271, .14], mats.rubber, .002);
    ridge.rotation.z = angle;
  }
  for (const z of [.055, .245, .31]) cylinder(lens, .275, .016, [0, 0, z], mats.black, true);
  const ringMap = texture(c => {
    c.fillStyle = "#171c19"; c.fillRect(0, 0, 768, 480);
    c.fillStyle = "#dddcd0"; c.font = "18px sans-serif"; c.textAlign = "center";
    for (let i = 0; i < 25; i++) {
      c.save(); c.translate(384, 240); c.rotate((i / 25) * Math.PI * 2);
      c.fillRect(-1, -225, 2, 12); c.restore();
    }
    c.fillText("CANON LENS FD 50mm 1:1.8", 384, 78);
    c.fillText("S.C.      MADE IN JAPAN", 384, 419);
  });
  const ring = new T.Mesh(new T.CircleGeometry(.267, 64), new T.MeshStandardMaterial({ map: ringMap, roughness: .4 }));
  ring.position.z = .322; lens.add(ring);
  const glassMaterial = new T.MeshPhysicalMaterial({ color: "#112d2a", metalness: .48, roughness: .09, clearcoat: 1 });
  const glass = new T.Mesh(new T.CircleGeometry(.18, 64), glassMaterial); glass.position.z = .326; lens.add(glass);
  const iris = new T.Mesh(new T.CircleGeometry(.075, 6), new T.MeshBasicMaterial({ color: "#020706" }));
  iris.position.z = .328; lens.add(iris);
  const highlight = new T.Mesh(new T.TorusGeometry(.147, .003, 8, 48, 1.2), new T.MeshBasicMaterial({ color: "#78968b" }));
  highlight.position.z = .33; highlight.rotation.z = 1; lens.add(highlight);
  piece(obj, top, [0, .38, 0]); piece(obj, lens, [0, 0, .6]);
  // A restrained focus adjustment, keeping the whole camera planted on the desk.
  obj.update = seconds => { lens.rotation.z = Math.sin(seconds * .35) * .025; };
  obj.root.rotation.y = .32;
  return obj;
}
function guitar() {
  const obj = object(); obj.root.name = "Squier Classic Vibe ’50s Telecaster";
  const blonde = new T.MeshPhysicalMaterial({ color: "#d5a34f", map: mats.wood.map, bumpMap: mats.wood.bumpMap, bumpScale: .004, roughness: .27, clearcoat: .85, clearcoatRoughness: .2 });
  const maple = new T.MeshPhysicalMaterial({ color: "#cb9954", map: mats.wood.map, roughness: .32, clearcoat: .7 });
  const nickel = new T.MeshStandardMaterial({ color: "#bfc3bc", metalness: .86, roughness: .24 });
  const guard = new T.MeshStandardMaterial({ color: "#121512", roughness: .38 });
  // A Tele has a broad bass shoulder and one recessed treble cutaway.
  // Keep the perimeter almost square-edged: a large bevel makes it look inflated.
  const outline = new T.Shape(); outline.moveTo(0, .035);
  outline.bezierCurveTo(-.31, .018, -.54, .12, -.55, .34);
  outline.bezierCurveTo(-.57, .52, -.43, .62, -.395, .74);
  outline.bezierCurveTo(-.365, .84, -.455, .96, -.375, 1.075);
  outline.bezierCurveTo(-.31, 1.175, -.18, 1.175, -.095, 1.125);
  outline.lineTo(.095, 1.125);
  outline.lineTo(.105, 1.015);
  outline.bezierCurveTo(.115, .905, .205, .87, .27, .94);
  outline.bezierCurveTo(.31, .985, .315, 1.045, .355, 1.06);
  outline.bezierCurveTo(.43, 1.06, .455, .945, .412, .835);
  outline.bezierCurveTo(.375, .735, .39, .66, .465, .565);
  outline.bezierCurveTo(.6, .39, .565, .22, .455, .125);
  outline.bezierCurveTo(.35, .035, .16, .025, 0, .035); outline.closePath();
  const body = new T.Mesh(new T.ExtrudeGeometry(outline, { depth: .15, bevelEnabled: true, bevelSegments: 4, curveSegments: 32, steps: 1, bevelSize: .009, bevelThickness: .009 }), blonde);
  body.castShadow = true; body.receiveShadow = true; obj.root.add(body); piece(obj, body, [-.3, 0, -.1]);
  const pick = new T.Shape(); pick.moveTo(-.1, 1.08); pick.lineTo(-.1, .95); pick.lineTo(.11, .95); pick.lineTo(.12, 1.07);
  pick.bezierCurveTo(.13, .88, .22, .79, .32, .9);
  pick.bezierCurveTo(.4, .92, .36, .7, .29, .62);
  pick.lineTo(.17, .59); pick.lineTo(-.19, .59);
  pick.bezierCurveTo(-.32, .59, -.38, .7, -.33, .87);
  pick.bezierCurveTo(-.39, 1.06, -.23, 1.14, -.1, 1.08);
  const pickguard = new T.Mesh(new T.ExtrudeGeometry(pick, { depth: .008, bevelEnabled: false, curveSegments: 20 }), guard);
  pickguard.position.z = .163; obj.root.add(pickguard); piece(obj, pickguard, [.25, 0, .3]);
  const neck = new T.Group(); neck.position.set(0, .98, .13); obj.root.add(neck);
  box(neck, [.145, 1.43, .075], [0, .68, 0], maple, .025);
  box(neck, [.153, 1.4, .02], [0, .68, .044], maple, .008);
  const scale = 2.04;
  for (let fret = 1; fret <= 21; fret++) {
    const y = 1.39 - scale * (1 - Math.pow(2, -fret / 12));
    box(neck, [.155, .005, .012], [0, y, .061], nickel, .002);
    if ([3, 5, 7, 9, 12, 15, 17, 19, 21].includes(fret)) {
      const inlayY = y + .5 * scale * (Math.pow(2, -(fret - 1) / 12) - Math.pow(2, -fret / 12));
      for (const x of fret === 12 ? [-.036, .036] : [0]) cylinder(neck, .011, .003, [x, inlayY, .064], guard, true);
    }
  }
  box(neck, [.16, .022, .05], [0, 1.397, .038], mats.cream, .003);
  const headShape = new T.Shape(); headShape.moveTo(-.07, 1.4); headShape.lineTo(-.092, 1.81);
  headShape.bezierCurveTo(-.1, 1.92, .075, 1.93, .12, 1.84);
  headShape.bezierCurveTo(.165, 1.75, .095, 1.66, .075, 1.6); headShape.lineTo(.07, 1.4); headShape.closePath();
  const head = new T.Mesh(new T.ExtrudeGeometry(headShape, { depth: .065, bevelEnabled: true, bevelSize: .012, bevelThickness: .008, bevelSegments: 3 }), maple);
  head.position.z = -.025; head.castShadow = true; neck.add(head);
  for (let i = 0; i < 6; i++) {
    const y = 1.47 + i * .067;
    cylinder(neck, .019, .022, [-.058, y, .067], nickel, true);
    box(neck, [.06, .012, .018], [-.105, y, .015], nickel, .004);
    cylinder(neck, .021, .016, [-.139, y, .015], nickel, true);
  }
  faceLabel(neck, "Squier", .12, .032, [.028, 1.73, .054], false, true).rotation.z = -.08;
  piece(obj, neck, [0, .65, 0]);
  const hardware = new T.Group(); hardware.position.z = .18; obj.root.add(hardware);
  // Ashtray bridge plate, three barrel saddles, angled bridge single-coil.
  box(hardware, [.28, .31, .018], [0, .395, 0], nickel, .01);
  for (const x of [-.136, .136]) box(hardware, [.009, .3, .037], [x, .395, .018], nickel, .002);
  const bridgePickup = box(hardware, [.23, .055, .028], [0, .48, .027], guard, .02); bridgePickup.rotation.z = -.26;
  for (let i = 0; i < 6; i++) cylinder(hardware, .008, .006, [-.089 + i * .036, .48 + (.089 - i * .036) * .25, .047], nickel, true);
  for (let i = 0; i < 3; i++) {
    const saddle = cylinder(hardware, .018, .075, [-.082 + i * .082, .31, .035], mats.brass);
    saddle.rotation.z = Math.PI / 2;
    box(hardware, [.007, .11, .007], [-.082 + i * .082, .28, .04], nickel, .002);
  }
  box(hardware, [.215, .055, .026], [0, .82, .005], nickel, .025);
  box(hardware, [.11, .38, .018], [.35, .4, 0], nickel, .045);
  for (const y of [.28, .45]) {
    cylinder(hardware, .035, .035, [.35, y, .028], nickel, true);
    for (let i = 0; i < 16; i++) {
      const angle = i * Math.PI / 8;
      box(hardware, [.004, .006, .023], [.35 + Math.cos(angle) * .035, y + Math.sin(angle) * .035, .03], mats.black, .001);
    }
  }
  box(hardware, [.012, .055, .012], [.35, .54, .038], guard, .004).rotation.z = -.3;
  for (const [x, y] of [[-.27,.91],[-.29,.69],[.24,.65],[.26,.87],[.15,1.02]]) cylinder(hardware, .007, .004, [x, y, -.003], nickel, true);
  // Six continuous strings from the bridge to the inline tuners.
  const strings: { geometry: T.BufferGeometry; x: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const x = -.054 + i * .0216;
    const points = Array.from({length: 25}, (_, n) => new T.Vector3(x, .3 + n / 24 * 2.075, .052 - n / 24 * .03));
    points.push(new T.Vector3(-.058, 2.45 + i * .067, .017));
    const geometry = new T.BufferGeometry().setFromPoints(points);
    strings.push({geometry, x});
    hardware.add(new T.Line(geometry, new T.LineBasicMaterial({ color: "#b8b7a6" })));
  }
  let hovered = false, pluckedAt = -100, clock = 0;
  obj.hover = active => { if (active && !hovered) pluckedAt = clock; hovered = active; };
  obj.update = seconds => {
    clock = seconds;
    const age = seconds - pluckedAt;
    if (age > 3) return;
    strings.forEach(({geometry, x}, index) => {
      const points = geometry.getAttribute("position");
      const amplitude = Math.exp(-age * 2.3) * .012;
      for (let n = 0; n <= 24; n++) points.setX(n, x + Math.sin(n / 24 * Math.PI) * Math.sin(age * (33 + index * 3)) * amplitude);
      points.needsUpdate = true;
    });
  };
  piece(obj, hardware, [.35, 0, .42]);
  const instrument = new T.Group();
  for (const child of [...obj.root.children]) instrument.add(child);
  instrument.scale.set(.66, 1.06, .46);
  neck.scale.x = 1.2;
  obj.root.add(instrument);
  // Grounded on a stand: no floating or whole-instrument wobble.
  const stand = new T.Group(); obj.root.add(stand);
  for (const x of [-.29, .29]) box(stand, [.045, .045, .6], [x, .02, .04], mats.rubber, .012);
  box(stand, [.04, .85, .04], [0, .4, -.16], mats.black);
  box(stand, [.6, .04, .04], [0, .13, .19], mats.black);
  obj.root.rotation.set(0, .27, -.07);
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
  const film = vertigoSurface();
  display.add(film.mesh);
  obj.update = film.update;
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
  const city = cityWindow(); city.init(); window.add(city.root);
  for (const x of [-.71, 0, .71]) box(window, [.06, 1.92, .1], [x, 0, .19], mats.edge);
  for (const y of [-.94, 0, .94]) box(window, [1.48, .06, .1], [0, y, .19], mats.edge);
  box(window, [1.65, .075, .25], [0, -.98, .14], mats.wood, .008);
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
  const record = new T.Group(); record.position.set(2.26, .83, .5); shell.add(record);
  cylinder(record, .09, .03, [0, 0, 0], mats.cream);
  box(record, [.045, .003, .011], [.043, .017, 0], mats.black, .001);
  box(shell, [0.025, 0.02, 0.38], [2.62, 0.85, 0.49], mats.silver);
  cylinder(shell, 0.028, 0.04, [2.62, 0.84, 0.28], mats.brass);
  return { root: shell, update: (seconds: number) => {
    const daylight = city.update(seconds);
    record.rotation.y = -seconds * Math.PI * 2 * (33 / 60);
    lamp.intensity = 4.8 - daylight * 2.4;
    return daylight;
  } };
}
