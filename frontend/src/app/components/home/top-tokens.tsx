"use client";
import { TokenCarousel } from "./token-carousel";
import React from "react";
import { useTranslation } from "react-i18next";

export default function TopTokens({allTokenInfoArray} : any) {
  const {t} = useTranslation();
  return (
    <section className="py-8 bg-[#282D44] component-edge-root">
      <div className="max-w-full mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-1">
          {t("topToken")}
        </h2>
        <p className="text-gray-400 text-center font-bold mb-5 text-lg">
          {t("discoverLeadingTokens")}
        </p>

        <div className="flex flex-wrap pb-4 gap-4">
          {allTokenInfoArray.length>0 && <TokenCarousel tokens={allTokenInfoArray} />}
          {allTokenInfoArray.length>0 && <TokenCarousel tokens={allTokenInfoArray} direction="rtl" />}
        </div>
      </div>
    </section>
  );
}
