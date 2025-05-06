'use client'
import React from 'react';

import DiscoverTags from "./components/home/discovery";
//import Partners from "./components/home/pratners";
import TopTokens from "./components/home/top-tokens";
import Hero from "./components/home/homepagehero";
import { useCurveStatus } from './components/hooks/useCurveStatus';
import Spinner from '@/components/ui/spinner';

export default function Home() {
  const { allTokenInfoArray } = useCurveStatus(true);

  return (
    <>
      {(!allTokenInfoArray || allTokenInfoArray.length <= 0) && <Spinner />}
      <div>
        <Hero />
        <TopTokens allTokenInfoArray={allTokenInfoArray} />
        <DiscoverTags allTokenInfoArray={allTokenInfoArray} />
        {/* <Partners /> */}
        {/* <ContactSection /> */}
      </div>
    </>
  );
}
