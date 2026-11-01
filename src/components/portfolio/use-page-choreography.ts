"use client";

import { useLayoutEffect, type RefObject } from "react";
import { gsap } from "gsap";

/** Text leads the entrance; the room and supporting content follow. */
export function usePageChoreography(root: RefObject<HTMLDivElement | null>, path: string) {
  useLayoutEffect(() => {
    const host = root.current;
    if (!host) return;
    const media = gsap.matchMedia();
    let observer: IntersectionObserver | undefined;
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        const title = host.querySelectorAll(".title-mask > span");
        const entrance = gsap.timeline({ defaults: { ease: "power3.out" } });
        if (title.length) {
          entrance.fromTo(title, { yPercent: 110, rotate: 3 }, { yPercent: 0, rotate: 0, stagger: .12, duration: 1.1, clearProps: "all" });
          entrance.fromTo(".home-description, .room-caption", { y: 18, opacity: 0 }, { y: 0, opacity: 1, stagger: .12, duration: .8, clearProps: "all" }, .35);
          entrance.fromTo(".room-stage", { scale: .88, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.6, clearProps: "all" }, .1);
        } else {
          entrance.fromTo(".page-intro, .photography-heading", { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: .85, clearProps: "all" });
        }
        // Natural scrolling stays intact. Reveals are local to each content block.
        const blocks = host.querySelectorAll(".career-entry, .personal-section, .work-details, .education-section, .photograph-stage");
        if (!blocks.length) return;
        gsap.set(blocks, { y: 30, opacity: 0 });
        observer = new IntersectionObserver(contextSafe, { threshold: .06 });
        function contextSafe(entries: IntersectionObserverEntry[]) {
          context.add(() => {
            const entering = entries.filter(entry => entry.isIntersecting);
            if (!entering.length) return;
            gsap.to(entering.map(entry => entry.target), { y: 0, opacity: 1, duration: .85, stagger: .08, ease: "power3.out", clearProps: "all" });
            entering.forEach(entry => observer?.unobserve(entry.target));
          });
        }
        blocks.forEach(block => observer!.observe(block));
      }, host);
      return () => { observer?.disconnect(); context.revert(); };
    });
    return () => { observer?.disconnect(); media.revert(); };
  }, [root, path]);
}
