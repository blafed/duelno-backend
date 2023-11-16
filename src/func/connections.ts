export function getConnection(connections: AllConnections, playerId: string) {
  return connections[playerId]
}
