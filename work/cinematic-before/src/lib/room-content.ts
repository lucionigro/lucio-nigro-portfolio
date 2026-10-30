export type RoomItemId = "work" | "cinema" | "music" | "books" | "photo";

export type RoomGalleryImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type WorkExperience = {
  company: string;
  role: string;
  period: string;
  context?: string;
  highlights: string[];
  focus?: string[];
  projectTitles?: string[];
};

export type RoomItem = {
  id: RoomItemId;
  shortLabel: string;
  objectLabel: string;
  title: string;
  description: string;
  prompt?: string;
  gallery?: RoomGalleryImage[];
  experience?: WorkExperience[];
  position: { left: string; top: string; width: string; height: string };
  zoom: { origin: string; scale: number };
};

// Este es el único archivo que hace falta editar cuando llegue el contenido final.
export const roomItems: RoomItem[] = [
  {
    id: "work",
    shortLabel: "Trabajo",
    objectLabel: "Abrir la MacBook",
    title: "Experiencia profesional",
    description:
      "Desarrollador de software especializado en pagos, con experiencia en la evolución de motores de pago y la automatización de procesos críticos. Mi trayectoria abarca tanto los pagos digitales como la liquidación de operaciones del mercado de capitales. Actualmente diseño e implemento soluciones basadas en IA y arquitecturas de agentes para automatizar procesos operativos y reducir tareas manuales.",
    experience: [
      {
        company: "Belong",
        role: "AI Backend Payments Engineer",
        period: "ene. 2026 - actualidad",
        projectTitles: ["Motor de pagos", "Migración de proveedor", "Automatización con IA"],
        focus: ["Motores de pago", "Dwolla → J.P. Morgan", "Agentes de IA"],
        context:
          "Startup estadounidense de proptech que integra gestión de alquileres, servicios financieros y tecnología basada en IA.",
        highlights: [
          "Estoy a cargo del mantenimiento y la evolución del motor de pagos que forma parte de los servicios financieros de Belong. Mi trabajo abarca pagos salientes, reembolsos y operaciones de saldo, con responsabilidades tanto en el desarrollo como en el mantenimiento de los sistemas centrales de procesamiento.",
          "Lideré la migración del procesamiento de pagos de Dwolla a J.P. Morgan. Este proyecto representó un cambio del proveedor utilizado para procesar las transacciones de la plataforma y formó parte de la evolución de su infraestructura de pagos.",
          "Diseñé y desarrollé un agente de IA para automatizar solicitudes de pago, una tarea operativa que requería intervención manual del equipo. La automatización redujo ese trabajo manual en un 70% y conectó mi experiencia en sistemas de pagos con el desarrollo de soluciones basadas en agentes.",
        ],
      },
      {
        company: "Banco Hipotecario",
        role: ".NET Developer",
        period: "ene. 2024 - ene. 2026",
        projectTitles: ["Liquidación de operaciones", "Automatización y datos"],
        context: "Sistemas para el área de Operaciones Financieras, con foco en liquidación de instrumentos financieros y automatización de procesos.",
        focus: [".NET Core", "Python", "Mercado de capitales"],
        highlights: [
          "Lideré y desarrollé de punta a punta la automatización de la liquidación monetaria de operaciones de compra y venta del mercado de capitales. El alcance incluía instrumentos como acciones, bonos y letras, dentro de los sistemas utilizados por el área de Operaciones Financieras del banco.",
          "Además de los sistemas de liquidación, desarrollé herramientas de automatización y pipelines de datos con .NET Core y Python. Esta parte del trabajo estuvo orientada a los procesos del área financiera, combinando desarrollo backend, procesamiento de datos y automatización de tareas operativas.",
        ],
      },
      {
        company: "QServices",
        role: ".NET Developer",
        period: "oct. 2022 - dic. 2024",
        projectTitles: ["Gestión de cobros para DirecTV", "Modernización de sistemas heredados"],
        context: "Desarrollo de software empresarial para la operación de cobros de DirecTV en Sudamérica.",
        focus: [".NET Core", "Oracle", "Vue.js"],
        highlights: [
          "Desarrollé y mantuve el sistema interno de gestión de cobros de DirecTV para Sudamérica. Trabajé con .NET Core, Oracle y Vue.js en una aplicación empresarial que combinaba servicios backend, persistencia de datos e interfaz de usuario para la operación de cobros.",
          "Participé en el refactoring y la modernización de componentes heredados del sistema. El trabajo se enfocó en mejorar la confiabilidad y el rendimiento general de la aplicación, como parte del mantenimiento y la evolución del software empresarial de DirecTV.",
        ],
      },
    ],
    position: { left: "40.2%", top: "41.8%", width: "14.5%", height: "16.5%" },
    zoom: { origin: "48% 49%", scale: 1.5 },
  },
  {
    id: "cinema",
    shortLabel: "Cine",
    objectLabel: "Mirar el televisor",
    title: "Películas favoritas",
    description:
      "Soy fanático del cine desde chico. Si tuviera que elegir cuatro películas, me quedaría con El Padrino, Blade Runner, Annie Hall y Vértigo.",
    position: { left: "34%", top: "6.5%", width: "25.5%", height: "29%" },
    zoom: { origin: "47% 21%", scale: 1.32 },
  },
  {
    id: "music",
    shortLabel: "Música",
    objectLabel: "Explorar las guitarras",
    title: "Música de todos los días",
    description:
      "La música me acompaña todos los días. Toco la guitarra desde adolescente y me inclino sobre todo por el rock de los años 70, 80 y 90. Mis bandas favoritas son Led Zeppelin, Pink Floyd, Metallica y Black Sabbath. También colecciono vinilos y disfruto de elegir un disco para escucharlo de principio a fin. Un dato curioso: las guitarras de la habitación son las mismas que tengo en casa.",
    position: { left: "68%", top: "40.5%", width: "28%", height: "42%" },
    zoom: { origin: "82% 61%", scale: 1.27 },
  },
  {
    id: "books",
    shortLabel: "Libros",
    objectLabel: "Recorrer la biblioteca",
    title: "Lecturas favoritas",
    description:
      "No tengo un género literario favorito. Si tuviera que elegir un autor, sería Fiódor Dostoyevski: mi novela preferida es Los hermanos Karamázov, seguida por Crimen y castigo. En ciencia ficción me quedo con Dune, pero mi obra favorita de todas es La divina comedia.",
    position: { left: "2.5%", top: "7%", width: "23.5%", height: "65%" },
    zoom: { origin: "14% 40%", scale: 1.25 },
  },
  {
    id: "photo",
    shortLabel: "Fotografía",
    objectLabel: "Tomar la cámara analógica",
    title: "Fotografía analógica",
    description:
      "La fotografía es una de mis pasiones más recientes. Disparo con una Canon AV-1 y disfruto especialmente del ritmo de la fotografía analógica. Estas son algunas imágenes que tomé con ella.",
    gallery: [
      { src: "/assets/photography/horse-woodland.jpg", alt: "Caballo blanco entre árboles junto a un lago", width: 359, height: 542 },
      { src: "/assets/photography/forest-waterfall.jpg", alt: "Cascada entre paredes rocosas cubiertas de bosque", width: 1444, height: 2178 },
      { src: "/assets/photography/mountain-lake.jpg", alt: "Lago y bosque bajo montañas nevadas y nubes", width: 1444, height: 2178 },
      { src: "/assets/photography/bookshop-reading.jpg", alt: "Persona leyendo entre estantes de una librería, en blanco y negro", width: 2178, height: 1444 },
      { src: "/assets/photography/white-flowers.jpg", alt: "Flores blancas fotografiadas en blanco y negro", width: 3089, height: 2048 },
      { src: "/assets/photography/perro-canon-av1.jpg", alt: "Retrato de un perro en blanco y negro", width: 2178, height: 1444 }
    ],
    position: { left: "28.5%", top: "48.5%", width: "8.5%", height: "12%" },
    zoom: { origin: "32.5% 54%", scale: 1.5 },
  },
];

