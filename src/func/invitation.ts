import { ERR_PLAYER_NOT_EXIST, INVITATION_DURATION } from "../server/consts"
import { makeid } from "../utils"
import { getConnection } from "./connections"
import { sendErrorTo, sendTo } from "./core"

export function sendInvitation(
  connections: AllConnections,
  senderId: string,
  targetId: string,
  bet: number
) {
  let target = getConnection(connections, targetId)
  let sender = getConnection(connections, senderId)

  if (!sender) {
    return ERR_PLAYER_NOT_EXIST
  }

  if (!target) {
    sendErrorTo(sender.ws, "send-invitation", "Player not found " + targetId)
    return 0
  }

  const invitationId = makeid(8)
  const invitationData: InvitationData = {
    senderId,
    targetId,
    invitationId,
    bet,
    //set the end time equal to now time + the duration of the invitation (invitation duration is in seconds)
    endTime: new Date(Date.now() + INVITATION_DURATION * 1000),
  }

  target.data.invitation = invitationData
  sender.data.invitation = invitationData

  sender.data.status = "invited"
  target.data.status = "invited"

  sendTo(target.ws, "got-invitation", invitationData)

  return 0
}

export function acceptInvitation(
  connections: AllConnections,
  playerId: string
) {
  //accpets the invitation of player and inform the other player about it

  const reciever = getConnection(connections, playerId)
  if (!reciever) return ERR_PLAYER_NOT_EXIST

  const invitation = reciever.data.invitation
  //TODO
  return 0
}
