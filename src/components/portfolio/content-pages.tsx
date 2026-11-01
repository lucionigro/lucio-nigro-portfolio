"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, DownloadSimple, X } from "@phosphor-icons/react";
import { getRoomItems } from "@/lib/room-content";
import { useLanguage, useRouteIntent } from "./site-shell";

export function WorkPage() {
  const language = useLanguage(), en = language === "en";
  const work = getRoomItems(language).find(item => item.id === "work")!;
  const education = en ? [
    { school: "Universidad Tecnológica Nacional", course: "Information Systems Engineering", date: "2020–2023" },
    { school: "Universidad Tecnológica Nacional", course: ".NET Development Academy", date: "2022" },
    { school: "Universidad del CEMA", course: "Python Applied to Finance", date: "2025" },
    { school: "Universidad Torcuato Di Tella", course: "Leading CX Transformation", date: "2025" },
  ] : [
    { school: "Universidad Tecnológica Nacional", course: "Ingeniería en Sistemas de Información", date: "2020–2023" },
    { school: "Universidad Tecnológica Nacional", course: "Academia de Desarrollo .NET", date: "2022" },
    { school: "Universidad del CEMA", course: "Python aplicado a Finanzas", date: "2025" },
    { school: "Universidad Torcuato Di Tella", course: "Liderando la Transformación CX", date: "2025" },
  ];
  const skills = [
    { label: en ? "Languages & backend" : "Lenguajes y backend", value: ".NET / .NET Core, Python, Java, SQL" },
    { label: en ? "Databases" : "Bases de datos", value: "SQL Server, Oracle, Sybase" },
    { label: en ? "Applied AI" : "IA aplicada", value: en ? "LangGraph, agent orchestration, LLM integration" : "LangGraph, orquestación de agentes, integración de LLMs" },
    { label: en ? "Development tools" : "Herramientas de desarrollo", value: "Claude Code, Codex" },
  ];
  return <main id="content" className="content-page work-page">
    <div className="page-intro"><p className="page-kicker">{en ? "Software engineering" : "Ingeniería de software"}</p><h1>{en ? <>Payments.<br/>Systems. AI.</> : <>Pagos.<br/>Sistemas. IA.</>}</h1><div><p className="page-description">{work.description}</p>
      <div className="cv-actions"><a className="cv-download" href={`/cv/Lucio-Nigro-CV-${en ? "EN" : "ES"}.pdf`} download><DownloadSimple size={20}/>{en ? "Download CV" : "Descargar CV"}<span>PDF · {en ? "EN" : "ES"}</span></a><a className="cv-alternate" href={`/cv/Lucio-Nigro-CV-${en ? "ES" : "EN"}.pdf`} download>{en ? "En español" : "In English"}</a></div>
    </div></div>
    <section aria-labelledby="experience-title"><h2 id="experience-title" className="work-section-title">{en ? "Professional experience" : "Experiencia profesional"}</h2>
    <div className="career-list">{work.experience!.map(job => <article className="career-entry" key={job.company}>
      <div className="career-meta"><span>{job.period}</span>{job.focus && <p className="career-focus">{job.focus.join(" · ")}</p>}</div>
      <div><h3>{job.company}</h3><p className="career-role">{job.role}</p>{job.context && <p className="career-context">{job.context}</p>}<div className="career-projects">{job.highlights.map((line, index) => <section key={line}>{job.projectTitles?.[index] && <h4>{job.projectTitles[index]}</h4>}<p>{line}</p></section>)}</div></div>
    </article>)}</div></section>
    <section className="work-details" aria-labelledby="skills-title"><div><h2 id="skills-title" className="work-section-title">{en ? "Technical skills" : "Habilidades técnicas"}</h2><dl className="skills-list">{skills.map(skill => <div key={skill.label}><dt>{skill.label}</dt><dd>{skill.value}</dd></div>)}</dl></div>
    <div><h2 className="work-section-title">{en ? "Languages" : "Idiomas"}</h2><p className="work-languages">{en ? "Spanish · Native" : "Español · Nativo"}<br/>{en ? "English · Upper-intermediate (B2+)" : "Inglés · Intermedio alto (B2+)"}</p><p className="work-communication">{en ? "Technical documentation and clear communication across engineering and operations." : "Documentación técnica y comunicación clara entre ingeniería y operaciones."}</p></div></section>
    <section className="education-section" aria-labelledby="education-title"><h2 id="education-title" className="work-section-title">{en ? "Education & further study" : "Formación y estudios"}</h2><div className="education-grid">{education.map(entry => <article key={entry.course}><p className="education-date">{entry.date}</p><h3>{entry.course}</h3><p>{entry.school}</p></article>)}</div></section>
    <a className="text-link closing-link" href="mailto:lnigrot@gmail.com">{en ? "Let’s talk about your next project" : "Hablemos de tu próximo proyecto"}<ArrowUpRight size={20}/></a>
  </main>;

}

