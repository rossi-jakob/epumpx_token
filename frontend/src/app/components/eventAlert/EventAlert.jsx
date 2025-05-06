import React from "react";
import Image from "next/image";
import { spliceAdress } from "../../utils/util";
import Config from "../../config/config";
import Link from "next/link";

export default function EventAlert({ tradeInfo, otherInfo }) {
    return (
        <div className="top-links flex gap-4 justify-center items-center flex-col md:flex-row mr-2 mb-2">
            <div className="left">
                {tradeInfo ? tradeInfo?.name === 'Buy' || tradeInfo?.name === 'Sell' ? <div className="token gap-1 text-xl z-10 text-dark relative before:absolute before:top-1.5 before:left-1.5 before:w-full before:h-full before:border before:border-dark before:rounded-md hover:before:opacity-0 before:transition-all before:duration-300">
                    <div className="wrap relative px-3 py-1.5 rounded-md border-1 border-dark bg-[#a1fffc] !text-dark flex gap-1 items-center flex-wrap">
                        {/* <Image
                            className="rounded-full w-[20px] h-[20px]"
                            width={24}
                            height={24}
                            src={data[0].image}
                            alt="iamge"
                        /> */}
                        <Link
                            className="hover:!decoration-primary hover:decoration-1 hover:underline !text-dark"
                            href={`${Config.SCAN_LINK}/address/${tradeInfo.actor}`}
                            target="_blank"
                        >{spliceAdress(tradeInfo.actor)}</Link>
                        {/* bought-sold*/}
                        <Link
                            className="bought-sold !text-dark"
                            href={`${Config.SCAN_LINK}/tx/${tradeInfo.txHash}`}
                            target="_blank"
                        >{tradeInfo.name === 'Buy' ? `bought` : `sold`}</Link>

                        {/* amount */}
                        <span className="amount">{tradeInfo.eth}</span>

                        <span>ETH of </span>
                        {/* token name */}
                        <Link
                            className="name hover:decoration-primary hover:decoration-1 hover:underline"
                            // href={`${Config.SCAN_LINK}/token/${tradeInfo.token}`}
                            href={`${Config.SCAN_LINK}/token/${tradeInfo.token}`}
                            target="_blank"
                        >{tradeInfo?.symbol ? tradeInfo?.symbol : '---'}</Link>

                        {/* <Image
                            className="rounded-full w-[20px] h-[20px]"
                            width={24}
                            height={24}
                            src={`${Config.API_URL}/logos/${tradeInfo.logo}`}
                            alt='token'
                        /> */}
                    </div>
                </div> : <></> : <></>}
            </div>
            <div className="right">
                {otherInfo ? otherInfo?.name === 'CurveCreated' ||
                    otherInfo?.name === 'CurveCompleted' ||
                    otherInfo?.name === 'CurveLaunched' ||
                    otherInfo?.name === 'KingOfTheHill' ?
                    <div className="token gap-1 text-xl z-10 !text-dark relative before:absolute before:top-1.5 before:left-1.5 before:w-full before:h-full before:border before:border-dark before:rounded-md hover:before:opacity-0 before:transition-all before:duration-300">
                        {otherInfo?.name === 'CurveCreated' ? <div className="wrap relative px-3 py-1.5 rounded-md border-1 border-dark !bg-[#ffa1d8] flex gap-1 items-center flex-wrap">
                            {/* <Image
                            className="rounded-full w-[20px] h-[20px]"
                            width={24}
                            height={24}
                            src={data[0].image}
                            alt="iamge"
                        /> */}
                            <Link
                                className="hover:decoration-primary hover:decoration-1 hover:underline !text-dark"
                                href={`${Config.SCAN_LINK}/address/${otherInfo.actor}`}
                                target="_blank"
                            >{spliceAdress(otherInfo.actor)}</Link>
                            <Link
                                className="!text-dark"
                                href={`${Config.SCAN_LINK}/token/${otherInfo.token}`}
                                target="_blank"
                            >{` created ${otherInfo?.symbol ? otherInfo?.symbol : '---'} `}</Link>

                            {/* token image */}
                            {/* <Image
                                className="rounded-full w-[20px] h-[20px]"
                                width={24}
                                height={24}
                                src={`${Config.API_URL}/logos/${otherInfo.logo}`}
                                alt="token"
                            /> */}

                            {/* date */}
                            <span className="date">{` at ${otherInfo?.timestamp ? otherInfo?.timestamp : '---'}`}</span>
                        </div> : otherInfo?.name === 'CurveCompleted' ? <div className="wrap relative px-3 py-1.5 rounded-md border-1 border-dark !bg-[#ffa1d8] flex gap-1 items-center flex-wrap">
                            <Link
                                href={`${Config.SCAN_LINK}/token/${otherInfo.token}`}
                                target="_blank"
                            >{`${otherInfo?.symbol ? otherInfo?.symbol : '---'}`}</Link>

                            {/* token image */}
                            {/* <Image
                                className="rounded-full w-[20px] h-[20px]"
                                width={24}
                                height={24}
                                src={`${Config.API_URL}/logos/${otherInfo.logo}`}
                                alt="token"
                            /> */}

                            <Link
                                className="bought-sold"
                                href={`${Config.SCAN_LINK}/tx/${tradeInfo.txHash}`}
                                target="_blank"
                            >{` reached 100% of Curve at `}</Link>

                            {/* date */}
                            <span className="date">{`${otherInfo?.timestamp ? otherInfo?.timestamp : '---'}`}</span>
                        </div> : otherInfo?.name === 'CurveLaunched' ? <div className="wrap relative px-3 py-1.5 rounded-md border-1 border-dark !bg-[#ffa1d8] flex gap-1 items-center flex-wrap">
                            <Link
                                href={`${Config.SCAN_LINK}/token/${otherInfo.token}`}
                                target="_blank"
                            >{`${otherInfo?.symbol ? otherInfo?.symbol : '---'}`}</Link>

                            {/* token image */}
                            {/* <Image
                                className="rounded-full w-[20px] h-[20px]"
                                width={24}
                                height={24}
                                src={`${Config.API_URL}/logos/${otherInfo.logo}`}
                                alt="token"
                            /> */}

                            <Link
                                className="bought-sold"
                                href={`${Config.SCAN_LINK}/tx/${tradeInfo.txHash}`}
                                target="_blank"
                            >{` launched into Uniswap at `}</Link>

                            {/* date */}
                            <span className="date">{`${otherInfo?.timestamp ? otherInfo?.timestamp : '---'}`}</span>
                        </div> : otherInfo?.name === 'KingOfTheHill' ? <div className="wrap relative px-3 py-1.5 rounded-md border-1 border-dark !bg-[#ffa1d8] flex gap-1 items-center flex-wrap">
                            <Link
                                href={`${Config.SCAN_LINK}/token/${otherInfo.token}`}
                                target="_blank"
                            >{`${otherInfo?.symbol ? otherInfo?.symbol : '---'}`}</Link>

                            {/* token image */}
                            {/* <Image
                                className="rounded-full w-[20px] h-[20px]"
                                width={24}
                                height={24}
                                src={`${Config.API_URL}/logos/${otherInfo.logo}`}
                                alt="token"
                            /> */}

                            <Link
                                className="bought-sold"
                                href={`${Config.SCAN_LINK}/tx/${tradeInfo.txHash}`}
                                target="_blank"
                            >{` became KingOfTheHill at `}</Link>

                            {/* date */}
                            <span className="date">{`${otherInfo?.timestamp ? otherInfo?.timestamp : '---'}`}</span>
                        </div> : <></>}
                    </div> : <></> : <></>}
            </div>
        </div>
    );
}
