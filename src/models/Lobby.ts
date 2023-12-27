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
  private challenges: Challenge[] = []

  private randomPlayer: PlayerRef | null = null

  maxPlayerNumber = LOBBY_MAX_PLAYERS

  constructor(id: number) {
    this.id = id
  }

  addPlayer(player: PlayerRef) {
    this.players.push(player)
    player.lobby = this

    player.data.position = {
      x: Math.random() * 100,
      y: Math.random() * 100,
    }
    player.data.status = PlayerStatus.idle
  }
  removePlayer(player: PlayerRef) {
    const index = this.players.indexOf(player)
    this.players.splice(index, 1)
  }

  getPlayerCount() {
    return this.players.length
  }

  sendToAll(type: string, data: any) {
    console.log("send to all", type, data)
    for (const player of this.players) {
      player.connection.send(type, data)
    }
  }

  sendLobbyDataToConnection(connection: PlayerConnection) {
    console.log(
      "send lobby data to connection " + connection.playerRef.getPlayerId()
    )
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
      const challenge = new Challenge(
        this.randomPlayer,
        player,
        RANDOM_PLAY_BET
      )
      this.randomPlayer = null
      return challenge
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