export function AboutPage() {
  const rememberNavigation = useRouteIntent();
  const language = useLanguage(), en = language === "en";
  const items = getRoomItems(language);
  return <main id="content" className="content-page about-page">
    <div className="page-intro"><p className="page-kicker">{en ? "A little more personal" : "Un poco más personal"}</p><h1>{en ? <>Away from<br/>the screen.</> : <>Fuera de<br/>la pantalla.</>}</h1><p className="page-description">{en ? "I’m Lucio Nigro, a software engineer working on payments and AI at Belong. These are a few things I keep coming back to." : "Soy Lucio Nigro, ingeniero de software especializado en pagos e IA en Belong. Estas son algunas cosas a las que siempre vuelvo."}</p></div>
    <div className="personal-sections">{(["music", "cinema", "books"] as const).map((id, i) => {
      const item = items.find(item => item.id === id)!;
      return <section id={id} key={id} className="personal-section"><span className="section-number">0{i + 1}</span><div><p className="personal-label">{item.shortLabel}</p><h2>{item.title}</h2><p>{item.description}</p></div></section>;
    })}</div>
    <Link className="text-link closing-link" href="/photography" onNavigate={() => rememberNavigation("/photography")}>{en ? "See what I’ve been photographing" : "Mirá lo que estuve fotografiando"}<ArrowUpRight size={20}/></Link>
  </main>;
}

