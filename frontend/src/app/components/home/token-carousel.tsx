"use client";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

interface Token {
  address: string;
  name: string;
  symbol: string;
  logo: string;
  funds?: number;
}

interface TokenCarouselProps {
  tokens: Token[];
  direction?: "ltr" | "rtl";
}

export function TokenCarousel({
  tokens,
  direction = "ltr",
}: TokenCarouselProps) {
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentX = useRef(0);
  const scrollWidthRef = useRef(0);
  const router = useRouter();
  const { t } = useTranslation();

  console.log("token carsoel===========", tokens);

  const speed = 100; // pixels per second

  const calculateDuration = (width: number) => width / speed;

  const startLoop = () => {
    const width = scrollWidthRef.current;
    const initialX = direction === "ltr" ? 0 : -width;
    const targetX = direction === "ltr" ? -width : 0;
    const duration = calculateDuration(width);
  
    currentX.current = initialX;
    controls.set({ x: initialX });
    controls.start({
      x: targetX,
      transition: {
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
        duration,
      },
    });
  };

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    requestAnimationFrame(() => {
      const fullWidth = scrollEl.scrollWidth;
      scrollWidthRef.current = fullWidth / 2;

      const initialX = direction === "ltr" ? 0 : -scrollWidthRef.current;
      currentX.current = initialX;
      controls.set({ x: initialX });

      startLoop();
    });

    return () => controls.stop();
  }, [tokens, direction]);

  return (
    <div className="w-full overflow-hidden" ref={containerRef}>
      <motion.div
        ref={scrollRef}
        animate={controls}
        className="whitespace-nowrap inline-flex"
        onMouseEnter={() => controls.stop()}
        onMouseLeave={() => {
          const width = scrollWidthRef.current;
          let fromX = currentX.current;
        
          const isAtLoopEnd = direction === "ltr"
            ? fromX <= -width + 1 // Add a small tolerance
            : fromX >= -1;
        
          if (isAtLoopEnd) {
            // Loop finished → reset to start
            fromX = direction === "ltr" ? 0 : -width;
            controls.set({ x: fromX });
            currentX.current = fromX;
          }
        
          const targetX = direction === "ltr" ? -width : 0;
          const remaining = Math.abs(targetX - fromX);
          const duration = remaining / speed;
        
          // If distance is too small, just restart full loop
          if (remaining < 100) {
            console.log("remain is less than 2")
            startLoop(); // Call the proper startLoop method
            return;
          }
        
          controls.set({ x: fromX }); // Resume from current
          controls.start({
            x: targetX,
            transition: {
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
              duration,
            },
          });
        }}
        onUpdate={(latest) => {
          if (typeof latest.x === "number") {
            currentX.current = latest.x;
          }
        }}
      >
        {[...tokens, ...tokens].map((token, index) => (
          <div
            key={index}
            className="flex-shrink-0 select-none mx-2 hover:cursor-pointer hover:outline hover:outline-2 hover:outline-[#8346FF] hover:rounded-full m-2"
            onClick={() => router.push(`/token/${token.address}`)}
          >
            <div className="bg-[#191C2F] rounded-full p-2 flex items-center space-x-3 w-[240px]">
              <div className="w-20 h-20 rounded-full bg-[#2C2C2C] flex items-center justify-center">
                <img
                  src={token.logo === "" ? "/top-token.png" : token.logo}
                  alt="Token"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div>
                <div className="text-gray-400 text-xs">
                  {token.funds?.toFixed(2)}{" "}
                  <span className="text-green-400">{t("boughtOf")}</span>
                </div>
                <div className="text-white text-md font-bold">
                  {token.symbol.length > 8
                    ? token.symbol.slice(0, 2) +
                    "..." +
                    token.symbol.slice(-2)
                    : token.symbol}
                  /EPIX
                </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

