import WebSocket from "ws"
import { validatePlayerSecure } from "./crypt"
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

wss.on("connection", (ws: WebSocket) => {
  //store the connection

  //generate random hash id

  const id =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)

  ws.on("message", (message: string) => {
    const client = connections[id]
    const json = JSON.parse(message)

    const playerId = json.playerId
    const secure = json.secure
    const data = json.data

    const validation = validatePlayerSecure(playerId, secure)

    if (!validation) {
      ws.close()
      console.error("Invalid secure " + playerId + " " + secure)
      return
    }

    switch (json.type) {
      case "set-login":
        connections[id] = {
          ws,
          data: {},
        }
        break
    }

    console.log(`Received: ${message}`)
  })
})
