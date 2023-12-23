const express = require('express')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const path = require('path')
const app = express()

app.use(express.json())

const dbpath = path.join(__dirname, 'cricketMatchDetails.db')

let db = null

const functionDbServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running...')
    })
  } catch (error) {
    console.log(`Database Error ${error.message}`)
    process.exit(1)
  }
}

functionDbServer()

app.get('/players/', async (request, response) => {
  try {
    const querry = `SELECT * FROM player_details ORDER BY player_id`
    const player = await db.all(querry)
    const camelCase = data => {
      return {
        playerId: data.player_id,
        playerName: data.player_name,
      }
    }
    response.send(player.map(each => camelCase(each)))
    await db.close()
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
  } catch (error) {
    console.log(`Querry error ${error.message}`)
  }
})

// player by id

app.get('/players/:playerId', async (request, response) => {
  try {
    const {playerId} = request.params
    const querry = `SELECT * FROM player_details WHERE player_id = ?`
    const player = await db.get(querry, [playerId])
    const camelCase = data => {
      return {
        playerId: data.player_id,
        playerName: data.player_name,
      }
    }
    response.send(camelCase(player))
    await db.close()
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
  } catch (error) {
    console.log(`Querry error ${error.message}`)
  }
})

//update by id

app.put('/players/:playerId', async (request, response) => {
  try {
    const {playerId} = request.params
    const {playerName} = request.body
    const querry = `UPDATE player_details 
    SET player_name = ? WHERE player_id = ?`
    await db.run(querry, [playerName, playerId])
    response.send('Player Details Updated')
    await db.close()
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
  } catch (error) {
    console.log(`Querry error ${error.message}`)
  }
})

//matches by matchid

app.get('/matches/:matchId/', async (request, response) => {
  try {
    const {matchId} = request.params
    const querry = `SELECT * FROM match_details WHERE match_id = ?`
    const player = await db.get(querry, [matchId])
    const camelCase = data => {
      return {
        matchId: data.match_id,
        match: data.match,
        year: data.year,
      }
    }
    response.send(camelCase(player))
    await db.close()
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
  } catch (error) {
    console.log(`Querry error ${error.message}`)
  }
})

// matches by playerid

app.get('/players/:playerId/matches', async (request, response) => {
  try {
    const {playerId} = request.params
    const querry = `SELECT *
      FROM player_match_score
      JOIN match_details ON player_match_score.match_id = match_details.match_id
      WHERE player_match_score.player_id = ?`
    const player = await db.all(querry, [playerId])
    const camelCase = data => {
      return {
        matchId: data.match_id,
        match: data.match,
        year: data.year,
      }
    }
    response.send(player.map(each => camelCase(each)))
    await db.close()
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
  } catch (error) {
    console.log(`Querry error ${error.message}`)
  }
})

// player by matchid

app.get('/matches/:matchId/players', async (request, response) => {
  try {
    const {matchId} = request.params
    const querry = `SELECT *
      FROM player_match_score
      JOIN player_details ON player_match_score.player_id = player_details.player_id
      WHERE player_match_score.match_id = ?`
    const player = await db.all(querry, [matchId])
    const camelCase = data => {
      return {
        playerId: data.player_id,
        playerName: data.player_name,
      }
    }
    response.send(player.map(each => camelCase(each)))
    await db.close()
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
  } catch (error) {
    console.log(`Querry error ${error.message}`)
  }
})

// player score by playerid

app.get('/players/:playerId/playerScores/', async (request, response) => {
  try {
    const {playerId} = request.params
    const querry = `SELECT
      player_id AS playerId,
      player_name AS playerName,
      SUM(score) AS totalScore,
      SUM(fours) AS totalFours,
      SUM(sixes) AS totalSixes
    FROM player_match_score
      NATURAL JOIN player_details
    WHERE
      player_id = ?;`
    const player = await db.get(querry, [playerId])
    response.send(player)
    await db.close()
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
  } catch (error) {
    console.log(`Querry error ${error.message}`)
  }
})

module.exports = app
