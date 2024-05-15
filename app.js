const express = require('express')

const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()

app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertDBObjectToResponse = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}
app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
  SELECT * FROM cricket_team order by player_id;
  `
  const playersArray = await db.all(getPlayersQuery)
  const result = playersArray.map(eachplayer =>
    convertDBObjectToResponse(eachplayer),
  )
  response.send(result)
})

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayerQuery = `
  INSERT INTO cricket_team(player_name , jersey_number , role) 
  values ('${playerName}' , ${jerseyNumber} ,  '${role}');
  `
  const dbResponse = await db.run(addPlayerQuery)
  const playerId = dbResponse.lastID
  console.log(playerId)
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayersQuery = `select * from cricket_team where player_id = ${playerId};`
  const playerDetails = await db.get(getPlayersQuery)
  response.send(convertDBObjectToResponse(playerDetails))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails

  const addPlayerQuery = `
  update cricket_team 
  set
   player_name = '${playerName}' ,
   jersey_number = ${jerseyNumber} ,
   role = '${role}' 
  where player_id = ${playerId};
  `
  response.send('Player Details Updated')
  await db.run(addPlayerQuery)
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
  DELETE FROM cricket_team where player_id = ${playerId} ;
  `
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
