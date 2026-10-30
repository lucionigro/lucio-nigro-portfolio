"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as T from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { gsap } from "gsap";
import { buildObjects, buildRoom } from "./models";
import type { RoomItemId } from "@/lib/room-content";

type Props = {
  focusId: RoomItemId | null;
  exploded: boolean;
  paused: boolean;
  zoomRequest?: { direction: -1 | 0 | 1; id: number };
  onSelect: (id: RoomItemId) => void;
  onReady: (ready: boolean) => void;
  label: string;
  anchors?: RefObject<Partial<Record<RoomItemId, HTMLAnchorElement | null>>>;
  leaders?: RefObject<Partial<Record<RoomItemId, SVGLineElement | null>>>;
};
type API = {
  focus: (id: RoomItemId | null) => void;
  explode: (value: boolean) => void;
  sync: () => void;
  zoom: (direction: -1 | 0 | 1) => void;
};

export default function RoomWorld({
  focusId,
  exploded,
  paused,
  zoomRequest,
  onSelect,
  onReady,
  label,
  anchors,
  leaders,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const api = useRef<API | null>(null);
  const latest = useRef({ focusId, exploded, paused, onSelect, onReady });
  useEffect(() => {
    latest.current = { focusId, exploded, paused, onSelect, onReady };
  }, [focusId, exploded, paused, onSelect, onReady]);
  useEffect(() => {
    api.current?.focus(focusId);
  }, [focusId]);
  useEffect(() => {
    api.current?.explode(exploded);
  }, [exploded]);
  useEffect(() => {
    if (zoomRequest) api.current?.zoom(zoomRequest.direction);
  }, [zoomRequest]);
  useEffect(() => {
    api.current?.sync();
  }, [paused]);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer: T.WebGLRenderer;
    try {
      renderer = new T.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      latest.current.onReady(false);
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFShadowMap;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    host.appendChild(renderer.domElement);
    const scene = new T.Scene();
    const pmrem = new T.PMREMGenerator(renderer);
    const environment = new RoomEnvironment();
    const env = pmrem.fromScene(environment, 0.04);
    scene.environment = env.texture;
    scene.environmentIntensity = 0.55;
    environment.dispose();
    pmrem.dispose();
    const camera = new T.PerspectiveCamera(35, 1, 0.1, 80);
    camera.position.set(8, 6.4, 9.5);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.15, 0);
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.zoomSpeed = .7;
    controls.minDistance = 5.2;
    controls.maxDistance = 19;
    controls.touches.ONE = T.TOUCH.ROTATE;
    controls.touches.TWO = T.TOUCH.DOLLY_ROTATE;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minPolarAngle = 0.6;
    controls.maxPolarAngle = 1.43;
    controls.minAzimuthAngle = -0.85;
    controls.maxAzimuthAngle = 1.5;
    const room = buildRoom();
    const shell = room.root;
    scene.add(shell);
    const objects = buildObjects();
    const placements: Record<RoomItemId, [number, number, number]> = {
      work: [0, 1.1, -0.65],
      photo: [-0.88, 1.1, -0.13],
      music: [2.54, 0.02, 1.44],
      books: [-2.57, 2.08, -1.53],
      cinema: [-0.35, 1.82, -2.02],
    };
    const scales: Record<RoomItemId, number> = {
      work: 0.87,
      photo: 0.65,
      music: 1,
      books: 0.56,
      cinema: 1,
    };
    for (const [id, obj] of Object.entries(objects)) {
      const key = id as RoomItemId;
      obj.root.position.set(...placements[key]);
      obj.root.scale.setScalar(scales[key]);
      obj.root.userData.roomId = key;
      scene.add(obj.root);
    }
    const ambient = new T.HemisphereLight("#e5e5dd", "#34312b", 1.5);
    scene.add(ambient);
    const key = new T.DirectionalLight("#fff0d8", 3.6);
    key.position.set(-3, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 5;
    key.shadow.camera.bottom = -5;
    key.shadow.normalBias = 0.035;
    key.shadow.bias = -0.0002;
    scene.add(key);
    const rim = new T.DirectionalLight("#d9e1e0", 1.8);
    rim.position.set(4, 3, -3);
    scene.add(rim);
    const pedestal = new T.Mesh(
      new T.PlaneGeometry(7, 7),
      new T.ShadowMaterial({ color: "#000000", opacity: 0.28 }),
    );
    pedestal.rotation.x = -Math.PI / 2;
    pedestal.position.y = -0.025;
    pedestal.receiveShadow = true;
    pedestal.visible = false;
    scene.add(pedestal);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const noMotion = () => reduced.matches || latest.current.paused;
    let isExploded = false;
    let current: RoomItemId | null = null,
      visible = true,
      last = 0,
      disposed = false;
    const anchorPoints = new Map<RoomItemId, T.Vector3>();
    for (const [id, obj] of Object.entries(objects)) {
      const bounds = new T.Box3().setFromObject(obj.root);
      const point = bounds.getCenter(new T.Vector3());
      point.y = bounds.max.y + 0.08;
      anchorPoints.set(id as RoomItemId, obj.root.worldToLocal(point));
    }
    const projected = new T.Vector3();
    const draw = () => {
      if (disposed) return;
      renderer.render(scene, camera);
      if (!anchors) return;
      const { width, height } = host.getBoundingClientRect();
      const offsets: Record<RoomItemId, [number, number]> = {
        work: [75, 0], photo: [-75, 20], music: [60, 40], books: [-45, -30], cinema: [55, -35],
      };
      const placed: { x: number; y: number; w: number; h: number }[] = [];
      for (const [id, point] of anchorPoints) {
        const anchor = anchors.current[id];
        if (!anchor) continue;
        projected.copy(point);
        objects[id].root.localToWorld(projected);
        projected.project(camera);
        anchor.style.left = "0px";
        anchor.style.top = "0px";
        const originalX = (projected.x * 0.5 + 0.5) * width;
        const originalY = (-projected.y * 0.5 + 0.5) * height;
        const desktopOffsets: Record<RoomItemId, [number, number]> = {
          work: [50, -4], photo: [-95, 5], music: [85, 45], books: [-35, -5], cinema: [20, -15],
        };
        const [dx, dy] = width < 600 ? offsets[id] : desktopOffsets[id];
        const w = anchor.offsetWidth, h = anchor.offsetHeight;
        const x = Math.max(w / 2 + 12, Math.min(width - w / 2 - 12, originalX + dx));
        let y = Math.max(h + 12, Math.min(height - 65, originalY + dy));
        for (let pass = 0; pass < 5; pass++) {
          const collision = placed.find(rect => Math.abs(rect.x - x) < (rect.w + w) / 2 + 7 && Math.abs(rect.y - y) < (rect.h + h) / 2 + 7);
          if (!collision) break;
          y = Math.min(height - 65, collision.y + (collision.h + h) / 2 + 9);
        }
        placed.push({ x, y, w, h });
        anchor.style.transform = `translate(${x}px,${y}px) translate(-50%,-100%)`;
        const opacity = projected.z < 1 && objects[id].root.visible ? "1" : "0";
        anchor.style.opacity = opacity;
        const leader = leaders?.current[id];
        if (leader) {
          leader.setAttribute("x1", String(originalX)); leader.setAttribute("y1", String(originalY));
          leader.setAttribute("x2", String(x)); leader.setAttribute("y2", String(y - 3));
          leader.style.opacity = opacity;
        }
      }
    };
    controls.addEventListener("change", draw);
    const animate = (target: object, vars: gsap.TweenVars) =>
      gsap.to(target, {
        duration: noMotion() ? 0 : 0.95,
        ease: "power3.inOut",
        overwrite: true,
        onUpdate: () => {
          controls.update();
          draw();
        },
        ...vars,
      });
    // Each mesh owns its opacity, so a transition cannot fade a shared material
    // on the object being inspected. All geometry and textures remain shared.
    const fades = new Map<T.Object3D, { value: number; materials: T.Material[] }>();
    const prepareFade = (group: T.Object3D) => {
      const materials: T.Material[] = [];
      group.traverse((node) => {
        if (!(node instanceof T.Mesh) && !(node instanceof T.Line)) return;
        const clone = (material: T.Material) => {
          const copy = material instanceof T.ShaderMaterial ? material : material.clone();
          materials.push(copy);
          return copy;
        };
        node.material = Array.isArray(node.material)
          ? node.material.map(clone) : clone(node.material);
      });
      fades.set(group, { value: 1, materials });
    };
    prepareFade(shell);
    for (const obj of Object.values(objects)) prepareFade(obj.root);
    const applyFades = () => {
      for (const [group, fade] of fades) {
        group.visible = fade.value > 0.002;
        for (const material of fade.materials) {
          const transparent = fade.value < 0.999;
          if (material.transparent !== transparent) {
            material.transparent = transparent;
            material.needsUpdate = true;
          }
          material.opacity = fade.value;
          material.depthWrite = !transparent;
        }
      }
    };
    const dimensions = new Map<RoomItemId, { scale: number; center: T.Vector3 }>();
    const partRotations = new Map<T.Object3D, T.Euler>();
    for (const [id, obj] of Object.entries(objects)) {
      const box = new T.Box3().setFromObject(obj.root);
      const size = box.getSize(new T.Vector3()).divideScalar(scales[id as RoomItemId]);
      const scale = 2.8 / Math.max(size.x, size.y, size.z);
      // Geometry is authored resting on y=0; centre the viewing target, not the mesh.
      dimensions.set(id as RoomItemId, { scale, center: new T.Vector3(0, size.y * scale * 0.5, 0) });
      for (const part of obj.pieces) partRotations.set(part.node, part.node.rotation.clone());
    }
    let transition: gsap.core.Timeline | null = null;
    let assembly: gsap.core.Timeline | null = null;
    const focus = (id: RoomItemId | null) => {
      if (current === id) return;
      current = id;
      isExploded = false;
      transition?.kill();
      assembly?.kill();
      controls.enabled = false;
      controls.minAzimuthAngle = -Infinity;
      controls.maxAzimuthAngle = Infinity;
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(controls.target);
      transition = gsap.timeline({
        defaults: { duration: noMotion() ? 0 : 1.25, ease: "power3.inOut" },
        onUpdate: () => { applyFades(); controls.update(); draw(); },
        onComplete: () => {
          controls.enabled = true;
          if (!id) {
            controls.minAzimuthAngle = -0.85;
            controls.maxAzimuthAngle = 1.5;
          }
          if (id && latest.current.exploded) explode(true);
          draw();
        },
      });
      transition.to(fades.get(shell)!, { value: id ? 0 : 1, duration: noMotion() ? 0 : 0.65 }, id || noMotion() ? 0 : 0.45);
      pedestal.visible = !!id;
      for (const [key, obj] of Object.entries(objects)) {
        const objectId = key as RoomItemId;
        const selected = key === id;
        const destination = selected ? [0, 0, 0] : placements[objectId];
        const scale = selected ? dimensions.get(objectId)!.scale : scales[objectId];
        gsap.killTweensOf([obj.root.position, obj.root.scale, obj.root.rotation]);
        // Reassembly precedes the return flight; switching mid-flight starts from
        // the actual position rather than resetting or replaying an old timeline.
        for (const part of obj.pieces) {
          gsap.killTweensOf([part.node.position, part.node.rotation]);
          const rotation = partRotations.get(part.node)!;
          transition.to(part.node.position, { x: part.home.x, y: part.home.y, z: part.home.z, duration: noMotion() ? 0 : 0.45 }, 0);
          transition.to(part.node.rotation, { x: rotation.x, y: rotation.y, z: rotation.z, duration: noMotion() ? 0 : 0.45 }, 0);
        }
        transition.to(fades.get(obj.root)!, { value: !id || selected ? 1 : 0, duration: noMotion() ? 0 : 0.5 }, selected && !noMotion() ? 0.12 : 0);
        transition.to(obj.root.position, { x: destination[0], y: destination[1], z: destination[2] }, 0);
        transition.to(obj.root.scale, { x: scale, y: scale, z: scale }, 0);
        transition.to(obj.root.rotation, { y: selected ? -0.16 : 0 }, 0);
      }
      const target = id ? dimensions.get(id)!.center : new T.Vector3(0, 1.15, 0);
      transition.to(controls.target, { x: target.x, y: target.y, z: target.z }, 0);
      // Two camera legs make a shallow dolly arc, rather than a straight zoom.
      const end = id ? new T.Vector3(3.1, target.y + 1.65, 5.5) : new T.Vector3(8, 6.4, 9.5);
      transition.to(camera.position, {
        x: (camera.position.x + end.x) * 0.5 + 0.35,
        y: (camera.position.y + end.y) * 0.5 + 0.22,
        z: (camera.position.z + end.z) * 0.5,
        duration: noMotion() ? 0 : 0.6, ease: "power2.in",
      }, 0);
      transition.to(camera.position, { x: end.x, y: end.y, z: end.z, duration: noMotion() ? 0 : 0.65, ease: "power2.out" }, noMotion() ? 0 : 0.6);
    };
    const explode = (value: boolean) => {
      if (!current || value === isExploded) return;
      if (transition?.isActive()) return;
      isExploded = value;
      assembly?.kill();
      const direction = camera.position.clone().sub(controls.target).normalize();
      const destination = controls.target.clone().addScaledVector(direction, value ? 9.2 : 6.5);
      animate(camera.position, { x: destination.x, y: destination.y, z: destination.z });
      assembly = gsap.timeline({
        defaults: { duration: noMotion() ? 0 : 0.85, ease: "power3.inOut" },
        onUpdate: () => { controls.update(); draw(); },
      });
      const parts = objects[current].pieces;
      for (const [i, part] of parts.entries()) {
        const homeRotation = partRotations.get(part.node)!;
        const at = noMotion() ? 0 : (value ? i : parts.length - 1 - i) * 0.09;
        assembly.to(part.node.position, {
          x: part.home.x + part.offset.x * (value ? 1 : 0),
          y: part.home.y + part.offset.y * (value ? 1 : 0),
          z: part.home.z + part.offset.z * (value ? 1 : 0),
        }, at);
        assembly.to(part.node.rotation, {
          y: homeRotation.y,
          z: homeRotation.z + (value && current === "books" ? (i - 2) * 0.08 : value && current === "photo" && part.node instanceof T.Group && part.offset.z > 0.4 ? Math.PI * 0.55 : 0),
        }, at);
      }
    };
    let elapsed = 0;
    room.update(0);
    ambient.intensity = .7; key.intensity = 1.7; rim.intensity = .65;
    scene.environmentIntensity = .42;
    for (const obj of Object.values(objects)) obj.update?.(0);
    const sync = () => {
      last = 0;
      if (noMotion()) {
        transition?.progress(1);
        assembly?.progress(1);
        gsap.getTweensOf(camera.position).forEach((tween) => tween.progress(1));
      }
      controls.enableDamping = !reduced.matches && !latest.current.paused;
      renderer.setAnimationLoop(
        visible &&
          !document.hidden &&
          !latest.current.paused &&
          !reduced.matches
          ? frame
          : null,
      );
      draw();
    };
    const frame = (time: number) => {
      if (time - last < 33) return;
      const delta = last ? Math.min((time - last) / 1000, .1) : 1 / 30;
      last = time;
      elapsed += delta;
      const daylight = room.update(elapsed);
      for (const obj of Object.values(objects)) obj.update?.(elapsed);
      ambient.intensity = .7 + daylight * .7;
      key.intensity = 1.7 + daylight * 1.6;
      rim.intensity = .65 + daylight * .8;
      key.color.set(daylight > .5 ? "#f5ecd9" : "#eed4ac");
      scene.environmentIntensity = .42 + daylight * .18;
      controls.update();
      draw();
    };
    const resize = new ResizeObserver(() => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setPixelRatio(
        Math.min(devicePixelRatio, width < 768 ? 1.25 : 1.65),
      );
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.zoom = width < 600 ? 0.78 : 1;
      camera.updateProjectionMatrix();
      draw();
    });
    resize.observe(host);
    const observation = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observation.observe(host);
    const ray = new T.Raycaster(),
      pointer = new T.Vector2();
    let downX = 0,
      downY = 0;
    const hit = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      ray.setFromCamera(pointer, camera);
      const roots = Object.values(objects)
        .filter((obj) => obj.root.visible)
        .map((obj) => obj.root);
      const intersection = ray.intersectObjects(roots, true)[0];
      let node: T.Object3D | null = intersection?.object ?? null;
      while (node && !node.userData.roomId) node = node.parent;
      return node?.userData.roomId as RoomItemId | undefined;
    };
    const activePointers = new Set<number>();
    let multiTouch = false;
    const down = (event: PointerEvent) => {
      activePointers.add(event.pointerId);
      if (activePointers.size > 1) multiTouch = true;
      downX = event.clientX;
      downY = event.clientY;
    };
    const up = (event: PointerEvent) => {
      activePointers.delete(event.pointerId);
      if (multiTouch) { if (!activePointers.size) multiTouch = false; return; }
      if (
        Math.hypot(event.clientX - downX, event.clientY - downY) > 6 ||
        current
      )
        return;
      const id = hit(event);
      if (id) latest.current.onSelect(id);
    };
    const move = (event: PointerEvent) => {
      const hovered = !current ? hit(event) : undefined;
      renderer.domElement.style.cursor = hovered ? "pointer" : "grab";
      for (const [id, obj] of Object.entries(objects)) obj.hover?.(id === hovered);
    };
    renderer.domElement.addEventListener("pointerdown", down);
    renderer.domElement.addEventListener("pointerup", up);
    const cancel = (event: PointerEvent) => { activePointers.delete(event.pointerId); if (!activePointers.size) multiTouch = false; };
    renderer.domElement.addEventListener("pointercancel", cancel);
    renderer.domElement.addEventListener("pointermove", move);
    const leave = () => { for (const obj of Object.values(objects)) obj.hover?.(false); };
    renderer.domElement.addEventListener("pointerleave", leave);
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    const lose = (event: Event) => {
      event.preventDefault();
      latest.current.onReady(false);
      renderer.setAnimationLoop(null);
    };
    renderer.domElement.addEventListener("webglcontextlost", lose);
    const zoom = (direction: -1 | 0 | 1) => {
      if (current) return;
      gsap.killTweensOf(camera.position);
      const offset = camera.position.clone().sub(controls.target);
      const distance = T.MathUtils.clamp(offset.length() * (direction > 0 ? .78 : 1.28), controls.minDistance, controls.maxDistance);
      const destination = direction === 0 ? new T.Vector3(8, 6.4, 9.5) : controls.target.clone().add(offset.setLength(distance));
      if (direction === 0) controls.target.set(0, 1.15, 0);
      animate(camera.position, {x: destination.x, y: destination.y, z: destination.z, duration: noMotion() ? 0 : .35});
    };
    api.current = { focus, explode, sync, zoom };
    if (latest.current.focusId) focus(latest.current.focusId);
    else if (!reduced.matches) {
      gsap.from(camera.position, {
        x: 10.5, y: 7.6, z: 7.3, duration: 1.8, ease: "power3.out",
        onUpdate: () => { controls.update(); draw(); },
      });
    }
    if (latest.current.exploded) explode(true);
    sync();
    latest.current.onReady(true);
    return () => {
      transition?.kill();
      assembly?.kill();
      disposed = true;
      api.current = null;
      renderer.setAnimationLoop(null);
      resize.disconnect();
      observation.disconnect();
      controls.removeEventListener("change", draw);
      controls.dispose();
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      renderer.domElement.removeEventListener("pointerdown", down);
      renderer.domElement.removeEventListener("pointerup", up);
      renderer.domElement.removeEventListener("pointercancel", cancel);
      renderer.domElement.removeEventListener("pointermove", move);
      renderer.domElement.removeEventListener("pointerleave", leave);
      renderer.domElement.removeEventListener("webglcontextlost", lose);
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(controls.target);
      for (const obj of Object.values(objects)) {
        gsap.killTweensOf(obj.root.position);
        gsap.killTweensOf(obj.root.rotation);
        gsap.killTweensOf(obj.root.scale);
        for (const p of obj.pieces) gsap.killTweensOf(p.node.position);
      }
      const geometries = new Set<T.BufferGeometry>(),
        materials = new Set<T.Material>(),
        textures = new Set<T.Texture>();
      scene.traverse((node) => {
        if (node instanceof T.Mesh || node instanceof T.Line) {
          geometries.add(node.geometry);
          for (const material of Array.isArray(node.material)
            ? node.material
            : [node.material]) {
            materials.add(material);
            for (const value of Object.values(material))
              if (value instanceof T.Texture) textures.add(value);
          }
        }
      });
      geometries.forEach((g) => g.dispose());
      textures.forEach((t) => t.dispose());
      materials.forEach((m) => m.dispose());
      env.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [anchors, leaders]);
  return (
    <div
      ref={hostRef}
      className="spatial-canvas"
      role="img"
      aria-label={label}
    />
  );
}
