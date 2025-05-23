/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import Datafeed from './datafeed';

const TIMEZONE = {
  '-10': ['Pacific/Honolulu'],
  '-8': ['America/Anchorage', 'America/Juneau'],
  '-7': ['America/Los_Angeles', 'America/Phoenix', 'America/Vancouver'],
  '-6': ['America/Mexico_City'],
  '-5': ['America/Bogota', 'America/Chicago', 'America/Lima'],
  '-4': ['America/Caracas', 'America/New_York', 'America/Santiago', 'America/Toronto'],
  '-3': ['America/Argentina/Buenos_Aires', 'America/Sao_Paulo'],
  0: ['Atlantic/Reykjavik'],
  1: ['Africa/Casablanca', 'Africa/Lagos', 'Europe/London'],
  2: [
    'Europe/Belgrade',
    'Europe/Berlin',
    'Europe/Bratislava',
    'Europe/Brussels',
    'Europe/Budapest',
    'Europe/Copenhagen',
    'Africa/Johannesburg',
    'Europe/Luxembourg',
    'Europe/Madrid',
    'Europe/Oslo',
    'Europe/Paris',
    'Europe/Rome',
    'Europe/Stockholm',
    'Europe/Warsaw',
    'Europe/Zurich',
  ],
  3: [
    'Asia/Bahrain',
    'Europe/Athens',
    'Europe/Bucharest',
    'Africa/Cairo',
    'Europe/Helsinki',
    'Europe/Istanbul',
    'Asia/Jerusalem',
    'Asia/Kuwait',
    'Europe/Moscow',
    'Asia/Nicosia',
    'Asia/Qatar',
    'Europe/Riga',
  ],
  4: ['Asia/Dubai'],
  5: ['Asia/Karachi'],
  6: ['Asia/Almaty'],
  6.5: ['Asia/Yangon'],
  7: ['Asia/Bangkok'],
  8: ['Asia/Chongqing'],
  9: ['Asia/Tokyo'],
  9.5: ['Australia/Adelaide'],
  10: ['Australia/Brisbane'],
  11: ['Pacific/Norfolk'],
  12.75: ['Pacific/Chatham'],
};

const Chart = (props) => {
  const { stoke, interval, tokenId, symbol } = props;
  const offset = (-1 * new Date().getTimezoneOffset()) / 60;

  useEffect(() => {
    const initChart = () => {
      if (
        typeof window !== 'undefined' &&
        typeof TradingView !== 'undefined' &&
        symbol &&
        interval
      ) {
        // eslint-disable-next-line no-undef
        const widget = (window.tvWidget = new TradingView.widget({
          symbol: symbol,
          interval: interval,
          fullscreen: false,
          width: "100%",
          height: "100%",
          borderRadius: "10px",
          container_id: 'tv_chart_container',
          datafeed: Datafeed(tokenId),
          library_path: '/charting_library/',
          toolbar_bg: '#0b1217',
          overrides: {
            'paneProperties.rightMargin': 0,
            'paneProperties.background': '#0b1217',
            'paneProperties.backgroundType': 'gradient',
            'paneProperties.backgroundGradientEndColor': '#0b1217',
            'paneProperties.backgroundGradientStartColor': '#0b1217',
            'paneProperties.vertGridProperties.color': '#E3E3E5', // Grid Vertical Lines Color
            'paneProperties.horzGridProperties.color': '#E3E3E5', // Grid Horizontal Lines Color
            'mainSeriesProperties.candleStyle.upColor': '#11CC9A', // Up Candle Color
            'mainSeriesProperties.candleStyle.downColor': '#E20E7C', // Down Candle Color
            'mainSeriesProperties.candleStyle.borderUpColor': '#11CC9A', // Up Candle Border Color
            'mainSeriesProperties.candleStyle.borderDownColor': '#E20E7C', // Down Candle Border Color
            'mainSeriesProperties.candleStyle.drawBorder': false, // Disable candle borders
            'mainSeriesProperties.minTick': '100000000,1,false',
            "scalesProperties.textSize": 18,
            "scalesProperties.showLeftScale": false,
          },
          loading_screen: {
            backgroundColor: "#0b1217",
          },
          disabled_features: ['header_symbol_search'],
          time_frames: [],
          theme: 'Dark',
          // timezone: TIMEZONE[offset][0],
        }));

        widget.onChartReady(async () => {
          widget.activeChart().setTimezone('UTC');
        });
      }
    }

    if (typeof window !== 'undefined') {
      if (typeof TradingView === 'undefined') {
        const script = document.createElement('script');
        script.src = '/charting_library/charting_library.js';
        script.onload = initChart;
        document.head.appendChild(script);
      } else {
        initChart();
      }
    }
  }, [symbol, interval]);
  return (
    <div id="tv_chart_container" className='h-130 !rounded-md' />
  );
};

export default Chart;