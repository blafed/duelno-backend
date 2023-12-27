import WebSocket from "ws"

import Lobby from "./Lobby"
import LobbyManager from "./LobbyManager"
import PlayerConnection from "./PlayerConnection"
import PlayerRef from "./PlayerRef"

export default class WholeState {
  readonly connections: PlayerConnection[] = []
  readonly lobbyManager: LobbyManager

  constructor() {
    this.lobbyManager = new LobbyManager()
  }

  lastConnection: PlayerConnection | null = null
  lastConnectionId: string | null = null

  getConnection(connectionId: string) {
    if (this.lastConnectionId)
      if (this.lastConnectionId == connectionId) return this.lastConnection

    const result = this.connections.find((c) => c.connectionId == connectionId)

    this.lastConnection = result ?? null
    this.lastConnectionId = connectionId
    return result
  }

  getPlayer(playerId: string) {
    return this.connections.find((c) => c.playerRef.data.playerId == playerId)
      ?.playerRef
  }

  getConnectionOfPlayer(playerRef: PlayerRef) {
    return this.connections.find((c) => c.playerRef == playerRef)
  }

  createConnection(ws: WebSocket) {
    this.lastConnection = null
    this.lastConnectionId = null

    const connection = new PlayerConnection(ws)
    this.connections.push(connection)
    return connection
  }

  validateConnectionId(connectionId: string) {
    return this.getConnection(connectionId) != null
  }

  removeConnecition(ws: WebSocket) {
    const connection = this.connections.find((c) => c.ws == ws)
    if (!connection) return

    this.connections.splice(this.connections.indexOf(connection), 1)
  }
}
