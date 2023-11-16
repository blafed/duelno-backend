export const sendTo = (ws: WebSocket, type: string, data: any) => {
  return ws.send(type + ";" + JSON.stringify(data))
}

export const sendErrorTo = (
  ws: WebSocket,
  type: string,
  message: string,
  data: object = {}
) => {
  const obj = {
    message,
    ...data,
  }

  sendTo(ws, "error-" + type, obj)
}
