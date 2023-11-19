import WebSocket from "ws"
import PlayerData from "./PlayerData"
import { makeid } from "../utils"
import Challenge from "./Challenge"
import Invitation from "./Invitation"
import Lobby from "./Lobby"
import PlayerConnection from "./PlayerConnection"

export default class PlayerRef {
  connection: PlayerConnection | null = null
  data: PlayerData = new PlayerData()
  lobby: Lobby | null = null
  currentChallenge: Challenge | null = null
  currentInvitation: Invitation | null = null

  getPlayerId() {
    return this.data.playerId
  }
}
