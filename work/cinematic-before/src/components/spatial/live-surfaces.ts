import * as T from "three";

export type Surface = { mesh: T.Mesh; update: (seconds: number) => void };
const vertexShader = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;

/** A local, scripted terminal session; no commands or network requests are executed. */
export function terminalSurface(): Surface {
  const canvas = document.createElement("canvas");
  canvas.width = 1024; canvas.height = 640;
  const c = canvas.getContext("2d")!;
  const map = new T.CanvasTexture(canvas);
  map.colorSpace = T.SRGBColorSpace;
  map.anisotropy = 4;
  const mesh = new T.Mesh(new T.PlaneGeometry(1.34, 0.76), new T.MeshBasicMaterial({ map, toneMapped: false }));
  const lines = [
    "$ claude", "> Build an idempotent payment handler", "  with retries and a typed event stream.", "", "Reading src/payments/handler.ts", "",
    "export async function settle(event: Payment) {", "  const key = `payment:${event.id}`;", "  const previous = await ledger.find(key);", "  if (previous) return previous;", "", "  return transaction(async (tx) => {", "    const result = await gateway.capture({", "      amount: event.amount,", "      currency: event.currency,", "      idempotencyKey: key,", "    });", "    await tx.ledger.record(result);", "    await tx.events.publish('payment.settled');", "    return result;", "  });", "}", "", "$ npm run test -- payments", "✓ duplicate events handled safely", "✓ retries preserve idempotency", "✓ settlement events published", "", "$ git diff --stat", " src/payments/handler.ts | +24 -8", "", "$ _",
  ];
  let previous = -1;
  const update = (seconds: number) => {
    const tick = Math.floor(seconds * 10);
    if (tick === previous) return;
    previous = tick;
    const cycle = seconds % 34;
    let budget = Math.floor(cycle * 32) + 30;
    const visible: string[] = [];
    for (const line of lines) {
      if (budget < 0) break;
      visible.push(line.slice(0, budget));
      budget -= line.length + 10;
    }
    const rows = visible.slice(-15);
    c.fillStyle = "#101513"; c.fillRect(0, 0, 1024, 640);
    c.fillStyle = "#202823"; c.fillRect(0, 0, 1024, 48);
    for (let i = 0; i < 3; i++) { c.fillStyle = ["#ad6b5e", "#bea36a", "#6f9977"][i]; c.beginPath(); c.arc(24 + i * 24, 24, 6, 0, Math.PI * 2); c.fill(); }
    c.font = "18px monospace"; c.fillStyle = "#a8b5a8"; c.fillText("lucio — portfolio / payments", 305, 31);
    c.font = "22px monospace";
    rows.forEach((line, i) => {
      c.fillStyle = line.startsWith("$") || line.startsWith(">") ? "#b9d4ac" : line.startsWith("✓") ? "#91b99b" : /export|const|return|await|if/.test(line) ? "#d2c3a3" : "#aebbb2";
      c.fillText(line, 30, 87 + i * 34);
    });
    if (Math.floor(seconds * 2) % 2 === 0 && rows.length) {
      const last = rows.at(-1)!; c.fillStyle = "#c7d4bc";
      c.fillRect(30 + c.measureText(last).width + 4, 67 + (rows.length - 1) * 34, 12, 24);
    }
    c.fillStyle = "#202823"; c.fillRect(0, 606, 1024, 34);
    c.font = "16px monospace"; c.fillStyle = "#8ea18e"; c.fillText("main  ·  TypeScript                                      local session", 26, 628);
    map.needsUpdate = true;
  };
  update(0);
  return { mesh, update };
}

