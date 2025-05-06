'use client'
import usePagination from "../../utils/pagination";

import Link from "next/link";
import Config from "../../config/config";
import { spliceAdress } from "../../utils/util";
import { formatEther, formatUnits } from "viem";


export function TokenTrades(props : any) {
  const { tokenAddr, tradeData, curveInfo } = props;

  const PER_PAGE = 10;
  const getTradeData = usePagination(tradeData, PER_PAGE);
  // Sample data for trades
  // const trades = Array.from({ length: 10 }, (_, i) => ({
  //   account: "Hodo AI",
  //   usd: "4.71$",
  //   epix: "0.008",
  //   shohul: "$132,174,021,224",
  //   time: "5 Mins Ago",
  // }));

  return (
    <div className="max-h-[500px] overflow-y-auto table-scroll-container">
      <table className="w-full">
        <thead>
          <tr className="text-white font-bold text-sm border-b border-gray-800">
            <th className="py-3 px-4 text-left">Account</th>
            <th className="py-3 px-4 text-left">USD</th>
            <th className="py-3 px-4 text-left">EPIX</th>
            <th className="py-3 px-4 text-left">Shohul</th>
            <th className="py-3 px-4 text-left">Date</th>
            <th className="py-3 px-4 text-left">TXN</th>
          </tr>
        </thead>
        {/* <tbody>
          {trades.map((trade, index) => (
            <tr key={index} className="">
              <td className="py-3 px-4">
                <div className="flex items-center space-x-2">
                  <img
                    src="/top-token.png"
                    alt="External Link"
                    className="w-6 h-6"
                  />
                  <span className="text-white">{trade.account}</span>
                </div>
              </td>
              <td className="py-3 px-4  text-white">{trade.usd}</td>
              <td className="py-3 px-4  text-white">{trade.bnb}</td>
              <td className="py-3 px-4  text-white">{trade.shohul}</td>
              <td className="py-3 px-4  text-gray-400">{trade.time}</td>
              <td className="py-3 px-4 flex ">
                <img
                  src="/transactions-icon.svg"
                  alt="External Link"
                  className="w-4 h-4"
                />
              </td>
            </tr>
          ))}
        </tbody> */}
        <tbody>
          {tradeData && tradeData.length > 0 ? (
            getTradeData?.currentData()?.map((item : any, i : number) => (
              <tr key={i}>
                <td className="flex gap-1 items-center">
                  <img
                    src="/top-token.png"
                    alt="External Link"
                    className="w-6 h-6"
                  />
                  <Link
                    href={`${Config.SCAN_LINK}/address/${item.trader}`}
                    target="_blank"
                    className="address !text-primary"
                  >
                    {spliceAdress(item.trader)}
                  </Link>
                </td>
                <td>{item.isBuy ? "Buy" : "Sell"}</td>
                <td>
                  {Number(formatEther(item.amount)).toFixed(2)}
                </td>
                <td>
                  {Number(formatEther(item.epix)).toFixed(4)}
                </td>                
                <td>
                  {new Date(
                    item.blockTimestamp * 1000
                  ).toLocaleString()}
                </td>
                <td className="pb-6">
                  <Link
                    href={`${Config.SCAN_LINK}/tx/${item.transactionHash}`}
                    target="_blank"
                    className="address !text-primary"
                  >
                    {spliceAdress(item.transactionHash)}
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <></>
          )}
        </tbody>
      </table>
    </div>
  );
}
