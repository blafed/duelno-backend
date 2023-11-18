import { INVITATION_DURATION, INVITATION_DURATION_MS } from "../server/consts"
import { PlayerStatus } from "../types"
import { makeid } from "../utils"
import PlayerRef from "./PlayerRef"

export default class Invitation {
  invitationId: string = ""
  from: PlayerRef
  to: PlayerRef
  bet: number

  timeCreated: number

  constructor(from: PlayerRef, to: PlayerRef, bet: number) {
    this.from = from
    this.to = to
    this.invitationId = "INV-" + makeid(10)
    this.timeCreated = Date.now()

    this.from.currentInvitation = this
    this.to.currentInvitation = this

    this.from.data.status = PlayerStatus.invitied
    this.to.data.status = PlayerStatus.invitied

    this.bet = bet
  }

  isExpired() {
    if (this.from.currentInvitation != this) {
      return true
    }

    if (this.to.currentInvitation != this) {
      return true
    }
    return Date.now() - this.timeCreated > INVITATION_DURATION_MS
  }
}
