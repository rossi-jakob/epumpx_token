"use client";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

interface TokenCarouselProps {
  tokens: any;
  direction?: "ltr" | "rtl";
}

export function TokenCarousel({
  tokens,
  direction = "ltr",
}: TokenCarouselProps) {
  const controls = useAnimation();
  const currentX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const {t} = useTranslation();

  const speed = (30 * (tokens.length / 20 + 1));

  useEffect(() => {
    const startAnimation = async () => {
      if (containerRef.current) {
        onUpdate: (latest: any) => {
          currentX.current = latest;
          if (
            (direction === "ltr" && latest <= -containerWidth) ||
            (direction === "rtl" && latest >= 0)
          ) {
            controls.set({ x: direction === "ltr" ? 0 : -containerWidth });
            currentX.current = direction === "ltr" ? 0 : -containerWidth;
          }
        }

        const containerWidth = containerRef.current.scrollWidth / 2;
        controls.set({ x: direction === "ltr" ? 0 : -containerWidth }); // Set initial position

        controls.start({
          x: direction === "ltr" ? -containerWidth : 0,
          transition: {
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
            duration: speed, // Adjust speed here
            onUpdate: (latest: any) => {
              if (
                (direction === "ltr" && latest <= -containerWidth) ||
                (direction === "rtl" && latest >= 0)
              ) {
                controls.set({ x: direction === "ltr" ? 0 : -containerWidth }); // Reset position
              }
            },
          },
        });
      }
    };
    startAnimation();
  }, [controls, direction]);

  return (
    <div className="w-full overflow-hidden" ref={containerRef}>
      <motion.div
        animate={controls}
        className="flex gap-4"
        style={{ width: "max-content" }}
        onMouseEnter={() => controls.stop()}
        onMouseLeave={() => {
          const containerWidth = containerRef.current?.scrollWidth! / 2;
        
          controls.start({
            x: direction === "ltr" ? -containerWidth : 0,
            from: currentX.current,
            transition: {
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
              duration: speed, // Use the same fixed duration
              onUpdate: (latest: any) => {
                currentX.current = latest;
                if (
                  (direction === "ltr" && latest <= -containerWidth) ||
                  (direction === "rtl" && latest >= 0)
                ) {
                  controls.set({ x: direction === "ltr" ? 0 : -containerWidth });
                  currentX.current = direction === "ltr" ? 0 : -containerWidth;
                }
              },
            },
          });
        }}
      >
        {[...tokens, ...tokens].map((token, index) => (
          <div key={index} className="flex-shrink-0 select-none m-2 hover:cursor-pointer hover:outline hover:outline-2 hover:outline-[#8346FF] hover:rounded-full" onClick={() => router.push(`/token/${token.address}`)}>
            <div className="bg-[#191C2F] rounded-full p-2 flex items-center space-x-3 w-[240px]">
              <div className="w-20 h-20 rounded-full bg-[#2C2C2C] flex items-center justify-center">
                <img
                  src={token.logo == "" ? "/top-token.png" : token.logo}
                  alt="Token"
                  className="w-full h-full rounded-full"
                />
              </div>
              <div>
                <div className="text-gray-400 text-xs">
                  {/* {token.volume} */}
                  {token.funds?.toFixed(2)} <span className="text-green-400">{t("boughtOf")}</span>
                </div>
                <div className="text-white text-md font-bold">{token.name.length > 5 ? token.name.slice(0, 2) + "..." + token.name.slice(-2) : token.name}/EPIX</div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default TokenCarousel;
