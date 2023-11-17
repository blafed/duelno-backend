import WholeState from "../models/WholeState"
import { ERR_PLAYER_NOT_EXIST } from "../server/consts"

export function login(state: WholeState, playerId: string) {
  return 0
}

function createPlayerData(playerId: string) {
  return {
    playerId,
    wins: 0,
    gamesPlayed: 0,
    coins: 0,
    invitation: null,
  }
}