export function PhotographyPage() {
  const language = useLanguage(), en = language === "en";
  const item = getRoomItems(language).find(item => item.id === "photo")!;
  const photos = item.gallery!;
  const [index, setIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const opened = index !== null;
  useEffect(() => {
    if (!opened || !dialog.current) return;
    const element = dialog.current;
    const returnTo = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal(); close.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex(value => value === null ? null : (value + (event.key === "ArrowRight" ? 1 : -1) + photos.length) % photos.length);
      }
    };
    element.addEventListener("keydown", key);
    return () => {
      element.removeEventListener("keydown", key); element.close();
      document.body.style.overflow = overflow;
      if (returnTo?.isConnected) returnTo.focus({ preventScroll: true });
    };
  }, [opened, photos.length]);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [frame, setFrame] = useState(1);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const stepFrame = (direction: number) => setFrame(value => (value + direction + photos.length) % photos.length);
  const activePhoto = photos[frame];
  const selected = index === null ? null : photos[index];
  return <main id="content" className="content-page photography-page">
    <div className="photography-heading"><div><p className="page-kicker">Canon AV-1</p><h1>{en ? "Through my lens." : "Mi forma de mirar."}</h1></div><p>{item.description}</p></div>
    <div className="photograph-stage" tabIndex={0} role="region" aria-roledescription={en ? "carousel" : "carrusel"} aria-label={en ? "Film photographs" : "Fotografías analógicas"} onKeyDown={event => {
      if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      if (event.key === "Home") setFrame(0);
      else if (event.key === "End") setFrame(photos.length - 1);
      else stepFrame(event.key === "ArrowRight" ? 1 : -1);
    }}>
      <div className="photograph-reel" style={{ "--active-ratio": activePhoto.width / activePhoto.height } as CSSProperties} onPointerDown={event => {
        if (!event.isPrimary || event.button !== 0) return;
        suppressClick.current = false;
        swipe.current = { x: event.clientX, y: event.clientY };
      }} onPointerCancel={() => { swipe.current = null; }} onPointerUp={event => {
        const start = swipe.current; swipe.current = null;
        if (!start) return;
        const dx = event.clientX - start.x, dy = event.clientY - start.y;
        if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
        suppressClick.current = true;
        stepFrame(dx < 0 ? 1 : -1);
      }} onDragStart={event => event.preventDefault()}>
        {photos.map((photo, i) => {
          let offset = (i - frame + photos.length) % photos.length;
          if (offset > photos.length / 2) offset -= photos.length;
          const depth = Math.abs(offset), visible = depth <= 2, current = offset === 0;
          return <figure className="photograph-slide" data-offset={offset} data-depth={depth} key={photo.src} aria-hidden={!visible} inert={visible ? undefined : true} style={{
            "--photo-ratio": photo.width / photo.height,
            "--direction": Math.sign(offset), "--depth": depth,
            zIndex: photos.length - depth,
          } as CSSProperties}>
            <button className="photo-open" onClick={() => {
              if (suppressClick.current) { suppressClick.current = false; return; }
              if (current) setIndex(i); else setFrame(i);
            }} aria-label={(current ? en ? "Enlarge: " : "Ampliar: " : en ? "Show photograph: " : "Ver fotografía: ") + photo.alt} aria-current={current ? "true" : undefined} tabIndex={visible ? 0 : -1}>
              <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} quality={95} sizes="(max-width: 767px) 66vw, (max-width: 1200px) 56vw, 800px" loading={visible ? "eager" : "lazy"} draggable={false}/>
              {current && <span className="photo-open-icon" aria-hidden="true"><ArrowUpRight size={20}/></span>}
            </button>
          </figure>;
        })}
      </div>
      <p className="photograph-caption" aria-live="polite" aria-atomic="true">{activePhoto.caption ?? activePhoto.alt}</p>
      <div className="photograph-controls">
        <button onClick={() => stepFrame(-1)} aria-label={en ? "Previous photograph" : "Fotografía anterior"}><ArrowLeft size={19}/></button>
        <div className="photograph-pagination" aria-label={en ? "Choose a photograph" : "Elegir una fotografía"}>
          {photos.map((photo, i) => <button key={photo.src} onClick={() => setFrame(i)} aria-label={(en ? "Photograph " : "Fotografía ") + (i + 1)} aria-current={i === frame ? "true" : undefined}><span/></button>)}
        </div>
        <button onClick={() => stepFrame(1)} aria-label={en ? "Next photograph" : "Fotografía siguiente"}><ArrowRight size={19}/></button>
      </div>
    </div>
    <dialog ref={dialog} className="photo-lightbox" aria-label={en ? "Photograph viewer" : "Visor de fotografías"} onCancel={() => setIndex(null)} onClick={event => { if (event.target === event.currentTarget) setIndex(null); }}>
      {selected && <><div className="lightbox-toolbar"><span>{String(index! + 1).padStart(2,"0")} / {String(photos.length).padStart(2,"0")}</span><button ref={close} onClick={() => setIndex(null)} aria-label={en ? "Close photograph" : "Cerrar fotografía"}><X size={22}/></button></div>
      <div className="lightbox-image" onTouchStart={event => { touchStart.current = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null; }} onTouchEnd={event => {
        const start = touchStart.current; touchStart.current = null;
        if (!start) return;
        const dx = event.changedTouches[0].clientX - start.x, dy = event.changedTouches[0].clientY - start.y;
        if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) setIndex(value => value === null ? null : (value + (dx < 0 ? 1 : -1) + photos.length) % photos.length);
      }}><Image key={selected.src} src={selected.src} alt={selected.alt} width={selected.width} height={selected.height} unoptimized loading="eager" style={{ maxWidth: `min(100%, ${selected.width}px)` }}/></div>
      <div className="lightbox-bottom"><button onClick={() => setIndex(value => (value! - 1 + photos.length) % photos.length)} aria-label={en ? "Previous photograph" : "Fotografía anterior"}><ArrowLeft size={21}/></button><p aria-live="polite">{selected.caption ?? selected.alt}</p><button onClick={() => setIndex(value => (value! + 1) % photos.length)} aria-label={en ? "Next photograph" : "Fotografía siguiente"}><ArrowRight size={21}/></button></div></>}
    </dialog>
  </main>;
}
