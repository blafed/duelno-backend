import { PlayerStatus } from "../types"
import { makeid } from "../utils"
import PlayerRef from "./PlayerRef"
import WholeState from "./WholeState"

export default class Challenge {
  roomId = ""
  bet = 0
  players: PlayerRef[]

  gameOver(winner: PlayerRef) {
    const loser = this.getOtherPlayer(winner)

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

  format() {
    return {
      bet: this.bet,
      roomId: this.roomId,
      players: this.players.map((x) => x.data),
    }
  }

  getOtherPlayer(player: PlayerRef) {
    return this.players[0] === player ? this.players[1] : this.players[0]
  }
}
