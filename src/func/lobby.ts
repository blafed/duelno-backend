import { AllConnections } from "../types"
import { getConnection } from "./connections"

export function joinLobby(connections: AllConnections, playerId: string) {
  const player = getConnection(connections, playerId)

  if (!player) {
    return
  }
}

export function leaveLobby(connections: AllConnections, playerId: string) {
  const player = getConnection(connections, playerId)
}
