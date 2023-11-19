import WebSocket from "ws"
import { sendTo, sendToSocket } from "../func/core"
import {
  ERR_BET_UNGAINABLE,
  LOBBY_MAX_PLAYERS,
  RANDOM_PLAY_BET,
} from "../server/consts"
import { PlayerStatus } from "../types"
import PlayerRef from "./PlayerRef"
import PlayerConnection from "./PlayerConnection"
import PlayerData from "./PlayerData"
import Challenge from "./Challenge"

export default class Lobby {
  readonly id: number = 0
  private players: PlayerRef[] = []
  private sockets: WebSocket[] = []
  private challenges: Challenge[] = []

  private randomPlayer: PlayerRef | null = null

  maxPlayerNumber = LOBBY_MAX_PLAYERS

  constructor(id: number) {
    this.id = id
  }

  addPlayer(player: PlayerRef, ws: WebSocket) {
    this.players.push(player)
    this.sockets.push(ws)
    player.lobbyId = this.id
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

  sendLobbyDataToConnection(connection: PlayerConnection) {
    connection.send("lobby-info", {
      id: this.id,
      players: this.players.map((x) => x.data),
    })
  }

  sendPlayerDataChangedToAll(player: PlayerRef) {
    this.sendToAll("player-changed", player.data)
  }

  sendPlayerDataChangedManyToAll(players: PlayerRef[]) {
    this.sendToAll(
      "player-changed-many",
      players.map((x) => x.data)
    )
  }

  makePlayerRandomPlay(player: PlayerRef): Challenge | null {
    if (player == this.randomPlayer) return null
    if (this.randomPlayer) {
      return new Challenge(this.randomPlayer, player, RANDOM_PLAY_BET)
      this.randomPlayer = null
    } else {
      this.randomPlayer = player
      player.data.status = PlayerStatus.invitied
      return null
    }
  }

  canelPlayerRandomPlay(player: PlayerRef) {
    if (this.randomPlayer == player) {
      this.randomPlayer = null
      player.data.status = PlayerStatus.idle
    }
  }

  createChallenge(player: PlayerRef, otherPlayer: PlayerRef, bet: number) {
    const challenge = new Challenge(player, otherPlayer, bet)
    this.challenges.push(challenge)
    return challenge.roomId
  }

  getChallenge(roomId: string) {
    return this.challenges.find((x) => x.roomId == roomId)
  }

  getPlayer(playerId: string) {
    return this.players.find((x) => x.data.playerId == playerId)
  }
}
