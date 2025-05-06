"use client"
import React, { useState, useEffect, useRef, useCallback } from "react";
import { MarketCapRanking } from "./market-cap-ranking";
import { AllDayRanking } from "./twetyfour-hour-ranking";
import { useCurveStatus } from "../hooks/useCurveStatus";
import Socket from "@/app/utils/socket"
import { useRouter } from 'next/navigation';

import {
  multicall
} from "@wagmi/core";

type TokenInfo = {
  address: string;
  name: string;
  logo: string;
  marketCap: number;
  volume: number;
}

const resValues = {
  // minutes
  1: 1,
  3: 3,
  5: 5,
  15: 10,
  30: 30,
  // hours
  60: 60,
  120: 120,
  240: 240,
  360: 360,
  720: 720,
  // days
  "1D": 1440,
  "3D": 4320,
  "1W": 10080,
  "1M": 43200
};

let realtime_callback;

export function RankingTables( {allTokenInfoArray} : any ) {
  // Sample data for the tables
  const [refresh, setRefresh] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh(); // Refreshes current route (App Router version)
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  const [mcRankingTokenArray, setMCRankingTokenArray] = useState<any[]>([]);
  const [volRankingTokenArray, setVolRankingTokenArray] = useState<any>();

  useEffect(() => {
    const fetchTokenInfo = () => {
      if (!allTokenInfoArray || allTokenInfoArray.length === 0)
        return;

      try {
        const tmpTokenArray : TokenInfo[] = []; 
        // Add all results to the tmpTokenArray
        tmpTokenArray.push(...allTokenInfoArray);
        tmpTokenArray.sort((a: TokenInfo, b: TokenInfo) => b.marketCap - a.marketCap);

        // Set the state with the collected curve info
        setMCRankingTokenArray(tmpTokenArray);
      } catch (error) {
        console.error("Error fetching token info:", error);
      }
    };

    // Call the function we just defined
    fetchTokenInfo();
    // The dependency array contains allTokens, so this effect runs
    // whenever allTokens changes
  }, [allTokenInfoArray]);

  const listenerAttached = useRef(false); // prevent multiple listeners

  const startSubscription = () => {
    let nthToken = 0;
    const volTokenMap: Map<string, TokenInfo> = new Map();
    // 1. Emit subscriptions
    //const token = mcRankingTokenArray[0];
    mcRankingTokenArray.forEach((token) => {
      const resVal = resValues["1D"];
      Socket.emit("SUBSCRIBE", token?.address, resVal); // note: match server structure
      volTokenMap.set(token?.address, token);
    });

    const entries = Array.from(volTokenMap.entries());
    // 2. Attach listener only once
    if (!listenerAttached.current && !realtime_callback) {
      const handlePriceData = (data : any) => {
        console.log("📈 PRICE_DATA received:", data);

        const newData = {
          time: data.startTimestampSeconds,
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          volume: data.volumeUsd,
        };

        const [key] = entries[nthToken];
        const tokenInfo : TokenInfo | undefined = volTokenMap.get(key);
        if (tokenInfo)
        {
          tokenInfo.volume = data.volumeUsd;
        }
        
        nthToken++;
        console.log("📊 Parsed volume data:", newData);
        // You can call a callback or update state here
      };

      Socket.on("PRICE_DATA", handlePriceData);
      listenerAttached.current = true;
    }

    const sortedEntries = Array.from(volTokenMap.entries()).sort((a, b) => a[1].volume - b[1].volume);

// Recreate the Map from the sorted entries
    const sortedMap = new Map(sortedEntries);
    const slicedRangeMap = new Map([...sortedEntries.entries()].slice(0, 20));
    setVolRankingTokenArray(slicedRangeMap);
  };

  // useEffect to trigger it when the component mounts
  useEffect(() => {
    // if (!Socket.connected) {
    //   Socket.on("connect", startSubscription);
    // } else {
    //   startSubscription();
    // }

    // return () => {
    //   Socket.off("connect", startSubscription);
    //   Socket.off("PRICE_DATA");
    //   listenerAttached.current = false;
    // };
  }, [allTokenInfoArray, resValues, realtime_callback]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <MarketCapRanking tokenInfoArray={mcRankingTokenArray.slice(0, 20)} />
      </div>
      {/* 24 Hours Trading Volume */}
      <div>
        <AllDayRanking volTokenInfoMap={volRankingTokenArray}/>
      </div>
    </div>
  );
}
