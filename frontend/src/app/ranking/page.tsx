'use client'
import React, { useEffect, useState } from 'react'
import GradientEllipse from "../components/gradient-ellipsis";
import { useCurveStatus } from "../components/hooks/useCurveStatus";
import { RankingTables } from "../components/ranking/ranking-table";
import { TrendingTokens } from "../components/ranking/trading-tokens";
import Spinner from "@/components/ui/spinner";

export default function RankingPage() {

  const [isLoaded, setLoaded] = useState(false)
  const { allTokenInfoArray } = useCurveStatus(true);

  useEffect(() => {
    if (allTokenInfoArray?.length>1)
    {
      setLoaded(true)
    }  
  }, [allTokenInfoArray])

  return (
    <>
      {!isLoaded && <Spinner />}
      <div className=" relative py-12 bg-[#282D44] component-edge-root">
        <GradientEllipse
          position="custom"
          customPosition={{ top: "0", right: "38%" }}
          width="28%"
          height="35%"
          opacity={0.6}
          color="#1E99A299"
          blur="60px"
          zIndex={20}
        />
        <div className="max-w-[1400px] mx-auto mt-10">
          <TrendingTokens allTokenInfoArray={allTokenInfoArray} />
          <h1 className="text-6xl font-bold text-center text-white my-15">
            Ranking
          </h1>
          <RankingTables allTokenInfoArray={allTokenInfoArray} />
        </div>
      </div>
    </>
  );
}
