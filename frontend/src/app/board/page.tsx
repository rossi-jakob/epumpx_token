'use client'
import React, { useEffect, useState } from 'react'
import DiscoverTags from "../components/home/discovery"
import { useCurveStatus } from "../components/hooks/useCurveStatus"
import Spinner from '@/components/ui/spinner'

export default function RankingPage() {
  const [loading, setLoading] = useState(true)

  const { allTokenInfoArray } = useCurveStatus(false)

  // When allTokenInfoArray is ready, stop loading
  useEffect(() => {
    if (allTokenInfoArray && allTokenInfoArray.length > 0) {
      setLoading(false)
    }
  }, [allTokenInfoArray])

  return (
    <> 
      <div className="relative py-12 bg-[#020300]">
        <DiscoverTags allTokenInfoArray={allTokenInfoArray} />
      </div>
    </>
  )
}