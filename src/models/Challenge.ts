import { PlayerStatus } from "../types"
import { makeid } from "../utils"
import PlayerRef from "./PlayerRef"

export default class Challenge {
  roomId = ""
  bet = 0
  players: PlayerRef[]

  gameOver(playerIndex: number) {
    const winner = this.players[playerIndex]
    const loser = this.players[1 - playerIndex]

    winner.data.coins += this.bet
    loser.data.coins -= this.bet

    winner.data.gamesPlayed++
    loser.data.gamesPlayed++

    winner.data.wins++
  }

  constructor(player1: PlayerRef, player2: PlayerRef, bet: number) {
    this.players = [player1, player2]
    this.bet = bet
    this.roomId = "RO-" + makeid(10)

    this.players.forEach((player) => {
      bet = Math.max(10, Math.min(player.data.coins, bet))
      player.currentChallenge = this
      player.data.status = PlayerStatus.playing
    })
  }
}
