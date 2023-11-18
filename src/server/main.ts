import WebSocket from "ws"
import { validatePlayerSecure } from "./crypt"
import WholeState from "../models/WholeState"
import PlayerData from "../models/PlayerData"
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

      const playerId: string = json.playerId
      const secure: string = json.secure
      const connectionId: string = json.connectionId

      let validation = false

      if (connectionId) {
        validation = state.validateConnectionId(connectionId)
      } else {
        validatePlayerSecure(playerId, secure)
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
            const data: PlayerData = json.data
            const connection = state.getConnection(connectionId)

            if (!connection) {
              ws.close()
              console.error("Invalid connection " + connectionId)
              return
            }

            connection.playerRef.data = data
            connection.playerRef.id = playerId
          }

          break

        case "join-random-lobby":
          {
            const lobby = state.lobbyManager.findSuitableOrCreateNew()
            const connection = state.getConnection(connectionId)
            if (!connection) {
              ws.close()
              console.error("Invalid connection " + connectionId)
              return
            }
            lobby.addPlayer(connection.playerRef, connection.ws)
            lobby.sendToAll("player-joined", {
              ...connection.playerRef.data,
              playerId: connection.playerRef.id,
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
              ws.close()
              console.error("Invalid connection " + connectionId)
              return
            }

            const lobby = state.lobbyManager.getLobbyById(
              connection.playerRef.lobbyId
            )

            if (!lobby) {
              ws.close()
              console.error("Invalid lobby " + connection.playerRef.lobbyId)
              return
            }
            lobby.sendToAll("player-left", connection.playerRef.id)

            lobby.removePlayer(connection.playerRef)

            // const lobby = state.lobbyManager.findByPlayer(connection.playerRef)
          }
          break

        default:
          console.log("Unknown message type " + json.type)
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
