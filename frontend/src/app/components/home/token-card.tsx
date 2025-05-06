import { Button } from "@/components/ui/button";
import { MoveUp } from "lucide-react";
import { useRouter } from "next/navigation";

import { convertNumberFormat } from "@/app/utils/util"
import { useTranslation } from "react-i18next";

export default function TokenCard({ tokenInfo }: any) {
  const { push } = useRouter();
  const { t } = useTranslation();

  return (
    <div
      className="cursor-pointer hover:outline hover:outline-2 hover:outline-[#8346FF] hover:rounded-[8px]"
      onClick={() => push(`/token/${tokenInfo.address}`)}
    >
      <div className="aspect-square p-4 flex items-center justify-center bg-[#191C2F] rounded-tl-[8px] rounded-tr-[8px]">
        {/* <img src="https://gateway.pinata.cloud/ipfs/bafkreie6axl6wwdikafl624a72r3h5tnvpdeg4qcwqeim7bxv3kftmunva" alt="IPFS Image" width="300"/> */}
        <img src={tokenInfo?.logo == "" ? "/nft.svg" : tokenInfo?.logo} alt="IPFS Image" width="300" />
      </div>

      <div className="p-4 space-y-2 bg-[#191C2F] rounded-bl-[8px] rounded-br-[8px]">
        <h3 className="text-white font-bold truncate">{tokenInfo.name}</h3>
        <p className="text-gray-400  text-md font-bold">{tokenInfo.version}</p>
        <p className="text-md font-bold text-transparent bg-clip-text bg-gray-400">
          {t("createdBy")} {tokenInfo?.creator
            ? (tokenInfo.creator.length > 10
              ? `${tokenInfo.creator.substring(0, 6)}...${tokenInfo.creator.substring(tokenInfo.creator.length - 4)}`
              : tokenInfo.creator)
            : "Unknown"}
        </p>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-700">
            <img
              src={tokenInfo?.logo == "" ? "/nft.svg" : tokenInfo?.logo}
              alt="Token"
              className="w-full h-full rounded-full"
            />
          </div>
          <Button
            variant="outline"
            className="text-xs h-6 px-2 py-0 rounded-full font-bold border-2 text-white"
          >
            {t("meme")}
          </Button>
          <Button className="text-xs h-6 px-2 py-0 ">
            {tokenInfo?.percentage}
            <MoveUp size={tokenInfo?.percentage} />
          </Button>
        </div>
        <p className="text-sm text-transparent bg-clip-text bg-gray-400">Market Cap: {convertNumberFormat(tokenInfo?.marketCap, 2)}</p>
        <div className="w-full h-2 bg-[#474647] rounded">
            <div className="h-full bg-linear-to-r from-[#9458DF] to-[#8346FF]"
              style={{
                width: `${tokenInfo?.marketCap >=0? (tokenInfo?.marketCap * 100) / tokenInfo?.hardcapMc : 0}%`
              }}
            >              
            </div>
        </div>
      </div>
    </div>
  );
}
