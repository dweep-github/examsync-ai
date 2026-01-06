import React, { useRef, useEffect } from 'react';

// 1. EDIT YOUR DEFAULTS HERE
// These values will be used if the parent doesn't provide them.
const DEFAULTS = {
  dotSize: 3,
  gap: 78,
  baseColor: "#5227FF",
  activeColor: "#5227FF",
  proximity: 150,
  speedTrigger: 100,
  shockRadius: 250,
  shockStrength: 2,
  maxSpeed: 200,
  resistance: 7500, // Higher = "stickier" fluid
  returnDuration: 2.5, // Seconds to return to grid
};

interface DotGridProps {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  proximity?: number;
  speedTrigger?: number;
  shockRadius?: number;
  shockStrength?: number;
  maxSpeed?: number;
  resistance?: number;
  returnDuration?: number;
}

const DotGrid: React.FC<DotGridProps> = (props) => {
  // Merge defaults with any passed props
  const config = { ...DEFAULTS, ...props };
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let dots: Dot[] = [];
    const mouse = { x: -9999, y: -9999 };
    let lastMouse = { x: -9999, y: -9999 };
    let lastTime = performance.now();

    const resize = () => {
      // Fix for High-DPI (Retina) Displays
      const dpr = window.devicePixelRatio || 1;
      
      // Set display size (css pixels)
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      
      // Set actual size in memory (scaled to account for extra pixels)
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      
      // Normalize coordinate system to use CSS pixels
      ctx.scale(dpr, dpr);
      
      // Initialize dots based on logical window size, NOT physical canvas size
      initDots(window.innerWidth, window.innerHeight);
    };

    class Dot {
      x: number;
      y: number;
      originX: number;
      originY: number;
      vx: number;
      vy: number;
      color: string;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.originX = x;
        this.originY = y;
        this.vx = 0;
        this.vy = 0;
        this.color = config.baseColor;
      }

      update(deltaTime: number, mouseSpeed: number) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Interaction
        if (dist < config.shockRadius && mouseSpeed > config.speedTrigger) {
          const force = (config.shockRadius - dist) / config.shockRadius;
          const angle = Math.atan2(dy, dx);
          const pushFactor = Math.min(mouseSpeed / 100, 5); 
          const pushX = -Math.cos(angle) * force * config.shockStrength * pushFactor;
          const pushY = -Math.sin(angle) * force * config.shockStrength * pushFactor;

          this.vx += pushX;
          this.vy += pushY;
          this.color = config.activeColor;
        } else if (dist < config.proximity) {
           this.color = config.activeColor;
        } else {
           this.color = config.baseColor;
        }

        // Drag / Resistance
        const drag = 1 - (config.resistance / 10000); 
        this.vx *= drag;
        this.vy *= drag;

        // Spring Return
        const springStiffness = 1 / (config.returnDuration * 10); 
        const springX = (this.originX - this.x) * springStiffness;
        const springY = (this.originY - this.y) * springStiffness;

        this.vx += springX;
        this.vy += springY;

        this.x += this.vx;
        this.y += this.vy;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, config.dotSize, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const initDots = (width: number, height: number) => {
      dots = [];
      const cols = Math.ceil(width / config.gap);
      const rows = Math.ceil(height / config.gap);
      const startX = (width - ((cols - 1) * config.gap)) / 2;
      const startY = (height - ((rows - 1) * config.gap)) / 2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          dots.push(new Dot(startX + i * config.gap, startY + j * config.gap));
        }
      }
    };

    const animate = (time: number) => {
      let deltaTime = (time - lastTime) / 1000;
      if (deltaTime <= 0) deltaTime = 0.016; 
      lastTime = time;

      const dx = mouse.x - lastMouse.x;
      const dy = mouse.y - lastMouse.y;
      const mouseSpeed = Math.sqrt(dx * dx + dy * dy) / deltaTime;
      
      lastMouse.x = mouse.x;
      lastMouse.y = mouse.y;

      // Clear using logical coordinates
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      dots.forEach(dot => {
        dot.update(deltaTime, mouseSpeed);
        dot.draw();
      });

      animationId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    
    resize(); // This will trigger initDots with correct dimensions
    requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [config]); // Re-run if config changes

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

export default DotGrid;