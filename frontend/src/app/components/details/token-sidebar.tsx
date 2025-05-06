"use client"
import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

//import { useRouter} from "next/router";
import { formatUnits } from "viem";
import { TokenSidebarInfo } from "./token-sidebar-info";
import TokenBuySell from "./token-buy-sell";
import { TokenSupply } from "./token-supply";

import { useAccount, useConfig } from "wagmi";
import {
  multicall,
  estimateGas,
  writeContract,
  waitForTransactionReceipt,
} from "@wagmi/core";

import { useCurveStatus } from "../hooks/useCurveStatus";
import { isValidAddress } from "../../utils/util";
import { useTranslation } from "react-i18next";

import curveABI from "../../../abi/curve.json";
import multicallABI from "../../../abi/multicall.json";
import erc20ABI from "../../../abi/erc20.json";
import Config from "../../config/config";

export function TokenSidebar() {  
  const router = useRouter();
  const params = useParams();
  const {t} = useTranslation();

  // const url = document.location.href.split("/");
  // const tokenAddr =
  //   url[url.length - 1].length > 42
  //     ? url[url.length - 1].slice(0, 42)
  //     : url[url.length - 1];
  const tokenAddr = params.id;

  const [refresh, setRefresh] = useState(false);

  const {
    allCurves,
    tradeData,
    holderData,
    tradeInfo,
    otherInfo,
  } = useCurveStatus(refresh, tokenAddr as any);

  const account = useAccount();

  const [refetch, setRefetch] = useState(false);
  const [curveInfo, setCurveInfo] = useState({});
  const [tokenInfo, setTokenInfo] = useState({});

  useEffect(() => {
    const timerID = setInterval(() => {
      setRefetch((prevData) => {
        return !prevData;
      });
    }, Config.REFETCH_INTERVAL);

    return () => {
      clearInterval(timerID);
    };
    // eslint-disable-next-line
  }, []);

  const getCurveInfo = useCallback(async (_tokenAddr : any) => {
    if (!_tokenAddr || !isValidAddress(_tokenAddr)) {
      return {
        supply: "0",
        funds: 0,
        status: 0,
        king: "0",
        creator: "",
        id: 0,
        token: "",
        totalSupply: "0",
        createdAt: 0,
        name: "",
        symbol: "",
        logo: "",
        priceInUSD: 0,
        mc: 0,
        hardcapMc: 0,
        kingcapMc: 0,
        description: "",
        twitter: "",
        telegram: "",
        website: "",
        actionAt: 0,
      };
    }
    try {
      const addr_abi = {
        address: Config.CURVE,
        abi: curveABI,
      }
      const _curveRaw = await multicall(Config.config, {
        contracts: [
          {
            ...addr_abi,
            functionName: "curveInfo",
            args: [_tokenAddr],
          } as any,
          {
            ...addr_abi,
            functionName: "priceInUSD",
            args: [_tokenAddr],
          } as any,
          {
            ...addr_abi,
            functionName: "hardcapPriceInUSD",
            args: [_tokenAddr],
          } as any,
          {
            ...addr_abi,
            functionName: "kingcapPriceInUSD",
            args: [_tokenAddr],
          } as any,
        ],
      });
      const supply = ( _curveRaw[0] as any).status === "success" ? (_curveRaw[0] as any).result[0] : "0";
      const funds = _curveRaw[0].status === "success" ? Number(formatUnits(( _curveRaw[0] as any).result[1], 18)) : 0;
      const status = ( _curveRaw[0] as any).status === "success" ? Number(( _curveRaw[0] as any).result[2]) : 0;
      const king = ( _curveRaw[0] as any).status === "success" ? ( _curveRaw[0] as any).result[3] : "0";
      const creator = ( _curveRaw[0] as any).status === "success" ? ( _curveRaw[0] as any).result[4] : "";
      const id = ( _curveRaw[0] as any).status === "success" ? Number(( _curveRaw[0] as any).result[5]) : 0;
      const token = _tokenAddr;
      const totalSupply = ( _curveRaw[0] as any).status === "success" ? ( _curveRaw[0] as any).result[7] : "0";
      const createdAt = ( _curveRaw[0] as any).status === "success" ? Number(( _curveRaw[0] as any).result[8]) : 0;
      const name = ( _curveRaw[0] as any).status === "success" ? ( _curveRaw[0] as any).result[9] : "";
      const symbol = ( _curveRaw[0] as any).status === "success" ? ( _curveRaw[0] as any).result[10] : "";
      const logo = ( _curveRaw[0] as any).status === "success" ? ( _curveRaw[0] as any).result[11] : "";
      const description = ( _curveRaw[0] as any).status === "success" ? ( _curveRaw[0] as any).result[12] : "";
      const twitter = ( _curveRaw[0] as any).status === "success" ? ( _curveRaw[0] as any).result[13] : "";
      const telegram = ( _curveRaw[0] as any).status === "success" ? ( _curveRaw[0] as any).result[14] : "";
      const website = ( _curveRaw[0] as any).status === "success" ? ( _curveRaw[0] as any).result[15] : "";
      const actionAt = ( _curveRaw[0] as any).status === "success" ? Number(( _curveRaw[0] as any).result[16]) : 0;
      const priceInUSD = _curveRaw[1].status === "success" ? Number(formatUnits((_curveRaw[1] as any).result, 12)) : 0;
      const mc = _curveRaw[1].status === "success" ? Number(formatUnits((_curveRaw[1] as any).result, 3)) : 0;
      const hardcapMc = _curveRaw[2].status === "success" ? Number(formatUnits((_curveRaw[2] as any).result, 3)) : 0;
      const kingcapMc = _curveRaw[3].status === "success" ? Number(formatUnits((_curveRaw[3] as any).result, 3)) : 0;
      //console.log('_curveInfo: ', supply, funds, status, king, creator, id, token, totalSupply, createdAt, name, symbol, logo, priceInUSD, mc)
      return {
        supply,
        funds,
        status,
        king,
        creator,
        id,
        token,
        totalSupply,
        createdAt,
        name,
        symbol,
        logo,
        priceInUSD,
        mc,
        hardcapMc,
        kingcapMc,
        description,
        twitter,
        telegram,
        website,
        actionAt
      };
    } catch (err) {
      return {
        supply: "0",
        funds: 0,
        status: 0,
        king: "0",
        creator: "",
        id: 0,
        token: "",
        totalSupply: "0",
        createdAt: 0,
        name: "",
        symbol: "",
        logo: "",
        priceInUSD: 0,
        mc: 0,
        hardcapMc: 0,
        kingcapMc: 0,
        description: "",
        twitter: "",
        telegram: "",
        website: "",
        actionAt: 0,
      };
    }
  }, []);

  useEffect(() => {    
    const fetchData = async (_tokenAddr : any) => {
      const _curveInfo = await getCurveInfo(_tokenAddr);
      setCurveInfo(_curveInfo);
    };
    const getTokenInfo = async (_tokenAddr : string) => {
      _tokenAddr =
        _tokenAddr.length > 42 ? _tokenAddr.slice(0, 42) : _tokenAddr;
      if (
        !_tokenAddr ||
        !isValidAddress(_tokenAddr) ||
        !account.address ||
        !isValidAddress(account.address)
      )
        return;
      let contracts : any[] = [];
      try {
        contracts.push({
          address: _tokenAddr,
          abi: erc20ABI,
          functionName: "balanceOf",
          args: [account.address],
        });

        contracts.push({
          address: Config.MULTICALL,
          abi: multicallABI,
          functionName: "getEthBalance",
          args: [account.address],
        });

        const _data = await multicall(Config.config, { contracts });
        const balance =
          account.address && _data[0].status === "success"
            ? (parseFloat(
              formatUnits((_data as any)[0].result, Config.CURVE_DEC)
            ) > 0.005 ? parseFloat(
              formatUnits((_data as any)[0].result, Config.CURVE_DEC)
            ) - 0.005 : 0).toFixed(2)
            : "0.00";
        const epixBal =
          account.address && _data[1].status === "success"
            ? parseFloat(formatUnits((_data as any)[1].result, Config.WETH_DEC)).toFixed(4)
            : "0.0000";
        setTokenInfo({ balance, epixBal });
      } catch (err) {
        console.log(err);
      }
    };
    
    fetchData(tokenAddr);
    getTokenInfo(tokenAddr as any);
  }, [tokenAddr, refetch, account.address, getCurveInfo]);

  const [getData, setGetData] = useState({});

  useEffect(() => {
    if (allCurves && allCurves.length > 0) {
      const _data = allCurves.find((item) => (item as any)?.token.toLowerCase() === (tokenAddr as string).toLowerCase());
      setGetData(_data as any);
    }
  }, [allCurves, tokenAddr]);

  if (!getData) {
    router.push("/");
  }

  return (
    <div className="space-y-6">
      <TokenSidebarInfo curveInfo = {curveInfo}/>
      <div className="space-y-2">
        <div className="text-md text-white font-bold">
          {`${t("bondingProgress")}: ${(curveInfo as any).funds >= 0
            ? (curveInfo as any).funds > Config.CURVE_HARDCAP
              ? 100
              : (
                ((curveInfo as any).funds * 100) /
                Config.CURVE_HARDCAP
              ).toFixed(2)
            : 0
            }%`}
        </div>
        <div className="w-full h-2 bg-[#474647]  rounded-full overflow-hidden">
          <div className="h-full bg-linear-to-r from-[#FDD700] to-[#AB9003]"
            style={{
              width: `${(curveInfo as any).funds >= 0
                  ? (curveInfo as any).funds > Config.CURVE_HARDCAP
                    ? 100
                    : (
                      ((curveInfo as any).funds * 100) /
                      Config.CURVE_HARDCAP
                    ).toFixed(2)
                  : 0
                }%`,
            }}></div>
        </div>
      </div>
      <TokenBuySell
        tokenAddr={tokenAddr}
        tokenInfo={tokenInfo}
        curveInfo={curveInfo}
        refresh={refresh}
        setRefresh={setRefresh}
        tradeInfo={tradeInfo}
        otherInfo={otherInfo}
      />
      <TokenSupply />
    </div>
  );
}
