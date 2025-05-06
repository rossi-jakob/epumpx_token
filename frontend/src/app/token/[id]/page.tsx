"use client"
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import TradingView from "@/app/sections/TradingView";

import { useAccount } from "wagmi";
import {
  multicall,
} from "@wagmi/core";

import { formatUnits } from "viem";
import { isValidAddress } from "@/app/utils/util";

import curveABI from "@/abi/curve.json";
import multicallABI from "@/abi/multicall.json";
import erc20ABI from "@/abi/erc20.json";
import Config from "@/app/config/config";
import Spinner from '@/components/ui/spinner';

export default function TokenPage() {

  const params = useParams();

  // const url = document.location.href.split("/");
  // const tokenAddr =
  //   url[url.length - 1].length > 42
  //     ? url[url.length - 1].slice(0, 42)
  //     : url[url.length - 1];

  const tokenAddr = params.id;
  const [refresh, setRefresh] = useState(false);
  const [isLoaded, setLoaded] = useState(false)

  // const {
  //   allCurves,
  //   tradeInfo,
  //   otherInfo,
  // } = useCurveStatus(refresh, tokenAddr as any);

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
  }, [refetch]);

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
        priceInUSDInital: 0,
        epixPrice: 0,
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
          {
            ...addr_abi,
            functionName: "priceInUSDFromFunds",
            args: [0, _tokenAddr],
          } as any,
          {
            ...addr_abi,
            functionName: "getLatestETHPrice",
            args: [],
          } as any
        ],
      });

      const supply = _curveRaw[0].status === "success" ? Number(formatUnits((_curveRaw as any)[0].result[0], 18)) : "0";
      const funds = (_curveRaw as any)[0].status === "success" ? Number(formatUnits((_curveRaw as any)[0].result[1], 18)) : 0;
      const status = (_curveRaw as any)[0].status === "success" ? Number((_curveRaw as any)[0].result[2]) : 0;
      const king = (_curveRaw as any)[0].status === "success" ? (_curveRaw as any)[0].result[3] : "0";
      const creator = (_curveRaw as any)[0].status === "success" ? (_curveRaw as any)[0].result[4] : "";
      const id = (_curveRaw as any)[0].status === "success" ? Number((_curveRaw as any)[0].result[5]) : 0;
      const token = _tokenAddr;
      const totalSupply = (_curveRaw as any)[0].status === "success" ? Number(formatUnits((_curveRaw as any)[0].result[7], 18)) : "0";
      const createdAt = (_curveRaw as any)[0].status === "success" ? Number((_curveRaw as any)[0].result[8]) : 0;
      const name = (_curveRaw as any)[0].status === "success" ? (_curveRaw as any)[0].result[9] : "";
      const symbol = (_curveRaw as any)[0].status === "success" ? (_curveRaw as any)[0].result[10] : "";
      const logo = (_curveRaw as any)[0].status === "success" ? (_curveRaw as any)[0].result[11] : "";
      const description = (_curveRaw as any)[0].status === "success" ? (_curveRaw as any)[0].result[12] : "";
      const twitter = (_curveRaw as any)[0].status === "success" ? (_curveRaw as any)[0].result[13] : "";
      const telegram = (_curveRaw as any)[0].status === "success" ? (_curveRaw as any)[0].result[14] : "";
      const website = (_curveRaw as any)[0].status === "success" ? (_curveRaw as any)[0].result[15] : "";
      const actionAt = (_curveRaw as any)[0].status === "success" ? Number((_curveRaw as any)[0].result[16]) : 0;
      const priceInUSD = (_curveRaw as any)[1].status === "success" ? Number(formatUnits((_curveRaw as any)[1].result, 12)) : 0;
      const mc = (_curveRaw as any)[1].status === "success" ? Number(formatUnits((_curveRaw as any)[1].result, 3)) : 0;
      const hardcapMc = (_curveRaw as any)[2].status === "success" ? Number(formatUnits((_curveRaw as any)[2].result, 3)) : 0;
      const kingcapMc = (_curveRaw as any)[3].status === "success" ? Number(formatUnits((_curveRaw as any)[3].result, 3)) : 0;
      const priceInUSDInital = (_curveRaw[4] as any).status === "success" ? Number(formatUnits((_curveRaw[4] as any).result, 12)) : 0;
      const epixPrice = (_curveRaw[5] as any).status === "success" ? Number(formatUnits((_curveRaw[5] as any).result, 8)) : 0;
      // console.log('_curveInfo: ', supply, funds, status, king, creator, id, token, totalSupply, createdAt, name, symbol, logo, priceInUSD, mc)
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
        priceInUSDInital,
        epixPrice,
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
        priceInUSDInital: 0,
        epixPrice: 0,
        description: "",
        twitter: "",
        telegram: "",
        website: "",
        actionAt: 0,
      };
    }
  }, []);

  useEffect(() => {
    setLoaded(false);
    const fetchData = async (_tokenAddr : any) => {
      const _curveInfo = await getCurveInfo(_tokenAddr);
      setCurveInfo(_curveInfo);
    };
    const getTokenInfo = async (_tokenAddr : any) => {
      _tokenAddr =
        _tokenAddr.length > 42 ? _tokenAddr.slice(0, 42) : _tokenAddr;
      if (
        !_tokenAddr ||
        !isValidAddress(_tokenAddr) ||
        !account.address ||
        !isValidAddress(account.address)
      )
        return;

      let contracts: any[] = [];
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
    getTokenInfo(tokenAddr);
    setLoaded(true);
  }, [tokenAddr, refetch, account.address, getCurveInfo]);

  const [getData, setGetData] = useState({});

  // useEffect(() => {
  //   if (allCurves && allCurves.length > 0) {
  //     const _data = allCurves.find((item) => (item as any).token.toLowerCase() === (tokenAddr as any).toLowerCase());
  //     setGetData(_data as any);
  //   }
  // }, [allCurves, tokenAddr]);

  const router = useRouter();

  if (!getData) {
    router.push("/");
  }

  return (
    <>
      {!isLoaded && <Spinner />}
      <div className="bg-[#282D44] relative component-edge-root">
        <div className="container mx-auto py-24">
          <div>
            {/* <TokenChart /> */}
            <TradingView
              tokenAddr={tokenAddr}
              tokenInfo={tokenInfo}
              curveInfo={curveInfo}
              refresh={refresh}
              setRefresh={setRefresh}
            // tradeInfo={tradeInfo}
            // otherInfo={otherInfo}
            />
          </div>
        </div>
      </div>
    </>

  );
}
