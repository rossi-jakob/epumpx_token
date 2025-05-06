'use client'
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export const TokenSidebarInfo = ({curveInfo} : any) => {
  const {t} = useTranslation()

  return (
    <div className="bg-[#191C2F] rounded-4xl py-2">
      <div className="flex items-center justify-center space-x-4 ">
        <div className="w-20 h-20 rounded-full bg-gray-700">
          <img
            src={curveInfo?.logo==""? "/nft.svg" : curveInfo?.logo}
            alt="Token"
            className="w-full h-full rounded-full"
          />
        </div>
        <div className="flex flex-col  gap-2">
          <h3 className="text-xl font-bold text-white">{curveInfo?.symbol} / EPIX</h3>
          <Button variant="outline" className="text-md font-bold">
            {t("meme")}
          </Button>

          <div>
            <p className="text-sm text-white font-bold">{curveInfo?.description}</p>
            <p className=" text-sm mb-4 text-white">{t("loveGaming")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
