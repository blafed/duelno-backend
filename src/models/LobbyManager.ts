import Lobby from "./Lobby"

export default class LobbyManager {
  lobbies: Lobby[] = []
  totalPlayerCount: number = 0

  constructor() {
    this.lobbies.push(new Lobby(0))
  }

  findSuitable(): Lobby | null {
    for (let i = 0; i < this.lobbies.length; i++) {
      const lobby = this.lobbies[i]
      if (lobby.getPlayerCount() < lobby.maxPlayerNumber) {
        return lobby
      }
    }

    return null
  }

  createNew(): Lobby {
    const lobby = new Lobby(this.lobbies.length)
    this.lobbies.push(lobby)
    return lobby
  }

  findSuitableOrCreateNew(): Lobby {
    const suitable = this.findSuitable()
    if (suitable) {
      return suitable
    } else {
      return this.createNew()
    }
  }

  getLobbyById(id: number) {
    if (id >= this.lobbies.length) return null
    return this.lobbies[id]
  }
}
