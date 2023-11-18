import WebSocket from "ws"
import { validatePlayerSecure } from "./crypt"
import WholeState from "../models/WholeState"
import PlayerData from "../models/PlayerData"
import { isBreakStatement } from "typescript"
import Invitation from "../models/Invitation"
import { MIN_BET } from "./consts"
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

const sendTo = (ws: WebSocket, type: string, data: any) => {
  return ws.send(type + ";" + JSON.stringify(data))
}

const state = new WholeState()

wss.on("connection", (ws: WebSocket) => {
  const makeError = (message: string) => {
    sendTo(ws, "error", message)
    ws.close()
    console.error(message)
  }
  console.log("new connection ")

  const connection = state.createConnection(ws)

  sendTo(ws, "connection", { connectionId: connection.connectionId })
  //store the connection

  //generate random hash id
  ws.on("close", () => {
    state.removeConnecition(ws)
  })

  ws.on("message", (message: string) => {
    try {
      console.log("messaged receive" + message)
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
              sendTo(ws, "error", "Invalid connection " + connectionId)
              ws.close()
              console.error("Invalid connection " + connectionId)
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
              sendTo(ws, "error", "Invalid connection " + connectionId)
              ws.close()
              console.error("Invalid connection " + connectionId)
              return
            }

            lobby.addPlayer(connection.playerRef, connection.ws)
            lobby.sendLobbyDataToConnection(connection)
            lobby.sendToAll("player-joined", {
              ...connection.playerRef.data,
              playerId: connection.playerRef.data.playerId,
              position: {
                x: Math.random() * 100,
                y: Math.random() * 100,
              },
              status: 0,
            })
          }
          break

        case "leave-lobby":
          {
            const connection = state.getConnection(connectionId)

            if (!connection) {
              sendTo(ws, "error", "Invalid connection " + connectionId)
              ws.close()
              console.error("Invalid connection " + connectionId)
              return
            }

            const lobby = state.lobbyManager.getLobbyById(
              connection.playerRef.lobbyId
            )

            if (!lobby) {
              sendTo(
                ws,
                "error",
                "Invalid lobby " + connection.playerRef.lobbyId
              )
              ws.close()
              console.error("Invalid lobby " + connection.playerRef.lobbyId)
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
            const lobby = state.lobbyManager.getLobbyById(player.lobbyId)

            if (!lobby) {
              makeError("Invalid lobby " + player.lobbyId)
              return
            }

            const roomId = lobby.makePlayerRandomPlay(player)
            if (roomId) {
              sendTo(ws, "play-random", { roomId })
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

            sendTo(otherConnection.ws, "got-invitation", invitation)
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
            const lobby = state.lobbyManager.getLobbyById(player.lobbyId)
            if (!lobby) {
              makeError("Invalid lobby " + player.lobbyId)
              return
            }

            lobby.canelPlayerRandomPlay(player)
          }
          break

        case "cancel-invitation":
          break
        case "accept-invitation":
          break

        case "declare-win":
          break

        case "declare-lose":
          break

        default:
          console.log("Unknown message type " + json.type)

          sendTo(ws, "error", "Unknown message type " + json.type)

          ws.close()
          break
      }
    } catch (e) {
      ws.close()
      console.error(e)
    }

    console.log(`Received: ${message}`)
  })
})
