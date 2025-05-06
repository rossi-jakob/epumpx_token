import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Buy,
  CurveCompleted,
  CurveCreated,
  CurveLaunched,
  KingOfTheHill,
  Sell
} from "../generated/curve/curve"

export function createBuyEvent(
  buyer: Address,
  token: Address,
  amount: BigInt,
  eth: BigInt
): Buy {
  let buyEvent = changetype<Buy>(newMockEvent())

  buyEvent.parameters = new Array()

  buyEvent.parameters.push(
    new ethereum.EventParam("buyer", ethereum.Value.fromAddress(buyer))
  )
  buyEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  buyEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  buyEvent.parameters.push(
    new ethereum.EventParam("eth", ethereum.Value.fromUnsignedBigInt(eth))
  )

  return buyEvent
}

export function createCurveCompletedEvent(token: Address): CurveCompleted {
  let curveCompletedEvent = changetype<CurveCompleted>(newMockEvent())

  curveCompletedEvent.parameters = new Array()

  curveCompletedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )

  return curveCompletedEvent
}

export function createCurveCreatedEvent(
  creator: Address,
  token: Address,
  amount: BigInt
): CurveCreated {
  let curveCreatedEvent = changetype<CurveCreated>(newMockEvent())

  curveCreatedEvent.parameters = new Array()

  curveCreatedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  curveCreatedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  curveCreatedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return curveCreatedEvent
}

export function createCurveLaunchedEvent(token: Address): CurveLaunched {
  let curveLaunchedEvent = changetype<CurveLaunched>(newMockEvent())

  curveLaunchedEvent.parameters = new Array()

  curveLaunchedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )

  return curveLaunchedEvent
}

export function createKingOfTheHillEvent(
  token: Address,
  buyer: Address,
  amount: BigInt
): KingOfTheHill {
  let kingOfTheHillEvent = changetype<KingOfTheHill>(newMockEvent())

  kingOfTheHillEvent.parameters = new Array()

  kingOfTheHillEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  kingOfTheHillEvent.parameters.push(
    new ethereum.EventParam("buyer", ethereum.Value.fromAddress(buyer))
  )
  kingOfTheHillEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return kingOfTheHillEvent
}

export function createSellEvent(
  seller: Address,
  token: Address,
  amount: BigInt,
  eth: BigInt
): Sell {
  let sellEvent = changetype<Sell>(newMockEvent())

  sellEvent.parameters = new Array()

  sellEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )
  sellEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  sellEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  sellEvent.parameters.push(
    new ethereum.EventParam("eth", ethereum.Value.fromUnsignedBigInt(eth))
  )

  return sellEvent
}