export type Language = "en" | "es";

const english: Record<RoomItemId, Partial<RoomItem>> = {
  work: {
    shortLabel: "Work",
    objectLabel: "Open the MacBook",
    title: "Professional experience",
    description:
      "I'm a software developer specializing in payments, with experience evolving payment engines and automating critical processes. My work spans digital payments and capital markets settlement. Today, I design and build AI systems and agent architectures that automate operations and reduce manual work.",
    experience: [
      {
        company: "Belong",
        role: "AI Backend Payments Engineer",
        period: "Jan 2026 - Present",
        projectTitles: ["Core payment operations", "Payment provider migration", "AI-powered payment requests"],
        focus: ["Payment infrastructure", "Dwolla → J.P. Morgan", "AI agents"],
        context:
          "A US proptech startup combining rental management, financial services, and AI technology.",
        highlights: [
          "I own the maintenance and evolution of the payment engine that supports Belong’s financial services. My work spans payouts, refunds, and balance operations, combining development of the core processing systems with the ongoing maintenance of the platform’s payment capabilities.",
          "I led the migration of payment processing from Dwolla to J.P. Morgan. This project changed the provider behind the platform’s payment transactions and formed part of the broader evolution of Belong’s financial infrastructure and payment engine.",
          "I designed and developed an AI agent to automate payment requests, an operational workflow that previously required manual intervention from the team. The agent reduced that manual work by 70%, bringing together my payment-systems experience and my work on agent-based automation.",
        ],
      },
      {
        company: "Banco Hipotecario",
        role: ".NET Developer",
        period: "Jan 2024 - Jan 2026",
        projectTitles: ["Capital markets settlement", "Automation and data pipelines"],
        context: "Systems for Financial Operations, focused on financial instrument settlement and process automation.",
        focus: [".NET Core", "Python", "Capital markets"],
        highlights: [
          "I led the end-to-end development of automated cash settlement for capital markets purchases and sales. The scope covered financial instruments including stocks, bonds, and bills, within the systems used by the bank’s Financial Operations area.",
          "Alongside the settlement systems, I developed automation tools and data pipelines using .NET Core and Python. This work supported financial operations through a combination of backend development, data processing, and the automation of operational tasks.",
        ],
      },
      {
        company: "QServices",
        role: ".NET Developer",
        period: "Oct 2022 - Dec 2024",
        projectTitles: ["DirecTV collections platform", "Legacy system modernization"],
        context: "Enterprise software for DirecTV’s collections operations across South America.",
        focus: [".NET Core", "Oracle", "Vue.js"],
        highlights: [
          "I developed and maintained DirecTV’s internal collections management system for South America. I worked with .NET Core, Oracle, and Vue.js on enterprise software spanning backend services, database persistence, and the user interface used for collections operations.",
          "I contributed to the refactoring and modernization of legacy components within the system. This work focused on improving the application’s overall reliability and performance as part of the ongoing maintenance and evolution of DirecTV’s enterprise software.",
        ],
      },
    ],
  },
  cinema: {
    shortLabel: "Cinema",
    objectLabel: "Watch the television",
    title: "Films I come back to",
    description:
      "I've loved cinema since I was a kid. If I had to choose four films, they would be The Godfather, Blade Runner, Annie Hall, and Vertigo.",
  },
  music: {
    shortLabel: "Music",
    objectLabel: "Explore the guitars",
    title: "A record, start to finish",
    description:
      "Music is part of my everyday life. I've played guitar since my teens, mostly rock from the 70s, 80s, and 90s. My favorite bands are Led Zeppelin, Pink Floyd, Metallica, and Black Sabbath. I collect vinyl and enjoy choosing a record to listen to from start to finish. The guitars in this room are the same ones I have at home.",
  },
  books: {
    shortLabel: "Books",
    objectLabel: "Browse the bookshelf",
    title: "On my bookshelf",
    description:
      "I don't have a favorite literary genre. If I had to choose an author, it would be Fyodor Dostoevsky: The Brothers Karamazov is my favorite novel, followed by Crime and Punishment. For science fiction, I'd choose Dune, but my favorite work of all is The Divine Comedy.",
  },
  photo: {
    shortLabel: "Photos",
    objectLabel: "Pick up the film camera",
    title: "Through a film camera",
    description:
      "Photography is one of my more recent passions. I shoot with a Canon AV-1 and especially enjoy the slower pace of film photography. Here are a few photographs I've taken with it.",
    gallery: [
      { src: "/assets/photography/horse-woodland.jpg", alt: "White horse beneath trees beside a lake", width: 359, height: 542 },
      { src: "/assets/photography/forest-waterfall.jpg", alt: "Waterfall between forest-covered rocky walls", width: 1444, height: 2178 },
      { src: "/assets/photography/mountain-lake.jpg", alt: "Lake and forest beneath snow-covered mountains and clouds", width: 1444, height: 2178 },
      { src: "/assets/photography/bookshop-reading.jpg", alt: "Person reading among bookshop shelves, in black and white", width: 2178, height: 1444 },
      { src: "/assets/photography/white-flowers.jpg", alt: "White flowers photographed in black and white", width: 3089, height: 2048 },
      { src: "/assets/photography/perro-canon-av1.jpg", alt: "Black-and-white portrait of a dog", width: 2178, height: 1444 }
    ],
  },
};

