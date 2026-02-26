import React, { useEffect, useRef, useCallback, useState } from "react";
import createGlobe from "cobe";
import { motion, useSpring, useMotionValue } from "framer-motion";

// Location markers — major carbon-tracking hubs
const MARKERS = [
  { location: [37.7749, -122.4194], size: 0.06 }, // San Francisco
  { location: [51.5074, -0.1278], size: 0.07 }, // London
  { location: [35.6762, 139.6503], size: 0.06 }, // Tokyo
  { location: [1.3521, 103.8198], size: 0.05 }, // Singapore
  { location: [-33.8688, 151.2093], size: 0.05 }, // Sydney
  { location: [48.8566, 2.3522], size: 0.06 }, // Paris
  { location: [55.7558, 37.6173], size: 0.05 }, // Moscow
  { location: [19.076, 72.8777], size: 0.06 }, // Mumbai
  { location: [-23.5505, -46.6333], size: 0.05 }, // São Paulo
  { location: [31.2304, 121.4737], size: 0.06 }, // Shanghai
  { location: [25.2048, 55.2708], size: 0.05 }, // Dubai
  { location: [39.9042, 116.4074], size: 0.05 }, // Beijing
  { location: [40.7128, -74.006], size: 0.06 }, // New York
  { location: [-1.2921, 36.8219], size: 0.04 }, // Nairobi
  { location: [52.52, 13.405], size: 0.05 }, // Berlin
];

const InteractiveGlobe = ({ size = 600, className = "", dark = true }) => {
  const canvasRef = useRef(null);
  const pointerInteracting = useRef(null);
  const pointerInteractionMovement = useRef(0);
  const globeRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Smooth rotation with springs
  const phi = useMotionValue(0);
  const springPhi = useSpring(phi, { stiffness: 40, damping: 30 });

  const onPointerDown = useCallback((e) => {
    pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
  }, []);

  const onPointerUp = useCallback(() => {
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
  }, []);

  const onPointerOut = useCallback(() => {
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
  }, []);

  const onPointerMove = useCallback(
    (e) => {
      if (pointerInteracting.current !== null) {
        const delta = e.clientX - pointerInteracting.current;
        pointerInteractionMovement.current = delta;
        phi.set(delta / 100);
      }
    },
    [phi],
  );

  useEffect(() => {
    let currentPhi = 0;
    let width = 0;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    onResize();
    window.addEventListener("resize", onResize);

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: size * 2,
      height: size * 2,
      phi: 0,
      theta: 0.25,
      dark: dark ? 1 : 0,
      diffuse: 1.8,
      mapSamples: 20000,
      mapBrightness: dark ? 4 : 6,
      baseColor: dark ? [0.15, 0.22, 0.15] : [0.9, 0.95, 0.9],
      markerColor: [0.184, 0.498, 0.204], // #2f7f34 in normalized RGB
      glowColor: dark ? [0.08, 0.2, 0.08] : [0.85, 0.95, 0.85],
      markers: MARKERS,
      opacity: 0.85,
      onRender: (state) => {
        // Auto-rotate when not dragging
        if (pointerInteracting.current === null) {
          currentPhi += 0.003;
        }
        state.phi = currentPhi + phi.get();
        state.width = size * 2;
        state.height = size * 2;
      },
    });

    globeRef.current = globe;

    // Fade in canvas
    if (canvasRef.current) {
      canvasRef.current.style.opacity = "0";
      requestAnimationFrame(() => {
        if (canvasRef.current) {
          canvasRef.current.style.transition = "opacity 1s ease";
          canvasRef.current.style.opacity = "1";
        }
      });
    }

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [size, dark, phi]);

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer glow ring */}
      <motion.div
        animate={{
          opacity: isHovered ? 0.6 : 0.25,
          scale: isHovered ? 1.04 : 1,
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--color-primary) 15%, transparent) 0%, color-mix(in srgb, var(--color-primary) 5%, transparent) 50%, transparent 70%)",
        }}
      />

      {/* Pulsing ring */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.15, 0.05, 0.15],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-[-8%] rounded-full border border-primary/20"
      />

      {/* Second pulsing ring (offset timing) */}
      <motion.div
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.1, 0.02, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute inset-[-15%] rounded-full border border-primary/10"
      />

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerOut={onPointerOut}
        onPointerMove={onPointerMove}
        style={{
          width: size,
          height: size,
          maxWidth: "100%",
          aspectRatio: "1",
          cursor: "grab",
          contain: "layout paint size",
        }}
      />

      {/* Bottom reflection */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[15%] rounded-full blur-2xl pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, color-mix(in srgb, var(--color-primary) 20%, transparent) 0%, transparent 70%)",
        }}
      />
    </div>
  );
};

export default InteractiveGlobe;
