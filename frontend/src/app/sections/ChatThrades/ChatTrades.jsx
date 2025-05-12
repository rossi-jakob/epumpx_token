import { useEffect, useState, useRef } from "react";
import { useAccount } from "wagmi";
import Image from "next/image";

import usePagination from "../../utils/pagination";

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
// import { createTheme } from "@mui/material/styles";

import { BsGlobe2 } from "react-icons/bs";
import { FaTelegramPlane, FaSpinner } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaCopy } from "react-icons/fa";
import EasingY from "src/animations/EasingY";

import { toast } from "react-toastify";

import baseLogo from "@assets/images/base.svg";

import Socket from "src/utils/socket";
import axios from "src/utils/axios";
import { copyAddress, spliceAdress, timeAgo } from "src/utils/util";
import Config from "src/settings/config";
import { formatEther, formatUnits } from "viem";
import Link from "next/link";
import { toastConfig } from "src/utils/util";

export default function ChatTrades({
  tokenAddr,
  curveInfo,
  tradeData,
  holderData,
}) {
  const account = useAccount();

  const [chatTrade, setChatTrade] = useState("chat");
  const [chatPopup, setChatPopup] = useState(false);

  const [comment, setComment] = useState("");
  const [image, setImage] = useState();
  const [file, setFile] = useState(null);
  const [pending, setPending] = useState(false);
  let [chatPage, setChatPage] = useState(1);
  let [tradePage, setTradePage] = useState(1);

  // pagination
  const PER_PAGE = 10;

  const fileRef = useRef();

  const imageChange = (event) => {
    const file = event.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFile(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const [allChats, setAllChats] = useState([]);

  const postComment = async () => {
    if (pending) return;
    if (!account.isConnected) {
      toast.warn("Please connect your wallet!", toastConfig);
      return;
    }
    if (comment.trim().length < 1) {
      toast.warn("Please enter a comment!", toastConfig);
      return;
    }
    if (Socket) {
      let filePath = null;
      if (file && image) {
        setPending(true);
        const formData = new FormData();
        formData.append("image", image);
        const { data: response } = await axios.post(
          "/api/misc/upload_image",
          formData,
          {
            headers: {
              Accept: "*/**",
              "Content-Type": "multipart/form-data",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers":
                "Access-Control-Allow-Headers, Content-Type, Authorization",
              "Access-Control-Allow-Methods": "*",
              "Cross-Origin-Resource-Policy": "*",
              timeout: 1000,
            },
          }
        );
        filePath = response.data;
      }
      Socket.emit(
        "NEW_COMMENT",
        account.address,
        tokenAddr,
        comment,
        filePath,
        Date.now()
      );
      setPending(false);
      setChatPopup(false);
      setComment("");
      fileRef.current.value = "";
      setImage(null);
      setFile(null);
      toast.success("Successfully posted!", toastConfig);
    }
  };

  useEffect(() => {
    const connect = () => {
      if (!account.isConnected) return;
      Socket.emit("CONNECTED", account.address, tokenAddr);
    };
    const AllChats = (_allchats) => {
      // console.log("all chats", _allchats)
      setAllChats(_allchats);
    };

    Socket.connect();
    if (tokenAddr && Socket) {
      Socket.emit("GET_ALL_CHATS", tokenAddr);
      Socket.emit("JOIN", tokenAddr);
    }

    Socket.on("connect", connect);
    Socket.on("ALL_CHATS", AllChats);

    return () => {
      Socket.off("connect", connect);
      Socket.off("ALL_CHATS", AllChats);
      Socket.disconnect();
    };
  }, [account.isConnected, account.address, tokenAddr]);

  // chat data
  const chatCount = Math.ceil(allChats?.length / PER_PAGE);
  const chatData = usePagination(allChats, PER_PAGE);
  // trade data
  const tradeCount = Math.ceil(tradeData?.length / PER_PAGE);
  const getTradeData = usePagination(tradeData, PER_PAGE);

  // console.log(tradeCount);

  const handleChatChange = (e, p) => {
    setChatPage(p);
    chatData.jump(p);
  };
  const handleTradeChange = (e, p) => {
    setTradePage(p);
    getTradeData.jump(p);
  };

  // const darkTheme = createTheme({
  //   palette: {
  //     mode: "dark",
  //   },
  // });

  return (
    <section className="chat-trades mt-10 leading-none overflow-hidden">
      <div className="container">
        <div className="wrapper flex flex-col md:grid gap-8 grid-cols-9">
          <EasingY cls="col-span-6" value={-20} delay={0.1}>
            <div className="left">
              <div className="btns flex justify-center md:justify-start tex-xl">
                <button
                  onClick={() => setChatTrade("chat")}
                  className={`${
                    chatTrade === "chat" ? "!bg-primary !text-white" : ""
                  } px-3 py-1.5 rounded-md transition-all duration-300`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setChatTrade("trade")}
                  className={`${
                    chatTrade === "trade" ? "!bg-primary !text-white" : ""
                  } px-3 py-1.5 rounded-md transition-all duration-300`}
                >
                  Trade
                </button>
              </div>
              <div className="wrap mt-4 overflow-hidden">
                {/* chat */}
                <div
                  className={`${
                    chatTrade === "chat" ? "block" : "!hidden opacity-0"
                  }} transition-all duration-300 grid gap-2.5`}
                >
                  {allChats && allChats.length > 0 ? (
                    chatData.currentData()?.map((item, i) => (
                      <div
                        key={i}
                        className="chat border-1 border-dark rounded-lg p-2.5"
                      >
                        <div className="top flex gap-2.5 items-center">
                          {false ? (
                            <div className="image rounded-full overflow-hidden">
                              <Image
                                width={24}
                                height={24}
                                src={item?.image}
                                alt="chat image"
                              />
                            </div>
                          ) : (
                            <></>
                          )}
                          <a
                            href={`${Config.SCAN_LINK}/address/${item.address}`}
                            className="address !text-primary "
                          >
                            {spliceAdress(item.address)}
                          </a>
                          <div className="date">
                            {item.timestamp && item.timestamp > 0
                              ? timeAgo(item.timestamp)
                              : "unknown time"}
                          </div>
                        </div>

                        <div className="bottom mt-2 flex flex-row gap-2">
                          {item.filePath && (
                            <Image
                              width={100}
                              height={100}
                              className="max-w-[5.5] max-h-[5.5rem] rounded-lg"
                              src={`${Config.API_URL}/logos/${item.filePath}`}
                              alt="logo"
                            />
                          )}
                          <div className="message !text-white">
                            {item.comment}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <></>
                  )}

                  {/* pagination */}
                  <div className="pagination mt-3 mb-2 flex justify-center">
                    <Stack spacing={2}>
                      <Pagination
                        count={chatCount}
                        page={chatPage}
                        defaultPage={6}
                        shape="rounded"
                        variant="outlined"
                        color="secondary"
                        onChange={handleChatChange}
                      />
                    </Stack>
                  </div>
                  {/* add chat */}
                  <div className="add chat flex justify-center">
                    <div
                      onClick={() => setChatPopup(true)}
                      className="!bg-primary mt-2 !text-white px-4 py-2 border-transparent border-1 border-dashed hover:border-dark cursor-pointer hover:!bg-transparent hover:!text-dark transition-all duration-300"
                    >
                      post a reply
                    </div>
                  </div>
                </div>

                {/* new comment */}
                <div
                  className={`post-popup fixed inset-0 z-[9999] flex justify-center items-center transition-all duration-300 mx-4 md:mx-0 ${
                    chatPopup ? "opacity-100 visible" : "invisible opacity-0"
                  }`}
                >
                  <div
                    onClick={() => setChatPopup(false)}
                    className="bg-absolute fixed inset-0 !bg-dark/50 h-full w-full"
                  ></div>
                  <div className="content relative bg-white max-w-[35rem] w-full m-auto text-black p-4 rounded-md space-y-5">
                    <div className="add-comment flex flex-col">
                      <label htmlFor="comment-box ">Add a comment</label>
                      {/* text */}
                      <textarea
                        id="comment-box"
                        name="comment-box"
                        rows="4"
                        placeholder="Write a comment"
                        className="border-1 border-dark mt-2 p-2 !text-black rounded-md"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      ></textarea>
                    </div>

                    {/* choice image */}
                    {
                      <div className="choice-image">
                        <div className="mb-2">Image (optional)</div>
                        <label htmlFor="file-input-medium" className="sr-only">
                          Choose image
                        </label>
                        <input
                          type="file"
                          name="file-input-medium"
                          accept="image/png, image/gif, image/jpeg"
                          id="file-input-medium"
                          className="block w-full border-dark shadow-sm rounded-sm text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 file:bg-primary !text-dark border-2 border-dashed text-whti file:border-0 file:me-4 file:py-3
                      file:px-4 file:!text-white"
                          onChange={imageChange}
                          ref={fileRef}
                        />
                      </div>
                    }

                    {/* post button */}
                    <div className="wrap flex justify-center items-center flex-col gap-4">
                      <div
                        onClick={() => postComment()}
                        className="post-btn px-3 py-2 rounded-md !bg-primary hover:!bg-transparent border-1 border-transparent hover:border-dark transition-all duration-300 !text-white hover:!text-dark cursor-pointer"
                      >
                        {pending ? "Uploading..." : "Post a reply"}
                      </div>

                      {/* cancel popup*/}
                      <div
                        onClick={() => setChatPopup(false)}
                        className="cancel cursor-pointer !text-dark hover:!text-primary"
                      >
                        Cancel
                      </div>
                    </div>
                  </div>
                </div>

                {/* trade */}

                <div
                  className={`${
                    chatTrade === "trade" ? "block" : "!hidden opacity-0"
                  }} transition-all duration-300 overflow-auto`}
                >
                  <div className="wrap w-[700px]">
                    <table className="table-auto whitespace-nowrap">
                      <thead>
                        <tr>
                          <th key="Trader">Trader</th>
                          <th key="Type">Type</th>
                          <th key="ETH">ETH</th>
                          <th key="Token">Token</th>
                          <th key="Time">Time</th>
                          <th key="Tx">Tx</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tradeData && tradeData.length > 0 ? (
                          getTradeData?.currentData()?.map((item, i) => (
                            <tr key={i}>
                              <td className="flex gap-1 items-center">
                                {/* <div className="image rounded-full overflow-hidden">
                              <Image
                                width={24}
                                height={24}
                                src={item?.image}
                                alt="chat image"
                              />
                            </div> */}
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
                                {Number(formatEther(item.eth)).toFixed(4)}
                              </td>
                              <td>
                                {Number(formatEther(item.amount)).toFixed(2)}
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

                    {/* pagination */}
                    <div className="pagination mt-3 mb-2 flex justify-center">
                      <Stack spacing={2}>
                        <Pagination
                          count={tradeCount}
                          defaultPage={6}
                          page={tradePage}
                          shape="rounded"
                          variant="outlined"
                          color="secondary"
                          onChange={handleTradeChange}
                        />
                      </Stack>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </EasingY>

          {/* right */}
          <EasingY cls="col-span-3" value={-20} delay={0.2}>
            <div className="right space-y-5 text-lg  mt-10 sm:mt-0">
              {/* top */}
              {/* <Tradechat /> */}

              {/* information */}
              <div className="information flex flex-col gap-3">
                <div className="left flex justify-center items-center gap-2">
                  <Image
                    className="rounded-lg"
                    height={120}
                    width={120}
                    src={`${Config.API_URL}/logos/${curveInfo.logo}`}
                    alt="img"
                  />
                </div>

                <div className="right w-full text-lg">
                  <div className="top flex gap-1.5 justify-between items-center">
                    <div className="name text-xl text-dark">{`${
                      curveInfo?.symbol ? curveInfo?.symbol : "---"
                    } (${curveInfo ? curveInfo.name : "---"})`}</div>

                    {/* links */}
                    <div className="links flex gap-2.5">
                      {curveInfo?.website && curveInfo?.website.length > 0 ? (
                        <a
                          href={curveInfo?.website}
                          className="website text-base hover:text-secondary transition-all duration-300"
                          target="_blank"
                        >
                          <BsGlobe2 />
                        </a>
                      ) : (
                        <></>
                      )}
                      {curveInfo?.telegram && curveInfo?.telegram.length > 0 ? (
                        <a
                          href={curveInfo?.telegram}
                          className="telegram text-base hover:text-secondary transition-all duration-300"
                          target="_blank"
                        >
                          <FaTelegramPlane />
                        </a>
                      ) : (
                        <></>
                      )}
                      {curveInfo?.twitter && curveInfo?.twitter.length > 0 ? (
                        <a
                          href={curveInfo?.twitter}
                          className="twitter text-base hover:text-secondary transition-all duration-300"
                          target="_blank"
                        >
                          <FaXTwitter />
                        </a>
                      ) : (
                        <></>
                      )}
                    </div>

                    {/* chain */}
                    <div className="chain">
                      <Image width={20} height={20} src={baseLogo} alt="base" />
                    </div>
                  </div>

                  {/* middle */}
                  <div className="middle mt-4 flex sm:justify-end">
                    {/* <div className="name-image flex gap-1.5 items-center">
                      <div className="name">({name})</div>
                    <Image
                      className="rounded-full h-4 w-4"
                      width={20}
                      height={20}
                      src={image}
                      alt="image"
                    />
                    </div> */}

                    {/* address */}
                    <div className="address flex items-center gap-2">
                      <span>{spliceAdress(tokenAddr)}</span>
                      <FaCopy
                        className="copy text-sm cursor-pointer hover:text-primary transition-all duration-300"
                        onClick={() => copyAddress(tokenAddr)}
                      />
                    </div>
                  </div>

                  {/* bottom */}
                  <div className="bottom ">
                    <p className="!leading-none mt-2">
                      {curveInfo?.description ? curveInfo?.description : ""}
                    </p>
                  </div>

                  <div className="wrap space-y-4">
                    {/* bonding curve progress */}
                    <div className="bonding-progress space-y-2">
                      <h3 className="leading-0 text-xl m-0">
                        {`bonding curve progress: ${
                          curveInfo?.funds >= 0
                            ? curveInfo.funds > Config.CURVE_HARDCAP
                              ? 100
                              : (
                                  (curveInfo.funds * 100) /
                                  Config.CURVE_HARDCAP
                                ).toFixed(2)
                            : 0
                        }%`}
                      </h3>

                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="!bg-primary h-2.5 rounded-full"
                          style={{
                            width: `${
                              curveInfo?.funds >= 0
                                ? curveInfo.funds > Config.CURVE_HARDCAP
                                  ? 100
                                  : (
                                      (curveInfo.funds * 100) /
                                      Config.CURVE_HARDCAP
                                    ).toFixed(2)
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    {/* curve status */}
                    <span className="!text-yellow-600 flex justify-start gap-2 items-center">
                      {Number(curveInfo?.status) === 1 ? (
                        `Please wait for a moment. Launching... `
                      ) : Number(curveInfo?.status) === 2 ? (
                        <a
                          className="text-yellow-600 hover:text-white-400"
                          href={`https://app.uniswap.org/swap?inputCurrency=ETH&outputCurrency=${curveInfo?.token}&chain=base`}
                          target="_blank"
                        >
                          {`Launched Successfully ${
                            curveInfo?.actionAt
                              ? `at ${new Date(
                                  Number(curveInfo.actionAt) * 1000
                                ).toLocaleString("en-GB", { timeZone: "UTC" })}`
                              : ""
                          }. Trade on Uniswap.`}
                        </a>
                      ) : (
                        ""
                      )}
                      {Number(curveInfo?.status) === 1 ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <></>
                      )}
                    </span>

                    {/* text */}
                    <div className="text grid gap-3">
                      <p className="leading-none m-0">
                        {`when the market cap reaches $${
                          curveInfo?.hardcapMC ? curveInfo?.hardcapMC.toFixed(2) : 0
                        } all the liquidity from
                      the bonding curve will be deposited into Uniswap and
                      burned. progression increases as the price goes up.`}
                      </p>
                      <p className="leading-none m-0">
                        {`there are ${
                          curveInfo?.supply && curveInfo?.totalSupply
                            ? (
                                Number(
                                  formatUnits(
                                    curveInfo?.totalSupply,
                                    Config.CURVE_DEC
                                  )
                                ) *
                                  0.75 -
                                Number(
                                  formatUnits(
                                    curveInfo?.supply,
                                    Config.CURVE_DEC
                                  )
                                )
                              ).toFixed(1)
                            : 0
                        } ${
                          curveInfo?.symbol ? curveInfo?.symbol : `token`
                        }s still available for sale in
                      the bonding curve and there is ${
                        curveInfo?.funds >= 0 ? curveInfo.funds.toFixed(3) : 0
                      } ETH in the bonding
                      curve.`}
                      </p>
                    </div>

                    {/* bonding curve progress */}
                    <div className="bonding-progress space-y-2">
                      <h3 className="leading-0 text-xl m-0">
                        {`king of the hill progress: ${
                          curveInfo?.funds >= 0
                            ? curveInfo.funds > Config.CURVE_KINGCAP
                              ? 100
                              : (
                                  (curveInfo.funds * 100) /
                                  Config.CURVE_KINGCAP
                                ).toFixed(2)
                            : 0
                        }%`}
                      </h3>

                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="!bg-cyan h-2.5 rounded-full"
                          style={{
                            width: `${
                              curveInfo?.funds >= 0
                                ? curveInfo.funds > Config.CURVE_KINGCAP
                                  ? 100
                                  : (
                                      (curveInfo.funds * 100) /
                                      Config.CURVE_KINGCAP
                                    ).toFixed(2)
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      {/* dethrone */}
                      {curveInfo?.funds >= 0 &&
                      curveInfo?.king &&
                      curveInfo.funds > Config.CURVE_KINGCAP ? (
                        <span className="!text-yellow-500">
                          {`👑 Crowned king of the hill on ${new Date(
                            Number(curveInfo.king) * 1000
                          ).toLocaleString("en-GB", { timeZone: "UTC" })}`}
                        </span>
                      ) : (
                        <span>
                          dethrone the current king at a{" "}
                          <span className="!text-dark">{`$${
                            curveInfo?.kingcapMC ? curveInfo?.kingcapMC.toFixed(2) : 0
                          }`}</span>{" "}
                          mcap
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Holder Distribution */}
              <div className="holders border-1 border-dashed border-dark p-2 rounded-xl">
                <div className="head border-b border-dashed border-dark">
                  Holder Distribution (TOP 20)
                </div>

                <div className="holders">
                  <ul className="my-2 text-base">
                    {holderData && holderData.length > 0 ? (
                      holderData.map((holder, index) => (
                        <li
                          key={holder.account}
                          className="flex py-1.5 border-b justify-between gap-4"
                        >
                          <div className="wrap flex">
                            <span>{index + 1}.</span>
                            <a
                              href={`${Config.SCAN_LINK}/address/${holder.account}`}
                              target="_blank"
                              className={`${
                                holder.account.toLowerCase() ===
                                Config.CURVE.toLowerCase()
                                  ? "!text-primary"
                                  : ""
                              }`}
                            >
                              {spliceAdress(holder.account)}
                            </a>

                            <span
                              className={`${
                                holder.account.toLowerCase() ===
                                Config.CURVE.toLowerCase()
                                  ? ""
                                  : "hidden"
                              } ml-1.5`}
                            >
                              <span className="text-xs">🏦</span>(Bonding curve)
                            </span>

                            <span
                              className={`${
                                holder.account.toLowerCase() ===
                                curveInfo?.creator?.toLowerCase()
                                  ? ""
                                  : "hidden"
                              } ml-1.5`}
                            >
                              <span className="text-xs">🤵‍♂️</span>(Dev)
                            </span>
                          </div>
                          <span className="!text-dark">{`${(
                            Number(formatEther(holder.amount)) / 10_000_000
                          ).toFixed(2)} %`}</span>
                        </li>
                      ))
                    ) : (
                      <></>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </EasingY>
        </div>
      </div>
    </section>
  );
}
