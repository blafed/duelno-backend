import WebSocket from "ws"

import { makeid } from "../utils"
import PlayerRef from "./PlayerRef"
import { sendTo, sendToSocket } from "../func/core"
import Challenge from "./Challenge"

export default class PlayerConnection {
  ws: WebSocket
  playerRef: PlayerRef
  connectionId: string = ""

  lastPollTime: number = 0

  constructor(ws: WebSocket) {
    this.ws = ws
    this.playerRef = new PlayerRef(this)

    this.connectionId = makeid(10)
  }

  send(type: string, data: any) {
    sendToSocket(this.ws, type, data)
  }

  makeAndSendChallenge(other: PlayerConnection, bet: number) {
    const roomId = new Challenge(this.playerRef, other.playerRef, bet).roomId

    this.send("challenge", {
      bet,
      otherPlayerId: other.playerRef.data.playerId,
      roomId,
    })

    other.send("challenge", {
      bet,
      otherPlayerId: this.playerRef.data.playerId,
      roomId,
    })
  }
}
