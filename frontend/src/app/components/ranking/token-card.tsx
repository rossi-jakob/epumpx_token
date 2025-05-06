import { trendingTokensData } from "./constant";
import { useTranslation } from "react-i18next";

export type TrendingToken = (typeof trendingTokensData)[number];

export const TrendingTokenCard: React.FC<TrendingToken> = (token) => {
  const {t} = useTranslation();
  return (
    <div
      key={token.id}
      className="flex-shrink-0 bg-[#2C2C2C] rounded-full p-2 flex items-center space-x-3 min-w-[350px]"
    >
      <div className="w-20 h-20 rounded-full bg-[#2C2C2C] flex items-center justify-center">
        <img
          src="/top-token.png"
          alt="Token"
          className="w-full h-full rounded-full"
        />
      </div>
      <div>
        <div className="text-gray-400 text-xs">
          {token.volume}
          {token.unit} <span className="text-green-400">{t("boughtOf")}</span>
        </div>
        <div className="text-white text-sm font-medium">{token.name}</div>
      </div>
    </div>
  );
};
