import React, { useEffect, useRef } from "react";

interface GalaxyProps {
  starSpeed?: number;
  density?: number;
  hueShift?: number;
  speed?: number;
  glowIntensity?: number;
  saturation?: number;
  mouseRepulsion?: boolean;
  repulsionStrength?: number;
  twinkleIntensity?: number;
  rotationSpeed?: number;
  transparent?: boolean;
}

const Galaxy: React.FC<GalaxyProps> = ({
  starSpeed = 0.5,
  density = 1.2,
  hueShift = 155,
  speed = 1.1,
  glowIntensity = 0.25,
  saturation = 0.4,
  mouseRepulsion = false,
  repulsionStrength = 0.5,
  twinkleIntensity = 0.3,
  rotationSpeed = 0.05,
  transparent = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Star[] = [];
    const mouse = { x: 0, y: 0 };

    const resize = () => {
      // Fix for High-DPI displays
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      
      initStars();
    };

    class Star {
      x: number;
      y: number;
      z: number;
      size: number;
      baseX: number;
      baseY: number;
      angle: number;
      radius: number;
      color: string;
      twinkle: number;

      constructor() {
        const width = window.innerWidth;
        this.x = 0;
        this.y = 0;
        this.z = Math.random() * width;
        this.size = Math.random() * 2;
        
        this.angle = Math.random() * Math.PI * 2;
        this.radius = Math.random() * (width / 1.5);
        this.baseX = Math.cos(this.angle) * this.radius;
        this.baseY = Math.sin(this.angle) * this.radius;
        
        this.twinkle = Math.random();
        
        const hue = (hueShift + (this.radius / (width / 2)) * 50) % 360;
        this.color = `hsla(${hue}, ${saturation * 100}%, ${50 + Math.random() * 30}%, 1)`;
      }

      update() {
        this.angle += rotationSpeed * 0.01 * speed;
        this.baseX = Math.cos(this.angle) * this.radius;
        this.baseY = Math.sin(this.angle) * this.radius;

        const width = window.innerWidth;
        const height = window.innerHeight;

        this.z -= starSpeed * speed;
        if (this.z <= 0) {
          this.z = width;
          this.radius = Math.random() * (width / 1.5);
        }

        const perspective = 300 / (300 + this.z);
        let screenX = (width / 2) + this.baseX * perspective;
        let screenY = (height / 2) + this.baseY * perspective;

        if (mouseRepulsion) {
          const dx = screenX - mouse.x;
          const dy = screenY - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 200;

          if (distance < maxDist) {
            const force = (1 - distance / maxDist) * repulsionStrength * 20;
            const angleToMouse = Math.atan2(dy, dx);
            screenX += Math.cos(angleToMouse) * force;
            screenY += Math.sin(angleToMouse) * force;
          }
        }

        this.x = screenX;
        this.y = screenY;
        this.twinkle += 0.05 * speed;
      }

      draw() {
        if (!ctx) return;
        
        const size = (this.size * (300 / (300 + this.z))) * (1 + Math.sin(this.twinkle) * twinkleIntensity);
        const opacity = 1 - (this.z / window.innerWidth);

        ctx.globalAlpha = opacity;
        ctx.fillStyle = this.color;
        
        if (glowIntensity > 0) {
            ctx.shadowBlur = size * 5 * glowIntensity;
            ctx.shadowColor = this.color;
        } else {
            ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, size > 0 ? size : 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    const initStars = () => {
      const starCount = Math.floor((window.innerWidth * window.innerHeight) / 6000 * density);
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push(new Star());
      }
    };

    const animate = () => {
      if (!transparent) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      stars.forEach((star) => {
        star.update();
        star.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener("resize", resize);
    if (mouseRepulsion) window.addEventListener("mousemove", handleMouseMove);
    
    resize();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [starSpeed, density, hueShift, speed, glowIntensity, saturation, mouseRepulsion, repulsionStrength, twinkleIntensity, rotationSpeed, transparent]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

export default Galaxy;