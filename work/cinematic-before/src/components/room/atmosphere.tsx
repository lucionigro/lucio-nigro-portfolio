"use client";

import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";

/** A transparent layer of dust in the lamplight. The original room stays in the DOM. */
export default function Atmosphere({ paused }: { paused: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  const syncRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    pausedRef.current = paused;
    syncRef.current?.();
  }, [paused]);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
      });
    } catch {
      return;
    }
    host.appendChild(renderer.domElement);
    const scene = new Scene();
    const camera = new PerspectiveCamera(40, 1, 0.1, 50);
    camera.position.z = 5;
    const count = 70;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    // Fixed seed: stable composition across remounts and devices.
    for (let i = 0; i < count; i++) {
      const n = Math.sin(i * 127.1 + 17) * 43758.5453;
      const fraction = n - Math.floor(n);
      positions[i * 3] = (fraction - 0.5) * 6.8;
      positions[i * 3 + 1] = (i / count - 0.5) * 3.4;
      positions[i * 3 + 2] = Math.sin(i * 3.1) * 0.6;
      seeds[i] = fraction;
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("seed", new BufferAttribute(seeds, 1));
    const material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        time: { value: 0 },
        tint: { value: new Color("#e8bb78") },
        density: { value: 1 },
      },
      vertexShader: `attribute float seed; uniform float time; uniform float density; varying float alpha;
        void main(){ vec3 p=position; p.x+=sin(time*.15+seed*20.)*.09; p.y+=sin(time*.12+seed*13.)*.07;
        vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv;
        gl_PointSize=(1.4+seed*2.2)*density; alpha=.13+seed*.28; }`,
      fragmentShader: `uniform vec3 tint; varying float alpha;
        void main(){float d=length(gl_PointCoord-.5);float a=(1.-smoothstep(.08,.5,d))*alpha;
        gl_FragColor=vec4(tint,a);}`,
    });
    const dust = new Points(geometry, material);
    scene.add(dust);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    let elapsed = 0;
    let last = 0;
    const draw = () => renderer.render(scene, camera);
    const frame = (now: number) => {
      if (now - last < 50) return;
      elapsed += Math.min((now - last) / 1000, 0.05);
      last = now;
      material.uniforms.time.value = elapsed;
      draw();
    };
    const sync = () => {
      renderer.setAnimationLoop(
        visible && !document.hidden && !pausedRef.current && !reduced.matches
          ? frame
          : null,
      );
      draw();
    };
    syncRef.current = sync;
    const resize = new ResizeObserver(() => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      const ratio = Math.min(devicePixelRatio, 1.5);
      renderer.setPixelRatio(ratio);
      renderer.setSize(width, height);
      material.uniforms.density.value = ratio;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      draw();
    });
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    resize.observe(host);
    visibility.observe(host);
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      syncRef.current = null;
      resize.disconnect();
      visibility.disconnect();
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      renderer.setAnimationLoop(null);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return <div ref={hostRef} className="room-atmosphere" aria-hidden="true" />;
}
