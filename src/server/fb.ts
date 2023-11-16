import { ref, set, get } from "firebase/database"
import { auth, db } from "./fbinit"
import { Point } from "./types"

export async function login(uid: string) {
  let currentChunk = (await get(ref(db, `meta/currentChunk`))).val()
  if (currentChunk == null) {
    currentChunk = { x: 0, y: 0 }
  }

  set(ref(db, `users/${uid}/login`), true)
}

async function updateChunk(uid: string, chunk: Point, isAdded: boolean) {
  let r = ref(db, `chunks/${chunk.x}/${chunk.y}/players/${uid}`)
  let playerCountInChunk = await (
    await get(ref(db, `chunks/${chunk.x}/${chunk.y}/playerCount`))
  ).val()
  if (playerCountInChunk == null) {
    playerCountInChunk = 0
  }

  if (isAdded) {
    playerCountInChunk++
    set(r, true)
    set(ref(db, `chunks/${chunk.x}/${chunk.y}/playerCount`), playerCountInChunk)

    if (playerCountInChunk > 20) {
      let currentChunk = (await get(ref(db, `meta/currentChunk`))).val()
      if (currentChunk != null) {
        currentChunk.y++
        if (currentChunk.y > 100) currentChunk.x++
      }
    }
  } else {
    set(r, null)
  }
}

export function logout(uid: string) {
  let r = ref(db, `users/${uid}/login`)
  set(r, false)
}

export function getChunkData(uid: string, index: Point) {}

export function getPlayerInfo(uid: string) {}

export function fightPlayer(uid: string, target: string) {}

export function movePlayer(uid: string, position: Point) {}

function login(uid: string) {}
function loginSecure(uid: string, password: string) {}
