import { createHash } from "crypto"

export function validatePlayerSecure(
  playerId: string,
  secure: string
): boolean {
  const salt = "your-salt-value" // Retrieve your salt value

  const hash = createHash("sha256")
  hash.update(salt + playerId)
  const hashedValue = hash.digest("hex")

  return hashedValue === secure
}
