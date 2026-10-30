"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ArrowUpRight } from "@phosphor-icons/react";
import type { Language } from "@/lib/room-content";

const LanguageContext = createContext<Language>("en");
const RouteIntentContext = createContext<(href: string) => void>(() => {});
export const useRouteIntent = () => useContext(RouteIntentContext);
export const useLanguage = () => useContext(LanguageContext);
export function SiteShell({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const pathname = usePathname();
  const content = useRef<HTMLDivElement>(null);
  const scrollIntent = useRef<string | null>(null);
  const positions = useRef(new Map<string, number>());
  const activeLocation = useRef<string | null>(null);
  const activePath = useRef(pathname);
  const pendingRestore = useRef<{ url: string; top: number } | null>(null);
  const scrollFrame = useRef(0);
  const restoreAfterPaint = useCallback((top: number) => {
    cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = requestAnimationFrame(() => {
      scrollFrame.current = requestAnimationFrame(() => window.scrollTo({ top, behavior: "instant" }));
    });
  }, []);
  const rememberNavigation = useCallback((href: string) => {
    positions.current.set(window.location.pathname + window.location.hash, window.scrollY);
    pendingRestore.current = null;
    const destination = new URL(href, window.location.href);
    if (destination.pathname === window.location.pathname && !destination.hash) {
      activeLocation.current = destination.pathname;
      window.scrollTo({ top: 0, behavior: "instant" });
      scrollIntent.current = null;
    } else {
      scrollIntent.current = destination.hash ? null : destination.pathname;
    }
  }, []);
  useEffect(() => {
    const pop = () => {
      const url = window.location.pathname + window.location.hash;
      if (activeLocation.current && activeLocation.current !== url) positions.current.set(activeLocation.current, window.scrollY);
      const top = positions.current.get(url);
      scrollIntent.current = null;
      if (top === undefined) return;
      if (window.location.pathname === activePath.current) {
        activeLocation.current = url;
        restoreAfterPaint(top);
      } else pendingRestore.current = { url, top };
    };
    // Capture the outgoing position before Next replaces the route.
    // Keep this cache separate from the framework-owned history state.
    window.addEventListener("popstate", pop, true);
    return () => { window.removeEventListener("popstate", pop, true); cancelAnimationFrame(scrollFrame.current); };
  }, [restoreAfterPaint]);
  useLayoutEffect(() => {
    const url = pathname + window.location.hash;
    activeLocation.current = url;
    activePath.current = pathname;
    const pending = pendingRestore.current;
    pendingRestore.current = null;
    if (pending?.url === url) restoreAfterPaint(pending.top);
    else if (scrollIntent.current === pathname) restoreAfterPaint(0);
    scrollIntent.current = null;
    return () => cancelAnimationFrame(scrollFrame.current);
  }, [pathname, restoreAfterPaint]);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  useLayoutEffect(() => {
    if (!content.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      gsap.fromTo(content.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", clearProps: "all" });
    }, content);
    return () => context.revert();
  }, [pathname]);
  const en = language === "en";
  return <LanguageContext.Provider value={language}><RouteIntentContext.Provider value={rememberNavigation}>
    <div className="portfolio-shell">
      <a className="skip-link" href="#content">{en ? "Skip to content" : "Ir al contenido"}</a>
      <header className="site-header">
        <Link className="site-name" href="/" onNavigate={() => rememberNavigation("/")} aria-label={en ? "Lucio Nigro — Home" : "Lucio Nigro — Inicio"}>Lucio Nigro<span className="name-dot" aria-hidden="true" /></Link>
        <nav aria-label={en ? "Main navigation" : "Navegación principal"}>
          {[{ href: "/work", label: en ? "Work" : "Trabajo" }, { href: "/about", label: en ? "About" : "Sobre mí" }, { href: "/photography", label: en ? "Photography" : "Fotografía" }].map(link =>
            <Link key={link.href} href={link.href} onNavigate={() => rememberNavigation(link.href)} aria-current={pathname === link.href ? "page" : undefined}>{link.label}</Link>
          )}
        </nav>
        <div className="site-utilities">
          <div className="site-language" aria-label={en ? "Language" : "Idioma"}>
            <button aria-label="English" aria-pressed={en} onClick={() => setLanguage("en")}>EN</button>
            <button aria-label="Español" aria-pressed={!en} onClick={() => setLanguage("es")}>ES</button>
          </div>
          <a className="site-email" href="mailto:lucionigrot@gmail.com">Email<ArrowUpRight size={15}/></a>
        </div>
      </header>
      <div ref={content}>{children}</div>
      <footer className="site-footer">
        <span>Lucio Nigro</span>
        <div><a href="https://github.com/lucionigro" target="_blank" rel="noopener noreferrer">GitHub<ArrowUpRight size={13}/></a><a href="https://www.linkedin.com/in/lucionigro/" target="_blank" rel="noopener noreferrer">LinkedIn<ArrowUpRight size={13}/></a><a href="mailto:lucionigrot@gmail.com">{en ? "Get in touch" : "Hablemos"}<ArrowUpRight size={13}/></a></div>
      </footer>
    </div>
  </RouteIntentContext.Provider></LanguageContext.Provider>;
}
