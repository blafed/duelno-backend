import express from "express"
import ViteExpress from "vite-express"

const app = express()

//our commands
/*

USER BASED
POST login ()
POST logout ()

GET chunk data () //called always each 100 seconds
GET player data [u]
POST fight player [u]

*/

app.post("/login/:player_id", (req, res) => {
  res.send("Hello Vite " + req.params.player_id)
})

app.get("/player/:player_id", (req, res) => {})
app.get("/lobby/:lobby_id", (req, res) => {})
app.post("/playRandomly/:player_id", (req, res) => {})
app.post("/joinLobby/:player_id", (req, res) => {})
app.post("/leaveLobby/:player_id", (req, res) => {})
app.post("/declareWinner:player_id/:match_id", (req, res) => {})
app.post("/declareLoser:player_id/:match_id", (req, res) => {})

app.get("/hello", (_, res) => {
  res.send("Hello Vite")
})

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
)
