import WebSocket from "ws"
import { sendTo, sendToSocket } from "../func/core"
import { LOBBY_MAX_PLAYERS } from "../server/consts"
import { PlayerData } from "../types"
import PlayerRef from "./PlayerRef"

export default class Lobby {
  readonly id: number = 0
  private players: PlayerRef[] = []
  private sockets: WebSocket[] = []

  maxPlayerNumber = LOBBY_MAX_PLAYERS

  constructor(id: number) {
    this.id = id
  }

  addPlayer(player: PlayerRef, ws: WebSocket) {
    this.players.push(player)
    this.sockets.push(ws)
  }
  removePlayer(player: PlayerRef) {
    const index = this.players.indexOf(player)
    this.players.splice(index, 1)
    this.sockets.splice(index, 1)
  }

  getPlayerCount() {
    return this.players.length
  }

  sendToAll(type: string, data: any) {
    for (const socket of this.sockets) {
      sendToSocket(socket, type, data)
    }
  }
}
