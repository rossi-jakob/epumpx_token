import { BigInt } from "@graphprotocol/graph-ts"
import {
  Buy as BuyEvent,
  CurveCompleted as CurveCompletedEvent,
  CurveCreated as CurveCreatedEvent,
  CurveLaunched as CurveLaunchedEvent,
  KingOfTheHill as KingOfTheHillEvent,
  Sell as SellEvent
} from "../generated/curve/curve"
import {
  Buy,
  CurveCompleted,
  CurveCreated,
  CurveLaunched,
  KingOfTheHill,
  CurrentKingOfTheHill,
  PendingCurve,
  Sell,
  Token,
  Trade
} from "../generated/schema"
import { token as tokenTemplate } from "../generated/templates"

export function handleBuy(event: BuyEvent): void {
  let entity = new Buy(event.transaction.hash.concatI32(event.logIndex.toI32()))
  entity.buyer = event.params.buyer
  entity.token = event.params.token
  entity.amount = event.params.amount
  entity.eth = event.params.eth
  entity.latestPrice = event.params.latestPrice
  entity.latestPriceInUSD = event.params.latestPriceInUSD

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.address = event.address

  entity.save()

  let tradeEntity = new Trade(event.transaction.hash.concatI32(event.logIndex.toI32()))
  tradeEntity.token = event.params.token
  tradeEntity.trader = event.params.buyer
  tradeEntity.isBuy = true
  tradeEntity.amount = event.params.amount
  tradeEntity.eth = event.params.eth
  tradeEntity.price = event.params.latestPrice
  tradeEntity.priceInUSD = event.params.latestPriceInUSD

  tradeEntity.blockNumber = event.block.number
  tradeEntity.blockTimestamp = event.block.timestamp
  tradeEntity.transactionHash = event.transaction.hash
  tradeEntity.address = event.address

  tradeEntity.save()
}

export function handleCurveCompleted(event: CurveCompletedEvent): void {
  let entity = new CurveCompleted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.token = event.params.token

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.address = event.address

  entity.save()

  let pendingCurveEntity = PendingCurve.load(event.params.token)
  if (!pendingCurveEntity) {
    pendingCurveEntity = new PendingCurve(event.params.token)
    pendingCurveEntity.token = event.params.token
    pendingCurveEntity.createdTime = event.block.timestamp
    pendingCurveEntity.launchedTime = new BigInt(0)
  }
  pendingCurveEntity.status = BigInt.fromI32(1)
  pendingCurveEntity.completedTime = event.block.timestamp
  pendingCurveEntity.address = event.address

  pendingCurveEntity.save()
}

export function handleCurveCreated(event: CurveCreatedEvent): void {
  let entity = new CurveCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.creator = event.params.creator
  entity.token = event.params.token
  entity.startPrice = event.params.startPrice
  entity.startPriceInUSD = event.params.startPriceInUSD

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.address = event.address

  entity.save()

  let tradeEntity = new Trade(event.transaction.hash.concatI32(event.logIndex.toI32()))
  tradeEntity.token = event.params.token
  tradeEntity.trader = event.params.creator
  tradeEntity.isBuy = true
  tradeEntity.amount = new BigInt(0)
  tradeEntity.eth = new BigInt(0)
  tradeEntity.price = event.params.startPrice
  tradeEntity.priceInUSD = event.params.startPriceInUSD

  tradeEntity.blockNumber = event.block.number
  tradeEntity.blockTimestamp = event.block.timestamp
  tradeEntity.transactionHash = event.transaction.hash
  tradeEntity.address = event.address

  tradeEntity.save()

  let token = new Token(
    event.params.token
  )
  token.token = event.params.token
  token.blockNumber = event.block.number
  token.blockTimestamp = event.block.timestamp
  token.transactionHash = event.transaction.hash
  token.address = event.address

  token.save()

  // create the tracked contract based on the template
  tokenTemplate.create(event.params.token)

  let pendingCurveEntity = PendingCurve.load(event.params.token)
  if (!pendingCurveEntity) {
    pendingCurveEntity = new PendingCurve(event.params.token)
  }
  pendingCurveEntity.token = event.params.token
  pendingCurveEntity.status = new BigInt(0)
  pendingCurveEntity.createdTime = event.block.timestamp
  pendingCurveEntity.completedTime = new BigInt(0)
  pendingCurveEntity.launchedTime = new BigInt(0)
  pendingCurveEntity.address = event.address

  pendingCurveEntity.save()
}

export function handleCurveLaunched(event: CurveLaunchedEvent): void {
  let entity = new CurveLaunched(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.token = event.params.token

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.address = event.address

  entity.save()

  let pendingCurveEntity = PendingCurve.load(event.params.token)
  if (!pendingCurveEntity) {
    pendingCurveEntity = new PendingCurve(event.params.token)
    pendingCurveEntity.token = event.params.token
    pendingCurveEntity.createdTime = event.block.timestamp
    pendingCurveEntity.completedTime = event.block.timestamp
  }
  pendingCurveEntity.status = BigInt.fromI32(2)
  pendingCurveEntity.launchedTime = event.block.timestamp
  pendingCurveEntity.address = event.address

  pendingCurveEntity.save()
}

export function handleKingOfTheHill(event: KingOfTheHillEvent): void {
  let entity = new KingOfTheHill(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.token = event.params.token
  entity.buyer = event.params.buyer
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.address = event.address

  entity.save()

  let currentKOHEntity = CurrentKingOfTheHill.load('KOH')
  if (!currentKOHEntity) {
    currentKOHEntity = new CurrentKingOfTheHill('KOH')
  }
  currentKOHEntity.token = event.params.token
  currentKOHEntity.buyer = event.params.buyer
  currentKOHEntity.amount = event.params.amount

  currentKOHEntity.blockNumber = event.block.number
  currentKOHEntity.blockTimestamp = event.block.timestamp
  currentKOHEntity.transactionHash = event.transaction.hash
  currentKOHEntity.address = event.address

  currentKOHEntity.save()
}

export function handleSell(event: SellEvent): void {
  let entity = new Sell(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.seller = event.params.seller
  entity.token = event.params.token
  entity.amount = event.params.amount
  entity.eth = event.params.eth
  entity.latestPrice = event.params.latestPrice
  entity.latestPriceInUSD = event.params.latestPriceInUSD

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.address = event.address

  entity.save()

  let tradeEntity = new Trade(event.transaction.hash.concatI32(event.logIndex.toI32()))
  tradeEntity.token = event.params.token
  tradeEntity.trader = event.params.seller
  tradeEntity.isBuy = false
  tradeEntity.amount = event.params.amount
  tradeEntity.eth = event.params.eth
  tradeEntity.price = event.params.latestPrice
  tradeEntity.priceInUSD = event.params.latestPriceInUSD

  tradeEntity.blockNumber = event.block.number
  tradeEntity.blockTimestamp = event.block.timestamp
  tradeEntity.transactionHash = event.transaction.hash
  tradeEntity.address = event.address

  tradeEntity.save()
}
