import { PlayerStatus, Point } from "../types"

export default class PlayerData {
  playerId: string = ""
  position: Point = { x: 0, y: 0 }
  status: PlayerStatus = 0
  avatar: string = ""

  wins: number = 0
  coins: number = 0
  gamesPlayed: number = 0
}
