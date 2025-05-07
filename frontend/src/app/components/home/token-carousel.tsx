"use client";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

interface Token {
  address: string;
  name: string;
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

  const speed = 100; // pixels per second

  const calculateDuration = (width: number) => width / speed;

  const startLoop = () => {
    const width = scrollWidthRef.current;
    const duration = calculateDuration(width);

    controls.start({
      x: direction === "ltr" ? -width : 0,
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
          const fromX = currentX.current;
          const remaining = direction === "ltr"
            ? fromX + width
            : Math.abs(fromX);
          const duration = remaining / speed;

          controls.start({
            x: direction === "ltr" ? -width : 0,
            from: fromX,
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
            className="flex-shrink-0 select-none mx-2 hover:cursor-pointer hover:outline hover:outline-2 hover:outline-[#8346FF] hover:rounded-full"
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
                  {token.name.length > 5
                    ? token.name.slice(0, 2) +
                    "..." +
                    token.name.slice(-2)
                    : token.name}
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

