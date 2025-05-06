import {
    Transfer as TransferEvent,
} from "../generated/templates/token/token"
import {
    Balance
} from "../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts"

export function handleTransfer(event: TransferEvent): void {
    let fromId = event.address.concat(event.params.from)
    let toId = event.address.concat(event.params.to)

    let fromEntity = Balance.load(fromId)
    if (!fromEntity) {
        fromEntity = new Balance(fromId)
        fromEntity.token = event.address
        fromEntity.account = event.params.from
        fromEntity.amount = new BigInt(0)
    }
    fromEntity.blockNumber = event.block.number
    fromEntity.blockTimestamp = event.block.timestamp
    fromEntity.transactionHash = event.transaction.hash
    fromEntity.address = event.address

    let toEntity = Balance.load(toId)
    if (!toEntity) {
        toEntity = new Balance(toId)
        toEntity.token = event.address
        toEntity.account = event.params.to
        toEntity.amount = new BigInt(0)
    }
    toEntity.blockNumber = event.block.number
    toEntity.blockTimestamp = event.block.timestamp
    toEntity.transactionHash = event.transaction.hash
    toEntity.address = event.address

    fromEntity.amount = fromEntity.amount.minus(event.params.value)
    toEntity.amount = toEntity.amount.plus(event.params.value)

    fromEntity.save()
    toEntity.save()
}
