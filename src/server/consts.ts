export const SECURE_SALT = "dsaj8d-3fv3n98c"

export const MIN_BET = 10

export const RANDOM_PLAY_BET = 10

export const INVITATION_DURATION = 15
export const INVITATION_DURATION_MS = INVITATION_DURATION * 1000
export const ERR_PLAYER_NOT_EXIST = 1
export const LOBBY_MAX_PLAYERS = 40
export const ERR_BET_UNGAINABLE = 2

enum ErrorCodes {
  NO_ERROR = 0,
  PLAYER_NOT_EXIST = 1,
  BET_UNGAINABLE = 2,
}

export { ErrorCodes }
