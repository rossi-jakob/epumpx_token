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
  const currentX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);
  const router = useRouter();
  const { t } = useTranslation();

  const pxPerSecond = 100;

  const startScrolling = (containerWidth: number, fromX: number) => {
    const distance =
      direction === "ltr" ? fromX - -containerWidth : fromX - 0;

    const duration = Math.abs(distance) / pxPerSecond;

    controls.start({
      x: direction === "ltr" ? -containerWidth : 0,
      transition: {
        ease: "linear",
        duration,
        onUpdate: (latest: any) => {
          currentX.current = latest;

          if (
            (direction === "ltr" && latest <= -containerWidth) ||
            (direction === "rtl" && latest >= 0)
          ) {
            const resetX = direction === "ltr" ? 0 : -containerWidth;

            // Prevent running logic after unmount
            if (!isMounted.current) return;

            controls.set({ x: resetX }); // Removed `.then(...)`
            currentX.current = resetX;
            startScrolling(containerWidth, resetX); // Safely restart the scroll loop
          }
        },
      },
    });
  };

  useEffect(() => {
    isMounted.current = true;
    const containerWidth = containerRef.current?.scrollWidth! / 2;
    const initialX = direction === "ltr" ? 0 : -containerWidth;
    controls.set({ x: initialX });
    currentX.current = initialX;
    startScrolling(containerWidth, initialX);

    return () => {
      isMounted.current = false;
      controls.stop(); // Cleanup on unmount
    };
  }, [controls, direction, tokens]);

  return (
    <div className="w-full overflow-hidden" ref={containerRef}>
      <motion.div
        animate={controls}
        className="flex gap-4"
        style={{ width: "max-content" }}
        onMouseEnter={() => {
          if (isMounted.current) controls.stop();
        }}
        onMouseLeave={() => {
          const containerWidth = containerRef.current?.scrollWidth! / 2;
          if (isMounted.current) {
            startScrolling(containerWidth, currentX.current);
          }
        }}
      >
        {[...tokens, ...tokens].map((token, index) => (
          <div
            key={index}
            className="flex-shrink-0 select-none m-2 hover:cursor-pointer hover:outline hover:outline-2 hover:outline-[#8346FF] hover:rounded-full"
            onClick={() => router.push(`/token/${token.address}`)}
          >
            <div className="bg-[#191C2F] rounded-full p-2 flex items-center space-x-3 w-[240px]">
              <div className="w-20 h-20 rounded-full bg-[#2C2C2C] flex items-center justify-center">
                <img
                  src={token.logo === "" ? "/top-token.png" : token.logo}
                  alt="Token"
                  className="w-full h-full rounded-full"
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

export default TokenCarousel;