/** Reuses the actual artwork frame, keeping its falling figure at the centre. */
export function vertigoSurface(): Surface {
  const frame = new T.TextureLoader().load("/assets/room/vertigo-original-frame.png");
  frame.colorSpace = T.SRGBColorSpace;
  const material = new T.ShaderMaterial({
    uniforms: { frame: { value: frame }, time: { value: 0 } }, vertexShader,
    fragmentShader: `
      uniform sampler2D frame; uniform float time; varying vec2 vUv;
      void main(){
        vec2 p=vUv-.5; p.x*=1.92;
        float r=length(p);
        // Preserve the original falling figure, animate the surrounding spiral
        // in polar space so the frame never smears or repeats at its edges.
        float a=.065*sin(time*.42);
        mat2 turn=mat2(cos(a),-sin(a),sin(a),cos(a));
        vec2 q=turn*p/(1.025+.018*sin(time*.7)); q.x/=1.92;
        q.y+=sin(time*.55)*.008;
        vec3 original=texture2D(frame,clamp(q+.5,vec2(.005),vec2(.995))).rgb;
        float phase=atan(p.y,p.x)*5.+r*112.-time*1.4;
        float line=smoothstep(.55,.72,sin(phase));
        vec3 spiral=mix(vec3(.035,.042,.039),vec3(.76,.73,.66),line);
        vec3 film=mix(original,spiral,smoothstep(.32,.5,r));
        float grain=fract(sin(dot(vUv+fract(time*.17),vec2(12.9898,78.233)))*43758.5453);
        film*=.96+.025*sin(time*17.)+.015*sin(vUv.y*760.);
        film+=(grain-.5)*.035;
        gl_FragColor=vec4(film,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new T.Mesh(new T.PlaneGeometry(1.63, 0.94), material);
  return { mesh, update: seconds => { (mesh.material as T.ShaderMaterial).uniforms.time.value = seconds; } };
}

export function cityWindow() {
  const root = new T.Group();
  const skyMaterial = new T.ShaderMaterial({
    uniforms: { time: { value: 0 }, daylight: { value: 0 }, orbit: { value: -Math.PI / 2 } }, vertexShader,
    fragmentShader: `
      uniform float time,daylight,orbit; varying vec2 vUv;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);}
      void main(){
        vec3 night=mix(vec3(.043,.065,.11),vec3(.012,.02,.047),vUv.y);
        vec3 day=mix(vec3(.72,.77,.73),vec3(.26,.43,.57),vUv.y);
        vec3 sky=mix(night,day,daylight);
        float dusk=pow(1.-abs(daylight*2.-1.),3.);
        sky+=vec3(.33,.13,.035)*dusk*pow(1.-vUv.y,2.);
        vec2 starCell=floor(vUv*vec2(90.,115.));
        vec2 starPos=fract(vUv*vec2(90.,115.))-.5;
        float stars=step(.986,hash(starCell))*(1.-smoothstep(.03,.14,length(starPos)));
        sky+=stars*(1.-daylight)*(.5+.18*sin(time*.7+hash(starCell)*20.));
        vec2 sun=vec2(.5+cos(orbit)*.4,.22+sin(orbit)*.63);
        vec2 moon=vec2(.5-cos(orbit)*.4,.22-sin(orbit)*.63);
        vec2 aspect=vec2(1.,1.32);
        float sd=length((vUv-sun)*aspect),md=length((vUv-moon)*aspect);
        sky+=vec3(1.,.68,.32)*exp(-sd*24.)*.3;
        sky=mix(sky,vec3(1.,.85,.56),1.-smoothstep(.032,.037,sd));
        float moonDisc=1.-smoothstep(.026,.03,md);
        float crater=.9+.1*noise(vUv*280.);
        sky=mix(sky,vec3(.75,.81,.79)*crater,moonDisc*(1.-daylight));
        sky+=vec3(.16,.19,.24)*exp(-md*40.)*(1.-daylight);
        float cloud=noise(vec2(vUv.x*5.+time*.009,vUv.y*12.))+noise(vec2(vUv.x*11.+time*.015,vUv.y*24.))*.4;
        float haze=smoothstep(.71,.98,cloud)*smoothstep(.35,.55,vUv.y)*.35;
        sky=mix(sky,mix(vec3(.13,.16,.2),vec3(.85,.85,.79),daylight),haze);
        gl_FragColor=vec4(sky,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const sky = new T.Mesh(new T.PlaneGeometry(1.36, 1.8), skyMaterial);
  root.add(sky);
  const buildings = new T.Group(); root.add(buildings);
  const silhouettes: { material: T.MeshBasicMaterial; night: T.Color; day: T.Color }[] = [];
  const windows: { x: number; y: number; z: number; lit: number }[] = [];
  for (let layer = 0; layer < 3; layer++) {
    const night = new T.Color(["#18232e", "#101b25", "#0b141d"][layer]);
    const day = new T.Color(["#7c8b90", "#576b73", "#344c56"][layer]);
    const material = new T.MeshBasicMaterial({ color: night });
    silhouettes.push({ material, night, day });
    const count = 9 + layer;
    for (let i = 0; i < count; i++) {
      const width = 1.36 / count;
      const h = .22 + ((i * 37 + layer * 17) % 11) * .033 + (layer === 0 ? .13 : 0);
      const x = -.68 + width * (i + .5), y = -.9 + h / 2;
      const block = new T.Mesh(new T.BoxGeometry(width * .94, h, .035), material);
      block.position.set(x, y, .028 + layer * .035); buildings.add(block);
      if ((i + layer) % 3 === 0) {
        const roof = new T.Mesh(new T.BoxGeometry(width * .5, .03, .025), material);
        roof.position.set(x, -.9 + h + .014, block.position.z); buildings.add(roof);
        const aerial = new T.Mesh(new T.BoxGeometry(.004, .07, .004), material);
        aerial.position.set(x, -.9 + h + .055, block.position.z); buildings.add(aerial);
      }
      for (let row = 0; row < Math.floor(h / .047) - 1; row++)
        for (let col = 0; col < 3; col++) {
          const seed = (i * 71 + row * 13 + col * 43 + layer * 17) % 100;
          windows.push({ x: x + (col - 1) * width * .23, y: -.86 + row * .047, z: block.position.z + .02, lit: seed / 100 });
        }
    }
  }
  const windowMaterial = new T.MeshBasicMaterial({ color: "#e9ba78" });
  const lights = new T.InstancedMesh(new T.PlaneGeometry(.012, .019), windowMaterial, windows.length);
  const transform = new T.Object3D();
  windows.forEach((w, i) => {
    transform.position.set(w.x, w.y, w.z); transform.updateMatrix(); lights.setMatrixAt(i, transform.matrix);
    lights.setColorAt(i, new T.Color(w.lit > .4 ? "#e5bd83" : "#19272e"));
  });
  root.add(lights);
  const road = new T.Mesh(new T.PlaneGeometry(1.36, .036), new T.MeshBasicMaterial({ color: "#26333a" }));
  road.position.set(0, -.85, .155); root.add(road);
  const cars = Array.from({ length: 5 }, (_, i) => {
    const car = new T.Mesh(new T.PlaneGeometry(.014, .004), new T.MeshBasicMaterial({ color: i % 2 ? "#d89a7c" : "#eee6cc" }));
    car.position.set(0, -.843 - (i % 2) * .015, .16); root.add(car); return car;
  });
  const glow = new T.PointLight("#a6b5d0", .8, 4, 2);
  glow.position.set(0, 0, .6); root.add(glow);
  return { root, update: (seconds: number) => {
    // Midnight -> noon at 60 seconds -> midnight at 120 seconds.
    const orbit = seconds / 120 * Math.PI * 2 - Math.PI / 2;
    const daylight = T.MathUtils.smoothstep(Math.sin(orbit), -.18, .38);
    const skyMat = sky.material as T.ShaderMaterial;
    skyMat.uniforms.time.value = seconds; skyMat.uniforms.daylight.value = daylight; skyMat.uniforms.orbit.value = orbit;
    // Materials are cloned by the room's navigation transitions.
    buildings.traverse(node => {
      if (node instanceof T.Mesh) {
        const original = silhouettes.find(s => s.material === node.userData.baseMaterial);
        if (original) (node.material as T.MeshBasicMaterial).color.copy(original.night).lerp(original.day, daylight);
      }
    });
    (lights.material as T.MeshBasicMaterial).color.setRGB(1, 1, 1).multiplyScalar(1 - daylight * .82);
    cars.forEach((car, i) => { car.position.x = ((seconds * (i % 2 ? -.025 : .033) + i * .27) % 1.3 + 1.3) % 1.3 - .65; });
    glow.color.set(daylight > .5 ? "#e2ddca" : "#9aaed2"); glow.intensity = .65 + daylight * 1.5;
    return daylight;
  }, init: () => buildings.traverse(node => { if (node instanceof T.Mesh) node.userData.baseMaterial = node.material; }) };
}
