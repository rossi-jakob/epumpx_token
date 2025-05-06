"use client";

import useEmblaCarousel from "embla-carousel-react";
import React, { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

export const ProductCarousel = ({
  autoplay = true,
  autoplayInterval = 1000,

  containerClass = "",
  children,
}: any) => {
  const animationRef = useRef<NodeJS.Timeout>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    skipSnaps: false,
    dragFree: true,
    watchDrag: (api, evt) => {
      api.on("pointerUp", () => {
        startAnimation(api);
      });
      stopAnimation();
      return true;
    },
  });

  const startAnimation = (api = emblaApi) => {
    if (!api) return;
    stopAnimation();
    animationRef.current = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, autoplayInterval);

    return stopAnimation;
  };

  const stopAnimation = () => {
    if (!animationRef.current) return;

    clearInterval(animationRef.current);
  };

  // Autoplay functionality
  useEffect(() => {
    if (!emblaApi || !autoplay) return;

    return startAnimation();
  }, [emblaApi, autoplay, autoplayInterval]);

  return (
    <div className={cn("relative", containerClass)}>
      <div className={cn("overflow-x-clip")} ref={emblaRef}>
        <div className="flex">{children}</div>
      </div>
    </div>
  );
};

export const ProductCarouselItem = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="h-full w-1/2 flex-none px-1 md:w-1/7 lg:w-1/10 xl:w-1/12">
      {children}
    </div>
  );
};
