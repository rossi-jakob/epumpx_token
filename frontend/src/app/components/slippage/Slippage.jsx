import React from "react";
import { BsXLg } from "react-icons/bs";
//import Image from "next/image";
//import logo from "@assets/images/logo.png";
import { toast } from "react-toastify";
import { toastConfig } from "../../utils/util";

function Slippage({ slippage, setSlippage, frontRunning, setFrontRunning, openSlippageModal, setOpenSlippageModal, deadline, setDeadline }) {
    /* slippage */
    return (
        <div
            className={`slippage-popup fixed inset-0 z-[9999] flex justify-center items-center transition-all duration-300 mx-4 md:mx-0 ${openSlippageModal ? "opacity-100 visible" : "invisible opacity-0"
                }`}
        >
            <div
                onClick={() => setOpenSlippageModal(false)}
                className="bg-absolute fixed inset-0 !bg-dark/50 h-full w-full"
            ></div>
            <div className="content relative bg-white max-w-[30rem] w-full m-auto text-black p-4 rounded-md grid gap-3 text-center overflow-auto max-h-[90vh]">
                <div className="slippage percent grid">
                    <h4>Set max. slippage (%)</h4>

                    <div className="flex gap-2">
                        <input
                            id="name"
                            type="number"
                            className="max-h-[35px] pl-2 pr-1 py-2 bg-transparent rounded-md outline-none border-2 border-dark focus:!border-primary max-w-[25rem] w-full mx-auto mb-1 text-end"
                            value={slippage}
                            onChange={(e) => {
                                const numVal = Number(e.target.value)
                                if (numVal >= 0) {
                                    if (numVal > 49) {
                                        toast.warn('Slippage Limit is 49%', toastConfig)
                                        setSlippage('49')
                                    } else {
                                        setSlippage(e.target.value)
                                    }
                                }
                            }}
                        />
                        <div className="!leading-none text-[32px]">%</div>
                    </div>

                    <span>
                        This is the maximum percent of slippage you are willing to accept
                        when placing trades
                    </span>
                </div>

                {/* front running */}
                {false ? <div className="front-running grid text-xl">
                    <h4 className="!mb-1">Enable front-running protection:</h4>
                    <div className="on-off flex justify-center gap-0.5">
                        <div
                            onClick={() => setFrontRunning(true)}
                            className={`on py-1 w-[3rem] cursor-pointer rounded-md transition-all duration-300 ${frontRunning && "!bg-primary !text-white"
                                } `}
                        >
                            ON
                        </div>
                        <div
                            onClick={() => setFrontRunning(false)}
                            className={`off py-1 w-[3rem] cursor-pointer rounded-md transition-all duration-300 ${!frontRunning && "!bg-primary !text-white"
                                } `}
                        >
                            OFF
                        </div>
                    </div>

                    {frontRunning && (
                        <span className="!text-primary">
                            Front-running protection stops bots from front-running your
                            buys. You can use high slippage with front-running protection
                            turned on. We recommend setting a priority fee of at least 0.01
                            SOL with front-running protection enabled.
                        </span>
                    )}
                </div> : <></>}

                {/* input coin amout */}
                <h4 className="!mb-1 mt-4">{`Deadline (Mins)`}</h4>
                <div className="coin-amount relative mb-4">
                    <input
                        id="name"
                        type="number"
                        className="pl-2 pr-[2.8rem] py-2 bg-transparent rounded-md outline-none border-2 border-dark focus:!border-primary w-full text-end"
                        value={deadline}
                        onChange={(e) => {
                            const numVal = Number(e.target.value)
                            if (numVal >= 0) {
                                setDeadline('49')
                                if (numVal <= 1) {
                                    toast.warn('Deadline should be greater than 1 Min', toastConfig)
                                    setDeadline('2')
                                } else {
                                    setDeadline(e.target.value)
                                }
                            }
                        }}
                    />

                    {/* coin */}
                    <div className="coin absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2 items-center justify-center bg-white">
                        <div className="!text-black">MINs</div>
                        {/* <Image width={24} height={24} src={logo} alt="coin" /> */}
                    </div>
                </div>
                {false ? <span>
                    A higher priority fee will make your transactions confirm faster.
                    This is the transaction fee that you pay to the solana network on
                    each trade.
                </span> : <></>}

                {/* close */}
                <div
                    onClick={() => setOpenSlippageModal(false)}
                    className="close cursor-pointer absolute right-3 top-3 text-xl"
                >
                    <BsXLg />
                </div>
            </div>
        </div >
    );
}

export default Slippage;
