"use client";
import {
  createChart,
  IChartApi,
  ColorType,
  CrosshairMode,
  ISeriesApi,
  CandlestickData,
  CandlestickSeries,
} from "lightweight-charts";
import { useEffect, useRef } from "react";

const initialData: CandlestickData[] = [
  {
    time: "2024-03-19",
    open: 0.0161655,
    high: 0.016186,
    low: 0.0155657,
    close: 0.0155657,
  },
  {
    time: "2024-03-20",
    open: 0.0155657,
    high: 0.0161,
    low: 0.0155,
    close: 0.0156598,
  },
  {
    time: "2024-03-21",
    open: 0.0156598,
    high: 0.0156598,
    low: 0.0155,
    close: 0.0155,
  },
  {
    time: "2024-03-22",
    open: 0.0155,
    high: 0.0155,
    low: 0.0155,
    close: 0.0155,
  },
  {
    time: "2024-03-23",
    open: 0.0155,
    high: 0.0155,
    low: 0.0155,
    close: 0.0155,
  },
  {
    time: "2024-03-24",
    open: 0.0155,
    high: 0.0155,
    low: 0.0155,
    close: 0.0155,
  },
  {
    time: "2024-03-25",
    open: 0.0155,
    high: 0.0155,
    low: 0.0155,
    close: 0.0155,
  },
  {
    time: "2024-03-26",
    open: 0.0155,
    high: 0.0155,
    low: 0.0155,
    close: 0.0155,
  },
  {
    time: "2024-03-27",
    open: 0.0155,
    high: 0.0155,
    low: 0.0155,
    close: 0.0155,
  },
  {
    time: "2024-03-28",
    open: 0.0155,
    high: 0.0155,
    low: 0.0155,
    close: 0.0155,
  },
  {
    time: "2024-03-29",
    open: 0.0155,
    high: 0.0155,
    low: 0.0155,
    close: 0.0155,
  },
  {
    time: "2024-03-30",
    open: 0.0155,
    high: 0.0155,
    low: 0.0155,
    close: 0.0155,
  },
];

export function TradingChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#1B2028" },
        textColor: "#DDD",
      },
      grid: {
        vertLines: { color: "#2B2B43" },
        horzLines: { color: "#2B2B43" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "#555",
          width: 1,
          style: 3,
          labelBackgroundColor: "#2B2B43",
        },
        horzLine: {
          color: "#555",
          width: 1,
          style: 3,
          labelBackgroundColor: "#2B2B43",
        },
      },
      rightPriceScale: {
        borderColor: "#2B2B43",
        textColor: "#DDD",
      },
      timeScale: {
        borderColor: "#2B2B43",
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000);
          return date.toLocaleTimeString("en-US", { hour12: false });
        },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#4BAC4B",
      borderUpColor: "#4BAC4B",
      wickUpColor: "#4BAC4B",
      downColor: "#FF4F4F",
    });

    series.setData(initialData);
    chartRef.current = chart;
    seriesRef.current = series;

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);

  return (
    <div className="w-full h-[500px] relative">
      <div ref={chartContainerRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 bg-[#1B2028]/80 p-2 rounded text-sm space-y-1">
        <div className="text-gray-400">
          O:{" "}
          <span className="text-white">{initialData[0].open.toFixed(7)}</span>
        </div>
        <div className="text-gray-400">
          H:{" "}
          <span className="text-white">{initialData[0].high.toFixed(7)}</span>
        </div>
        <div className="text-gray-400">
          L: <span className="text-white">{initialData[0].low.toFixed(7)}</span>
        </div>
        <div className="text-gray-400">
          C:{" "}
          <span className="text-white">{initialData[0].close.toFixed(7)}</span>
        </div>
      </div>
    </div>
  );
}
