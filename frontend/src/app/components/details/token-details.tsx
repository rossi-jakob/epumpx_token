'use client'

import {useState, useEffect} from "react"
import { LuCopy } from "react-icons/lu";
import { convertNumberFormat } from '../../utils/util'
import { useTranslation } from "react-i18next";

const TokenDetails = (props : any)=>{
  const { tokenAddr, tradeData, curveInfo } = props;
  const [virtualLiquidity, setVLiquidity] = useState(0)
  const {t} = useTranslation()

  useEffect(()=>{
    if (curveInfo)
      setVLiquidity(Number(Number(curveInfo?.epixPrice) * (12.53 + curveInfo?.funds * 2)))
  }, [curveInfo])
  
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Token Info Column */}
        <div className="flex items-center gap-3">
          <img src={curveInfo?.logo==""? "/nft.svg" : curveInfo?.logo} alt="Token" className="w-12 h-12 rounded-full" />
          <div>
            <h2 className="text-lg font-bold text-white">{curveInfo?.symbol} / EPIX</h2>
            <div className="text-sm text-gray-400">
              {t("marketCap")}: <span className="text-green-400">${convertNumberFormat(curveInfo?.mc, 2)}</span>
            </div>
            <div className="text-xs font-bold text-white">
              <div className="flex items-center gap-1">
                {/* <span>CA {tokenAddr? spliceAdress(tokenAddr) : "0x000...0000"}</span> */}
                <span>CA {tokenAddr.slice(0, 6) + "..." + tokenAddr.slice(-4)}</span>
                <LuCopy
                  className="text-gray-400 hover:text-white cursor-pointer"
                  size={12}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Column */}
        <div className="text-sm space-y-1">
          <div className="text-gray-400">
            {t("virtualLiquidity")}: <span className="text-white">${convertNumberFormat(virtualLiquidity, 2)}</span>
          </div>
          <div className="text-gray-400">
            {t("price")}: <span className="text-white">${convertNumberFormat(curveInfo?.priceInUSD, 18)}</span>
          </div>
          <div className="text-gray-400">
            {t("volume")}: <span className="text-white">${curveInfo?.funds}</span>
          </div>
          <div className="text-gray-400">
            {t("rise")}: <span className="text-green-400">+{(Number(curveInfo?.priceInUSD)/Number(curveInfo?.priceInUSDInital) * 100 - 100).toFixed(2)} %</span>
          </div>
        </div>

        {/* Creator Info Column */}
        <div className="text-xs space-y-1">
          <div>
            {/* <span className="text-gray-400">Created By: {curveInfo.creator? spliceAdress(curveInfo.creator) : "0x000...000"}</span> */}
            <span className="text-gray-400">{t("createdBy")}: {curveInfo?.creator?.slice(0, 6) + "..." + curveInfo?.creator?.slice(-4)}</span>
            <span className="text-white"></span>
          </div>
          <div className="text-green-400">{t("noReservedTokens")}</div>
          <div className="text-green-400">{t("lpToken")}</div>
        </div>
      </div>
    </div>
  );
}

export default TokenDetails