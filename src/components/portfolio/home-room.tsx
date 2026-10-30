"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Pause, Play, Plus, Minus, ArrowCounterClockwise } from "@phosphor-icons/react";
import type { RoomItemId } from "@/lib/room-content";
import { useLanguage, useRouteIntent } from "./site-shell";

const World = dynamic(() => import("@/components/spatial/room-world"), { ssr: false });
const destinations: { id: RoomItemId; href: string; en: string; es: string; x: string; y: string }[] = [
  { id: "work", href: "/work", en: "Work", es: "Trabajo", x: "48%", y: "40%" },
  { id: "cinema", href: "/about#cinema", en: "Cinema", es: "Cine", x: "47%", y: "21%" },
  { id: "music", href: "/about#music", en: "Music", es: "Música", x: "82%", y: "61%" },
  { id: "books", href: "/about#books", en: "Books", es: "Libros", x: "14%", y: "40%" },
  { id: "photo", href: "/photography", en: "Photography", es: "Fotografía", x: "32%", y: "54%" },
];
export function HomeRoom() {
  const language = useLanguage(), en = language === "en";
  const router = useRouter();
  const rememberNavigation = useRouteIntent();
  const [scene, setScene] = useState<"loading" | "ready" | "unavailable">("loading");
  const ready = scene === "ready";
  const [focus, setFocus] = useState<RoomItemId | null>(null);
  const [paused, setPaused] = useState(false);
  const [zoomRequest, setZoomRequest] = useState<{ direction: -1 | 0 | 1; id: number }>({ direction: 0, id: 0 });
  const zoom = (direction: -1 | 0 | 1) => setZoomRequest(previous => ({ direction, id: previous.id + 1 }));
  const anchors = useRef<Partial<Record<RoomItemId, HTMLAnchorElement | null>>>({});
  const leaders = useRef<Partial<Record<RoomItemId, SVGLineElement | null>>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const navigate = useCallback((id: RoomItemId) => {
    const href = destinations.find(item => item.id === id)!.href;
    if (timer.current) clearTimeout(timer.current);
    router.prefetch(href);
    rememberNavigation(href);
    if (paused || matchMedia("(prefers-reduced-motion: reduce)").matches || !ready) {
      router.push(href); return;
    }
    setFocus(id);
    timer.current = setTimeout(() => router.push(href), matchMedia("(max-width: 767px)").matches ? 260 : 520);
  }, [router, paused, ready, rememberNavigation]);
  const handleReady = useCallback((value: boolean) => setScene(value ? "ready" : "unavailable"), []);
  const sceneClass = scene === "ready" ? "is-ready" : scene === "unavailable" ? "is-fallback" : "is-loading";
  return <main id="content" className="room-home" data-paused={paused}>
    <div className="home-intro"><h1><span className="title-mask"><span>{en ? "I’m Lucio." : "Soy Lucio."}</span></span><span className="title-mask home-title-secondary"><span>{en ? "This is my room." : "Esta es mi habitación."}</span></span></h1><div className="home-description"><p>{en ? "I build payment systems and AI agents. Away from the screen: film, music, books, and photography." : "Construyo sistemas de pagos y agentes de IA. Fuera de la pantalla: cine, música, libros y fotografía."}</p><p className="home-role">AI Backend Payments Engineer <span>·</span> Belong</p></div></div>
    <div className={`room-portal ${sceneClass} ${focus ? "is-departing" : ""}`}>
      <div className="room-stage" aria-hidden="true"><div className="stage-disc"/><div className="stage-orbit"/><div className="stage-shadow"/></div>
      {scene === "unavailable" && <div className="room-artwork"><Image src="/assets/pixel-room-v7.png" alt={en ? "Lucio’s illustrated room with a laptop, camera, guitar, television and books" : "La habitación ilustrada de Lucio con una computadora, cámara, guitarra, televisor y libros"} fill sizes="(max-width: 767px) 100vw, 1100px"/></div>}
      <div className="room-world" aria-hidden={!ready}><World focusId={focus} exploded={false} paused={paused} zoomRequest={zoomRequest} onSelect={navigate} onReady={handleReady} anchors={anchors} leaders={leaders} label={en ? "Lucio’s interactive room. Each labelled object opens its story. Drag to look around." : "La habitación interactiva de Lucio. Cada objeto abre su contenido. Arrastrá para mirar alrededor."}/></div>
      <svg className="room-leaders" aria-hidden="true">{destinations.map(item => <line key={item.id} ref={element => { leaders.current[item.id] = element; }}/>)}</svg>
      <div className="room-portals" role="group" aria-label={en ? "Explore the room" : "Explorá la habitación"}>
        {destinations.map(item => <Link key={item.id} href={item.href} className={`room-object room-object-${item.id}`} ref={element => { anchors.current[item.id] = element; }} style={scene === "unavailable" ? { left: item.x, top: item.y } : undefined} onNavigate={event => { event.preventDefault(); navigate(item.id); }}>
          <span className="hotspot-point" aria-hidden="true"/><span className="hotspot-label">{en ? item.en : item.es}<ArrowUpRight size={12}/></span>
        </Link>)}
      </div>
      {ready && <div className="room-zoom" role="group" aria-label={en ? "Room zoom" : "Zoom de la habitación"}>
        <button onClick={() => zoom(1)} aria-label={en ? "Zoom in" : "Acercar"}><Plus size={18}/></button>
        <button onClick={() => zoom(-1)} aria-label={en ? "Zoom out" : "Alejar"}><Minus size={18}/></button>
        <button onClick={() => zoom(0)} aria-label={en ? "Reset room view" : "Restablecer vista"}><ArrowCounterClockwise size={18}/></button>
      </div>}
      {ready && <button className="room-motion" onClick={() => setPaused(value => !value)} aria-pressed={paused} aria-label={en ? paused ? "Resume room motion" : "Pause room motion" : paused ? "Reanudar movimiento" : "Pausar movimiento"}>{paused ? <Play size={16}/> : <Pause size={16}/>}</button>}
    </div>
    <div className="room-caption"><p aria-live="polite">{focus ? (en ? "Opening " : "Abriendo ") + (en ? destinations.find(item => item.id === focus)!.en : destinations.find(item => item.id === focus)!.es) + "…" : scene === "loading" ? (en ? "Opening the room." : "Abriendo la habitación.") : en ? "A few things that make me, me. Pick an object." : "Algunas cosas que me hacen ser yo. Elegí un objeto."}</p><span>{ready ? en ? "Drag to rotate · Scroll or pinch to zoom" : "Arrastrá para girar · Rueda o pinza para acercar" : scene === "unavailable" ? (en ? "Choose a labelled object to explore" : "Elegí un objeto para explorar") : ""}</span></div>
  </main>;
}
