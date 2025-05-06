"use client";
import React from "react";
import GradientEllipse from "../gradient-ellipsis";
import { Button } from "@/components/ui/button";
import MasonryGrid from "../masonary-grid";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation} from "react-i18next";

export default function Hero() {
  const {t} = useTranslation();
  const { push } = useRouter();
  const buttonVariants = {
    initial: { scale: 1, y: 0 },
    animate: {
      scale: [1, 1.05, 0.95, 1],
      y: [-2, 2, -2],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      },
    },
  };
  return (
    <div className="relative max-h-[720px] flex items-center bg-[#282D44] mt-16 lg:mt-0 component-edge-root">
      <GradientEllipse
        position="center-left"
        width="30%"
        height="60%"
        opacity={0.6}
        color="#8346FF99"
        blur="60px"
        zIndex={20}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 ">
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-white">
            {t("tagline1")} <br />
            {t("tagline2")}
            <br /> {t("tagline3")}
          </h1>
          <p className="text-white/70 text-lg mb-8">
            {t("slogan")} <br /> {t("slogan1")}
          </p>
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <motion.button
              variants={{
                initial: { scale: 1, y: 0 },
                animate: {
                  scale: [1, 1.04, 0.96, 1],
                  y: [-2, 2, -2],
                  transition: {
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  },
                },
              }}
              initial="initial"
              animate="animate"
              whileHover={{ scale: 1.1 }}
              className=" font-bold text-white text-md px-6 py-2 rounded-full cursor-pointer bg-linear-to-r from-[#8346FF] to-[#9458DF]"
              onClick={() => {
                push("/create");
              }}
            >
              {t("createToken")}
            </motion.button>

            <Button
              className="border-2 border-gray-400 text-white px-6 py-2 rounded-full hover:bg-transparent bg-transparent cursor-pointer hover:font-bold text-md"
              variant={"outline"}
            >
              {t("howworks")}
            </Button>
          </div>
        </div>

        <div className="hidden lg:block ">
          <MasonryGrid />
        </div>
      </div>
    </div>
  );
}
