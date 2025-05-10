"use client"
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import TradingView from "@/app/sections/TradingView";
import {ethers} from "ethers"

import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { isValidAddress } from "@/app/utils/util";

import curveABI from "@/abi/curve.json";
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

  const provider = new ethers.JsonRpcProvider(Config.RPC_URL);

  const getCurveInfo = useCallback(async (_tokenAddr: any) => {
    //const signer = await provider.getSigner();
    const curveContract = new ethers.Contract(Config.CURVE, curveABI, provider);

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
      const curveInfo = await curveContract.curveInfo(_tokenAddr);

      const supply = Number(ethers.formatUnits(curveInfo[0], 18));
      const funds = Number(ethers.formatUnits(curveInfo[1], 18));
      const status = Number(curveInfo[2]);
      const king = curveInfo[3];
      const creator = curveInfo[4];
      const id = Number(curveInfo[5]);
      const token = _tokenAddr;
      const totalSupply = Number(ethers.formatUnits(curveInfo[7], 18));
      const createdAt = Number(curveInfo[8]);
      const name = curveInfo[9];
      const symbol = curveInfo[10];
      const logo = curveInfo[11];
      const description = curveInfo[12];
      const twitter = curveInfo[13];
      const telegram = curveInfo[14];
      const website = curveInfo[15];
      const actionAt = Number(curveInfo[16]);

      // 2. Call all the price functions in parallel
      const [
        priceInUSDRaw,
        hardcapPriceInUSDRaw,
        kingcapPriceInUSDRaw,
        priceInUSDFromFundsRaw,
        epixPriceRaw
      ] = await Promise.all([
        curveContract.priceInUSD(_tokenAddr),
        curveContract.hardcapPriceInUSD(_tokenAddr),
        curveContract.kingcapPriceInUSD(_tokenAddr),
        curveContract.priceInUSDFromFunds(0, _tokenAddr),
        curveContract.getLatestETHPrice()
      ]);

      const priceInUSD = Number(ethers.formatUnits(priceInUSDRaw, 12));
      const mc = Number(ethers.formatUnits(priceInUSDRaw, 3));
      const hardcapMc = Number(ethers.formatUnits(hardcapPriceInUSDRaw, 3));
      const kingcapMc = Number(ethers.formatUnits(kingcapPriceInUSDRaw, 3));
      const priceInUSDInital = Number(ethers.formatUnits(priceInUSDFromFundsRaw, 12));
      const epixPrice = Number(ethers.formatUnits(epixPriceRaw, 8));
      console.log('_curveInfo: ', supply, funds, status, king, creator, id, token, totalSupply, createdAt, name, symbol, logo, priceInUSD, mc)
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
    const fetchData = async (_tokenAddr: any) => {
      const _curveInfo = await getCurveInfo(_tokenAddr);
      setCurveInfo(_curveInfo);
    };
    const getTokenInfo = async (_tokenAddr: any) => {
      try {
        // Ensure address is valid and trimmed
        _tokenAddr = _tokenAddr.length > 42 ? _tokenAddr.slice(0, 42) : _tokenAddr;
        const userAddress = account.address;
    
        if (
          !_tokenAddr ||
          !isValidAddress(_tokenAddr) ||
          !userAddress ||
          !isValidAddress(userAddress)
        ) return;
    
        const signer = await provider.getSigner();
        // ERC20 contract instance
        const tokenContract = new ethers.Contract(_tokenAddr, erc20ABI, signer);
    
        // Get token balance (ERC20)
        const rawTokenBalance = await tokenContract.balanceOf(userAddress);
        const tokenBalance = parseFloat(formatUnits(rawTokenBalance, Config.CURVE_DEC));
        const balance = tokenBalance > 0.005 ? (tokenBalance - 0.005).toFixed(2) : "0.00";
    
        // Get native coin balance (Epix/ETH/BNB)
        const rawNativeBalance = await provider.getBalance(userAddress);
        const epixBal = parseFloat(formatUnits(rawNativeBalance, Config.WETH_DEC)).toFixed(4);
    
        // Set the state or return the values
        setTokenInfo({ balance, epixBal });
    
      } catch (error) {
        console.error("getTokenInfo error:", error);
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
