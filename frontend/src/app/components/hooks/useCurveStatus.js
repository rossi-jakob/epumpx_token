import { useEffect, useState } from "react";
import curveABI from "@/abi/curve.json"
import Config from "../../config/config";
import { useChainId } from "wagmi";
import { multicall } from '@wagmi/core'
import { formatUnits, isAddress, parseUnits } from "viem";
import axios from "../../utils/axios";
import Socket from "../../utils/socket"
import { getApolloData } from "../../utils/util";
import { isValidAddress } from "../../utils/util";
import { ethers } from "ethers"

export function useCurveStatus(refresh = true, tokenAddr = '0x0000000000000000000000000000000000000000') {
  const chainId = useChainId()

  const [refetchApollo, setRefetchApollo] = useState(undefined)
  const [refetch, setRefetch] = useState(false)
  const [allCurves, setAllCurves] = useState([])
  const [kingCurve, setKingCurve] = useState({})

  //useEffect(() => {
  // const fetchAllCurves = async () => {
  //   try {
  //     const _apolloData = await getApolloData();
  //     const _currentKing = _apolloData?.currentKingOfTheHills?.length > 0 ? _apolloData?.currentKingOfTheHills[0] : {};
  //     let contracts = []
  //     contracts.push({
  //       address: Config.CURVE,
  //       abi: curveABI,
  //       functionName: "allTokensLength",
  //       args: []
  //     })
  //     const _lengthRaw = await multicall(Config.config, { contracts })
  //     const _length = _lengthRaw[0].status === "success" ? parseInt(_lengthRaw[0].result) : 0
  //     contracts = []
  //     for (let i = 0; i < _length; i++) {
  //       contracts.push({
  //         address: Config.CURVE,
  //         abi: curveABI,
  //         functionName: "allTokens",
  //         args: [i]
  //       })
  //     }
  //     const _allTokensRaw = await multicall(Config.config, { contracts })
  //     contracts = []
  //     for (let i = 0; i < _length; i++) {
  //       contracts.push({
  //         address: Config.CURVE,
  //         abi: curveABI,
  //         functionName: "curveInfo",
  //         args: [_allTokensRaw[i].status === 'success' ? _allTokensRaw[i].result : Config.CURVE]
  //       })
  //       contracts.push({
  //         address: Config.CURVE,
  //         abi: curveABI,
  //         functionName: "priceInUSD",
  //         args: [_allTokensRaw[i].status === 'success' ? _allTokensRaw[i].result : Config.CURVE]
  //       })
  //       contracts.push({
  //         address: Config.CURVE,
  //         abi: curveABI,
  //         functionName: "hardcapPriceInUSD",
  //         args: [_allTokensRaw[i].status === 'success' ? _allTokensRaw[i].result : Config.CURVE]
  //       })
  //       contracts.push({
  //         address: Config.CURVE,
  //         abi: curveABI,
  //         functionName: "kingcapPriceInUSD",
  //         args: [_allTokensRaw[i].status === 'success' ? _allTokensRaw[i].result : Config.CURVE]
  //       })
  //     }
  //     const _allCurvesRaw = await multicall(Config.config, { contracts })
  //     const _allCurves = []
  //     for (let i = 0; i < _length; i++) {
  //       const address = Config.CURVE
  //       const supply = _allCurvesRaw[4 * i].status === "success" ? Number(formatUnits(_allCurvesRaw[4 * i].result[0], 18)) : 0
  //       const funds = _allCurvesRaw[4 * i].status === "success" ? Number(formatUnits(_allCurvesRaw[4 * i].result[1], 18)) : 0
  //       const status = _allCurvesRaw[4 * i].status === "success" ? Number(_allCurvesRaw[4 * i].result[2]) : 0
  //       const king = _allCurvesRaw[4 * i].status === "success" ? Number(formatUnits(_allCurvesRaw[4 * i].result[3], 18)) : 0
  //       const creator = _allCurvesRaw[4 * i].status === "success" ? _allCurvesRaw[4 * i].result[4] : ''
  //       const id = _allCurvesRaw[4 * i].status === "success" ? Number(_allCurvesRaw[4 * i].result[5]) : 0
  //       const token = _allTokensRaw[i].status === 'success' ? _allTokensRaw[i].result : ''
  //       const totalSupply = _allCurvesRaw[4 * i].status === "success" ? Number(formatUnits(_allCurvesRaw[4 * i].result[7], 18)) : 0
  //       const createdAt = _allCurvesRaw[4 * i].status === "success" ? Number(_allCurvesRaw[4 * i].result[8]) : 0
  //       const name = _allCurvesRaw[4 * i].status === "success" ? _allCurvesRaw[4 * i].result[9] : ''
  //       const symbol = _allCurvesRaw[4 * i].status === "success" ? _allCurvesRaw[4 * i].result[10] : ''
  //       const logo = _allCurvesRaw[4 * i].status === "success" ? _allCurvesRaw[4 * i].result[11] : ''
  //       const description = _allCurvesRaw[4 * i].status === "success" ? _allCurvesRaw[4 * i].result[12] : ''
  //       const twitter = _allCurvesRaw[4 * i].status === "success" ? _allCurvesRaw[4 * i].result[13] : ''
  //       const telegram = _allCurvesRaw[4 * i].status === "success" ? _allCurvesRaw[4 * i].result[14] : ''
  //       const website = _allCurvesRaw[4 * i].status === "success" ? _allCurvesRaw[4 * i].result[15] : ''
  //       const actionAt = _allCurvesRaw[4 * i].status === "success" ? Number(_allCurvesRaw[4 * i].result[16]) : 0
  //       const priceInUSD = _allCurvesRaw[4 * i + 1].status === "success" ? Number(formatUnits(_allCurvesRaw[4 * i + 1].result, 12)) : 0
  //       const mc = _allCurvesRaw[4 * i + 1].status === "success" ? Number(formatUnits(_allCurvesRaw[4 * i + 1].result, 3)) : 0
  //       const hardcapMc = _allCurvesRaw[4 * i + 2].status === "success" ? Number(formatUnits(_allCurvesRaw[4 * i + 2].result, 3)) : 0
  //       const kingcapMc = _allCurvesRaw[4 * i + 3].status === "success" ? Number(formatUnits(_allCurvesRaw[4 * i + 3].result, 3)) : 0
  //       const curveItem = {
  //         address,
  //         supply,
  //         funds,
  //         status,
  //         king,
  //         creator,
  //         id,
  //         token,
  //         totalSupply,
  //         createdAt,
  //         name,
  //         symbol,
  //         logo,
  //         description,
  //         twitter,
  //         telegram,
  //         website,
  //         actionAt,
  //         priceInUSD,
  //         mc,
  //         hardcapMc,
  //         kingcapMc
  //       }
  //       if (_currentKing?.token?.toLowerCase() === curveItem.token.toLowerCase()) {
  //         // console.log('_kingCurve: ', curveItem)
  //         setKingCurve(curveItem)
  //       }
  //       _allCurves.push(curveItem)
  //     }
  //     // console.log('_allCurves: ', _allCurves)
  //     setAllCurves(_allCurves)
  //   } catch (err) {
  //     console.log('useCurveStatus err', err)
  //   }
  // }
  //fetchAllCurves()
  //}, [refetch, refresh])

  const [keyStr, setKeyStr] = useState("")
  const [searched, setSearched] = useState(false)
  const [allTokens, setAllTokens] = useState([])
  const [allTokenInfoArray, setAllTokenInfoArray] = useState([]);
  //const [ticket, setTicket] = useState(localStorage.getItem('SET_TICKET') ? localStorage.getItem('SET_TICKET') : "Recent")
  //const [direction, setDirection] = useState(Number(localStorage.getItem('SET_DIRECTION')))
  //const [includ, setInclud] = useState(localStorage.getItem('SET_INCLUDE') ? localStorage.getItem('SET_INCLUDE') : "All")
  const [tradeInfo, setTradeInfo] = useState()
  const [otherInfo, setOtherInfo] = useState()

  const handleSetTradeInfo = (item) => {
    // console.log("_tradeInfo: ", item)
    if (item?.name) {
      setTradeInfo(item)
      if (item?.name === 'Buy' || item?.name === 'Sell') {
        setRefetchApollo(item)
      }
    }
  }

  const handleSetOtherInfo = (item) => {
    // console.log("_otherInfo: ", item)
    if (item?.name) {
      if (item?.name !== 'Balance') {
        setOtherInfo(item)
        setRefetch(!refetch)
      } else {
        setRefetchApollo(item)
      }
    }
  }

  // useEffect(() => {
  //   const initAlertData = async () => {
  //     if (!tradeInfo || !tradeInfo?.name || !otherInfo || !otherInfo?.name) {
  //       const _apolloData = await getApolloData();
  //       // console.log('initAlertData', _apolloData)
  //       if (!tradeInfo || !tradeInfo?.name) {
  //         const tradeItem = _apolloData?.buys?.length > 0 ? _apolloData?.buys[0] : {};
  //         if (tradeItem?.token && isAddress(tradeItem?.token)) {
  //           const _tradeInfo = {
  //             name: 'Buy',
  //             actor: tradeItem?.buyer,
  //             token: tradeItem?.token,
  //             eth: Number(formatUnits(tradeItem.eth, 18)).toFixed(4),
  //             txHash: tradeItem?.transactionHash,
  //             timestamp: (new Date(tradeItem?.blockTimestamp * 1000)).toDateString()
  //           }
  //           try {
  //             const contracts = [{
  //               address: Config.CURVE,
  //               abi: curveABI,
  //               functionName: "curveInfo",
  //               args: [tradeItem?.token]
  //             }]

  //             const _data = await multicall(Config.config, { contracts })
  //             _tradeInfo.symbol = _data[0].status === "success" ? _data[0].result[10] : 'symbol'
  //             _tradeInfo.logo = _data[0].status === "success" ? _data[0].result[11] : 'logo'
  //           } catch (err) {
  //             console.log(err)
  //             _tradeInfo.symbol = 'symbol'
  //             _tradeInfo.logo = 'logo'
  //           }
  //           // console.log('initAlertData _tradeInfo', _tradeInfo)
  //           handleSetTradeInfo(_tradeInfo)
  //         }
  //       }
  //       if (!otherInfo || !otherInfo?.name) {
  //         const otherItem = _apolloData?.curveCreateds?.length > 0 ? _apolloData?.curveCreateds[0] : {};
  //         if (otherItem?.token && isAddress(otherItem?.token)) {
  //           const _otherInfo = {
  //             name: 'CurveCreated',
  //             actor: otherItem?.creator,
  //             token: otherItem?.token,
  //             txHash: otherItem?.transactionHash,
  //             timestamp: (new Date(otherItem?.blockTimestamp * 1000)).toDateString()
  //           }
  //           try {
  //             const contracts = [{
  //               address: Config.CURVE,
  //               abi: curveABI,
  //               functionName: "curveInfo",
  //               args: [otherItem?.token]
  //             }]

  //             const _data = await multicall(Config.config, { contracts })
  //             _otherInfo.symbol = _data[0].status === "success" ? _data[0].result[10] : 'symbol'
  //             _otherInfo.logo = _data[0].status === "success" ? _data[0].result[11] : 'logo'
  //           } catch (err) {
  //             console.log(err)
  //             _otherInfo.symbol = 'symbol'
  //             _otherInfo.logo = 'logo'
  //           }
  //           // console.log('initAlertData _otherInfo', _otherInfo)
  //           handleSetOtherInfo(_otherInfo)
  //         }
  //       }
  //     }
  //   };

  //   //initAlertData();
  //   // console.log("tradeInfo, otherInfo: ", tradeInfo, otherInfo)
  // }, [tradeInfo, otherInfo]);

  const handleSetTicket = (value) => {
    setTicket(value)
    if (localStorage.getItem('SET_TICKET') !== value) {
      localStorage.setItem('SET_TICKET', value);
    }
  }

  const handleSetDirection = (value) => {
    setDirection(value)
    if (Number(localStorage.getItem('SET_DIRECTION')) !== value) {
      localStorage.setItem('SET_DIRECTION', value.toString());
    }
  }

  const handleSetInclud = (value) => {
    setInclud(value)
    if (localStorage.getItem('SET_INCLUDE') !== value) {
      localStorage.setItem('SET_INCLUDE', value);
    }
  }

  // TODO
  // useEffect(() => {
  //   const getSearchedInfo = async () => {
  //     try {
  //       setAllTokens(null)
  //       const { data: response } = await axios.post("/api/misc/query", {
  //         // chainId,
  //         // keyStr,
  //         // ticket,
  //         // direction,
  //         // includ
  //       })

  //       if (response.success) {
  //         // console.log('all tokens: ', response.data)
  //         setAllTokens(response.data)
  //       }
  //     } catch (error) {
  //       console.log('API_ERROR')
  //     }
  //   }
  //   getSearchedInfo()
  //   // }, [searched, refresh, chainId, direction, includ, keyStr, ticket])
  // }, [refresh, chainId])

  useEffect(() => {
    const fetchAllTokens = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum); // or use a signer if needed
        const signer = await provider.getSigner();
        const curveContract = new ethers.Contract(Config.CURVE, curveABI, signer);

        // Get the total number of tokens
        const length = await curveContract.allTokensLength();
        const _length = Number(length);

        if (_length === 0) return;

        const _allTokens = [];

        for (let i = 0; i < _length; i++) {
          try {
            const token = await curveContract.allTokens(i);
            _allTokens.push(token);
          } catch (err) {
            console.warn(`Failed to fetch token at index ${i}:`, err);
          }
        }

        setAllTokens(_allTokens);
      } catch (error) {
        console.error("Error fetching all tokens:", error);
      }
    };

    fetchAllTokens();
  }, [refresh]);

  useEffect(() => {
    const getTokenInfo = async (_tokenAddr) => {
      const defaultResponse = {
        address: "0x000000000000000000000000000000000000000000",
        creator: "",
        name: "",
        logo: "",
        totalSupply: 0,
        funds: 0,
        priceInUSD: 0,
        marketCap: 0,
        volume: 0,
        mc: 0,
        hardcapMc: 0,
        kingcapMc: 0,
      };

      if (!_tokenAddr || !isValidAddress(_tokenAddr)) {
        return defaultResponse;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const curveContract = new ethers.Contract(Config.CURVE, curveABI, signer);

        // Perform contract calls
        const curveInfo = await curveContract.curveInfo(_tokenAddr);
        const priceInUSDRaw = await curveContract.priceInUSD(_tokenAddr);
        const hardcapMcRaw = await curveContract.hardcapPriceInUSD(_tokenAddr);
        const kingcapMcRaw = await curveContract.kingcapPriceInUSD(_tokenAddr);

        const address = _tokenAddr;
        const creator = curveInfo[4];
        const name = curveInfo[9];
        const logo = curveInfo[11];
        const totalSupply = Number(formatUnits(curveInfo[7], 18));
        const funds = Number(formatUnits(curveInfo[1], 18));
        const priceInUSD = Number(formatUnits(priceInUSDRaw, 12));
        const mc = Number(formatUnits(hardcapMcRaw, 3));
        const hardcapMc = Number(formatUnits(hardcapMcRaw, 3));
        const kingcapMc = Number(formatUnits(kingcapMcRaw, 3));
        const marketCap = totalSupply * priceInUSD;
        const volume = 0;

        return {
          address,
          creator,
          name,
          logo,
          totalSupply,
          funds,
          priceInUSD,
          marketCap,
          volume,
          mc,
          hardcapMc,
          kingcapMc,
        };
      } catch (err) {
        console.error("Error fetching token info:", err);
        return defaultResponse;
      }
    };

    const _fetchAllTokenInfo = async () => {
      if (!allTokens || allTokens.length === 0)
        return;

      try {
        const tmpTokenArray = [];
        const curveInfoResults = await Promise.all(
          allTokens.map((token) => getTokenInfo(token))
        );

        // Add all results to the tmpTokenArray
        tmpTokenArray.push(...curveInfoResults);
        // Set the state with the collected curve info
        setAllTokenInfoArray(tmpTokenArray);

      } catch (error) {
        console.error("Error fetching token info:", error);
      }
    }

    const fetchAllTokenInfo = async () => {
      await _fetchAllTokenInfo();
    }

    fetchAllTokenInfo();
  }, [allTokens]);

  useEffect(() => {
    // const connect = () => {
    //   // console.log("connect: ")
    // }

    // if (!Socket.connected) {
    //   Socket.connect()
    // }

    // console.log("useCurveState=============================")
    // Socket.on('connect', connect)
    // Socket.on('TRADE_INFO', handleSetTradeInfo)
    // Socket.on('OTHER_INFO', handleSetOtherInfo)

    // return () => {
    //   Socket.off('connect', connect)
    //   Socket.off('TRADE_INFO', handleSetTradeInfo)
    //   Socket.off('OTHER_INFO', handleSetOtherInfo)
    //   if (Socket.connected) {
    //     Socket.disconnect()
    //   }
    // }
  }, [])

  const [tradeData, setTradeData] = useState([]);
  const [holderData, setHolderData] = useState([]);

  useEffect(() => {
    const fetchTradeData = async () => {
      if (tokenAddr) {
        const _apolloData = await getApolloData(tokenAddr);
        setTradeData(_apolloData?.trades);
        setHolderData(_apolloData?.balances);
      }
    };

    fetchTradeData();
  }, [tokenAddr, refresh]);

  useEffect(() => {
    const refetchTradeData = async () => {
      if (isAddress(refetchApollo?.token) && tokenAddr.toLowerCase() === refetchApollo?.token.toLowerCase()) {
        const _apolloData = await getApolloData(tokenAddr);
        setTradeData(_apolloData?.trades);
        setHolderData(_apolloData?.balances);
      }
    };

    refetchTradeData();
  }, [refetchApollo]);

  return {
    keyStr,
    setKeyStr,
    searched,
    setSearched,
    allTokens,
    allTokenInfoArray,
    //ticket,
    // handleSetTicket,
    //direction,
    // handleSetDirection,
    //includ,
    // handleSetInclud,
    tradeInfo,
    otherInfo,
    allCurves,
    // setAllCurves,
    kingCurve,
    tradeData,
    holderData
  }
}
