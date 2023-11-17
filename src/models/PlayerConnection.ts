import WebSocket from "ws"

import { makeid } from "../utils"
import PlayerRef from "./PlayerRef"

export default class PlayerConnection {
  ws: WebSocket
  playerRef: PlayerRef
  connectionId: string = ""

  constructor(ws: WebSocket, playerRef: PlayerRef) {
    this.ws = ws
    this.playerRef = playerRef

    this.connectionId = makeid(10)
  }
}
