import WebSocket from "ws"
import { PlayerConnection } from "../types"

export const sendTo = (conn: PlayerConnection, type: string, data: any) => {
  return sendToSocket(conn.ws, type, data)
}

export const sendToSocket = (ws: WebSocket, type: string, data: any) => {
  return ws.send(type + ";" + JSON.stringify(data))
}

export const sendErrorTo = (
  conn: PlayerConnection,
  type: string,
  message: string,
  data: object = {}
) => {
  const obj = {
    message,
    ...data,
  }

  sendTo(conn, "error-" + type, obj)
}
