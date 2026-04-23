import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";

export default function Hero() {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0vh", "50vh"]);

  return (
    <div
      ref={container}
      className="relative flex items-center justify-center h-screen overflow-hidden"
    >
      <motion.div
        style={{ y }}
        className="absolute inset-0 w-full h-full"
      >
        <img
          src="https://cdn.poehali.dev/projects/465f29a2-8679-45d7-b6b1-bac1045f3a05/files/33633c58-227a-480c-9767-cda52e5ecd16.jpg"
          alt="Luxury fashion wardrobe"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      <div className="relative z-10 text-center text-white">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
          ТВОЙ СТИЛЬ
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto px-6 opacity-90">
          Персональный AI-ассистент, который знает твой лук-бук и мгновенно скажет — брать или нет
        </p>
        <button className="mt-10 border border-white text-white px-8 py-3 uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all duration-300">
          Узнать больше
        </button>
      </div>
    </div>
  );
}