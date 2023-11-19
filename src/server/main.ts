import WebSocket from "ws"
import { validatePlayerSecure } from "./crypt"
import WholeState from "../models/WholeState"
import PlayerData from "../models/PlayerData"
import { isBreakStatement } from "typescript"
import Invitation from "../models/Invitation"
import { MIN_BET } from "./consts"
import Challenge from "../models/Challenge"
import { sendToSocket } from "../func/core"
//using typescript to write a web socket server (prototype)
//use ws package
const wss = new WebSocket.Server({ port: 5000 })

//create a connection event

const connections: {
  [key: string]: {
    ws: WebSocket
    data: { [key: string]: any }
  }
} = {}

// const sendTo = (ws: WebSocket, type: string, data: any) => {
//   return ws.send(type + ";" + JSON.stringify(data))
// }

const state = new WholeState()

wss.on("connection", (ws: WebSocket) => {
  const makeError = (message: string) => {
    sendToSocket(ws, "error", message)
    ws.close()
    console.error(message)
  }
  console.log("new connection ")

  const connection = state.createConnection(ws)
  connection.send("connection", { connectionId: connection.connectionId })

  // sendTo(ws, "connection", { connectionId: connection.connectionId })
  //store the connection

  //generate random hash id
  ws.on("close", () => {
    console.log("connection closed " + connection?.connectionId ?? "NO_ID")

    connection.playerRef.lobby?.removePlayer(connection.playerRef)
    state.removeConnecition(ws)
  })

  ws.on("message", (message: string) => {
    console.log(`Received: ${message}`)

    try {
      const json = JSON.parse(message)

      const playerId: string | undefined = json.playerId
      const secure: string = json.secure
      const connectionId: string = json.connectionId

      let validation = false

      if (connectionId) {
        validation = state.validateConnectionId(connectionId)
      } else if (playerId) {
        validatePlayerSecure(playerId, secure)
      } else {
        makeError("no playerId sent " + message)
        return
      }

      if (!validation) {
        ws.close()
        if (connectionId) console.error("Invalid connection " + connectionId)
        else console.error("Invalid secure " + playerId + " " + secure)
        return
      }

      switch (json.type) {
        case "init":
          {
            if (!playerId) {
              makeError("no playerId sent " + message)
              return
            }
            const data: PlayerData = json.data
            const connection = state.getConnection(connectionId)

            if (!connection) {
              makeError("Invalid connection " + connectionId)
              return
            }

            connection.playerRef.data = data
            connection.playerRef.data.playerId = playerId
          }

          break

        case "join-random-lobby":
          {
            const lobby = state.lobbyManager.findSuitableOrCreateNew()
            const connection = state.getConnection(connectionId)
            if (!connection) {
              makeError("Invalid connection " + connectionId)
              return
            }

            lobby.addPlayer(connection.playerRef)
            lobby.sendLobbyDataToConnection(connection)
            lobby.sendToAll("player-joined", {
              ...connection.playerRef.data,
              playerId: connection.playerRef.data.playerId,
            })
          }
          break

        case "leave-lobby":
          {
            const connection = state.getConnection(connectionId)

            if (!connection) {
              makeError("Invalid connection " + connectionId)
              return
            }

            const lobby = connection.playerRef.lobby

            if (!lobby) {
              console.warn(
                "Player " + connection.playerRef.data.playerId + " has no lobby"
              )
              return
            }

            lobby.sendToAll("player-left", connection.playerRef.data.playerId)

            lobby.removePlayer(connection.playerRef)

            // const lobby = state.lobbyManager.findByPlayer(connection.playerRef)
          }
          break

        case "play-random":
          {
            const connection = state.getConnection(connectionId)
            if (!connection) {
              makeError("Invalid connection " + connection)
              return
            }
            const player = connection.playerRef
            const lobby = connection.playerRef.lobby

            if (!lobby) {
              makeError("Player " + player.data.playerId + " has no lobby")
              return
            }

            const challenge = lobby.makePlayerRandomPlay(player)
            if (challenge) {
              const otherConnection = state.getConnectionOfPlayer(
                challenge.getOtherPlayer(player)
              )

              if (!otherConnection) {
                return
              }

              otherConnection.send("challenge", { ...challenge.format() })
              connection.send("challenge", { ...challenge.format() })
              lobby.sendPlayerDataChangedManyToAll(challenge.players)
            } else {
            }
          }
          break

        case "send-invitation":
          {
            const connection = state.getConnection(connectionId)
            if (!connection) {
              makeError("Invalid connection " + connection)
              return
            }

            const player = connection.playerRef
            const targetId: string = json.targetId

            const otherPlayer = state.getPlayer(targetId)
            if (!otherPlayer) {
              console.warn("Invalid player " + targetId)
              return
            }

            const bet: number = json.bet ?? MIN_BET

            const invitation = new Invitation(player, otherPlayer, bet)
            const otherConnection = state.getConnectionOfPlayer(otherPlayer)

            if (!otherConnection) {
              console.warn("Invalid connection " + json.playerId)
              return
            }

            otherConnection.send("got-invitation", invitation.format())
          }
          break

        case "decline-invitation":
          {
            const connection = state.getConnection(connectionId)
            if (!connection) {
              makeError("Invalid connection " + connection)
              return
            }

            const player = connection.playerRef

            if (!player.currentInvitation) {
              console.warn("No invitation  " + player)
              return
            }

            player.currentInvitation.cancel()
            player.currentInvitation = null
          }
          break

        case "cancel-play-random":
          {
            const connection = state.getConnection(connectionId)

            if (!connection) {
              makeError("Invalid connection " + connection)
              return
            }

            const player = connection.playerRef
            const lobby = connection.playerRef.lobby
            if (!lobby) {
              makeError("Player " + player.data.playerId + " has no lobby")
              return
            }

            lobby.canelPlayerRandomPlay(player)
          }
          break

        case "cancel-invitation":
          {
            const connection = state.getConnection(connectionId)

            if (!connection) {
              makeError("Invalid connection " + connection)
              return
            }

            const player = connection.playerRef

            if (player.currentInvitation) {
              player.currentInvitation.cancel()
              player.currentInvitation = null
            }
          }
          break
        case "accept-invitation":
          {
            const connection = state.getConnection(connectionId)

            if (!connection) {
              makeError("Invalid connection " + connection)
              return
            }

            const player = connection.playerRef
            const lobby = connection.playerRef.lobby

            if (!player.currentInvitation) {
              console.warn("No invitation  " + player)
              return
            }

            if (!lobby) {
              makeError("Player " + player.data.playerId + " has no lobby")
              return
            }
            const challenge = player.currentInvitation.accept()

            if (challenge) {
              const otherConnection = state.getConnectionOfPlayer(
                challenge.getOtherPlayer(player)
              )

              if (!otherConnection) {
                return
              }

              otherConnection.send("challenge", { ...challenge.format() })
              connection.send("challenge", { ...challenge.format() })

              lobby.sendPlayerDataChangedManyToAll(challenge.players)
            }
          }
          break

        case "declare-game-over":
          {
            const isWin: boolean = json.isWin
            const challengeId: string = json.challengeId
            const connection = state.getConnection(connectionId)
            if (!connection) {
              makeError("Invalid connection " + connection)
              return
            }

            const player = connection.playerRef
            const lobby = connection.playerRef.lobby

            if (!player.currentChallenge) {
              console.warn("No challenge  " + player)
              return
            }

            const challenge = player.currentChallenge

            if (challengeId != challenge.roomId) {
              console.warn("this challengeId is not playing " + challengeId)
              return
            }

            challenge.gameOver(
              isWin ? player : challenge.getOtherPlayer(player)
            )

            lobby?.sendPlayerDataChangedManyToAll(challenge.players)
          }
          break

        case "poll-lobby-info":
          const connection = state.getConnection(connectionId)
          if (!connection) {
            makeError("Invalid connection " + connection)
            return
          }

          const player = connection.playerRef
          const lobby = connection.playerRef.lobby

          if (!lobby) {
            makeError("Player " + player.data.playerId + " has no lobby")
            return
          }

          connection.lastPollTime = Date.now()

          lobby.sendLobbyDataToConnection(connection)
          break

        default:
          makeError("Unknown message type " + json.type)
          break
      }
    } catch (e) {
      ws.close()
      console.error(e)
    }
  })
})
