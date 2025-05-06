import { tradingVolumeData } from "./constant";
import { useTranslation } from "react-i18next";

export const AllDayRanking = (props : any) => {
  const {volTokenInfoMap} = props;
  const {t} = useTranslation();

  return (
    <div className="bg-[#1B1E2E] rounded-4xl overflow-hidden">
      <div className="bg-gradient-to-r from-[#0996FF] to-[#0765D0] font-bold py-3 text-center mx-52 rounded-b-4xl">
        {t("volume24h")}
      </div>
      <div className="max-h-[500px] overflow-y-auto table-scroll-container px-6">
        <table className="w-full">
          <thead className="sticky top-0 bg-[#1B1E2E] z-10">
            <tr className="text-white font-bold text-sm border-b border-gray-800">
              <th className="py-3 px-2 text-left">{t("rank")}</th>
              <th className="py-3 px-2 text-left">{t("tokenName")}</th>
              <th className="py-3 px-2 text-left">{t("marketCap")}</th>
              <th className="py-3 px-2 text-left">{t("volume")}</th>
              <th className="py-3 px-2 text-left">{t("raisedToken")}</th>
            </tr>
          </thead>
          <tbody>
            {volTokenInfoMap?.forEach((value : any, key : any) => (
              <tr key={key} className="border-b border-gray-800/30 px-4">
                <td className="py-3 px-2 text-white">{key}</td>
                <td className="py-3 px-2">
                  <div className="flex items-center space-x-2">
                    <img
                      src="/top-token.png"
                      className="w-6 h-6 rounded-full"
                      alt="Token"
                    />
                    <span className="text-white">{value.name}</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-left text-white">
                  {value.marketCap}
                </td>
                <td className="py-3 px-2 text-left text-white">
                  {value.volume}
                </td>
                <td className="py-3 px-2 text-left">
                  <div className="flex items-center  space-x-2">
                    <img
                      src="/token-icon.svg"
                      className="w-6 h-6 rounded-full"
                      alt="Token"
                    />
                    <span className="text-white">EPIX</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
