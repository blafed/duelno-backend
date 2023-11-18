import WebSocket from "ws"
import { PlayerStatus } from "../types"
import PlayerData from "./PlayerData"
import { makeid } from "../utils"
import Challenge from "./Challenge"
import Invitation from "./Invitation"

export default class PlayerRef {
  data: PlayerData = new PlayerData()
  lobbyId: number = -1

  currentChallenge: Challenge | null = null
  currentInvitation: Invitation | null = null
}
