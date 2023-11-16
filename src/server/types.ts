type Point = {
  x: number
  y: number
}
type PlayerStatus = "idle" | "playing" | "invited"
type PlayerData = {
  position: Point
  status: PlayerStatus
  playerId: string
  wins: number
  gamesPlayed: number
  coins: number
  invitation: InvitationData | null
}

type AllConnections = {
  [key: string]: PlayerConnection
}

type AllData = {
  [key: string]: PlayerData
}

type InvitationData = {
  senderId: string
  targetId: string
  invitationId: string
  bet: number
  endTime: Date
}
type PlayerConnection = {
  ws: WebSocket
  data: PlayerData
}

const defaultPoint: Point = {
  x: 0,
  y: 0,
}

const defaultPlayerData: PlayerData = {
  position: defaultPoint,
  status: "idle",
  playerId: "",
  wins: 0,
  gamesPlayed: 0,
  coins: 0,
  invitation: null,
}

const defaultInvitationData: InvitationData = {
  senderId: "",
  targetId: "",
  invitationId: "",
  bet: 0,
  endTime: new Date(),
}