export function getRoomItems(language: Language): RoomItem[] {
  return language === "es"
    ? roomItems
    : roomItems.map((item) => ({ ...item, ...english[item.id] }));
}

export const interfaceText = {
  en: {
    name: "Lucio's room",
    subtitle: "An interactive portfolio",
    instruction: "A few things that make me, me. Pick an object to explore.",
    mobileHint: "Swipe around the room, or choose an object below.",
    desktopHint: "Choose an object in the room to take a closer look.",
    room: "Interactive room",
    objects: "Objects in the room",
    loading: "Opening the room…",
    error: "The room couldn't load.",
    retry: "Try again",
    close: "Back to the room",
    previous: "Previous object",
    next: "Next object",
    profile: "Professional profile",
    history: "Experience",
    gallery: "Photographs taken with a Canon AV-1",
    motionOn: "Pause room animations",
    motionOff: "Resume room animations",
    imageAlt:
      "A pixel-art room at night: a MacBook, a television showing Vertigo, books, a film camera, guitars, a record player, and vinyl records.",
    contact: "Get in touch",
    github: "GitHub",
    linkedin: "LinkedIn",
    title: "Lucio Nigro — Software Engineer",
    description:
      "Explore Lucio Nigro's interactive 3D room: software engineering, cinema, music, books, and film photography.",
  },
  es: {
    name: "La habitación de Lucio",
    subtitle: "Portfolio interactivo",
    instruction: "Un poco de lo que soy. Elegí un objeto para explorar.",
    mobileHint: "Recorré la habitación con el dedo o elegí un objeto abajo.",
    desktopHint: "Elegí un objeto de la habitación para acercarte.",
    room: "Habitación interactiva",
    objects: "Objetos de la habitación",
    loading: "Abriendo la habitación…",
    error: "La habitación no pudo cargarse.",
    retry: "Reintentar",
    close: "Volver a la habitación",
    previous: "Objeto anterior",
    next: "Objeto siguiente",
    profile: "Perfil profesional",
    history: "Trayectoria",
    gallery: "Fotografías tomadas con una Canon AV-1",
    motionOn: "Pausar animaciones",
    motionOff: "Reanudar animaciones",
    imageAlt:
      "Habitación pixel-art nocturna con una MacBook, televisor con Vértigo, biblioteca, cámara analógica, guitarras, tocadiscos y vinilos.",
    contact: "Hablemos",
    github: "GitHub",
    linkedin: "LinkedIn",
    title: "Lucio Nigro — Ingeniero de software",
    description:
      "Explorá la habitación 3D de Lucio Nigro: desarrollo de software, cine, música, libros y fotografía analógica.",
  },
};
