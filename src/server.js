'use strict'

const http = require('http')
const express = require('express')
const app = express()
const server = http.Server(app)
const socketIO = require('socket.io')
const path = require('path')
const MongoClient = require('mongodb').MongoClient

const PORT = process.env.PORT || 3000
const TIME = path.join(__dirname, '..', 'public', 'time.html')
const ECHO = path.join(__dirname, '..', 'public', 'echo.html')
const DB_URI = 'mongodb://heroku_9vlmj3kp:va02v2dffpekcsdpij222i2rca@ds121190.mlab.com:21190/heroku_9vlmj3kp'

var db
MongoClient.connect(DB_URI, (err, database) => {
  if (err) return console.log(err)
  console.log(`Connected to database`)

  db = database
  server.listen(PORT, () => {
    console.log(`Listening on ${ PORT }`)
  })
})

app.get('/time', (req, res) => {
  console.log('Rendering TIME')
  res.sendFile(TIME)
})

app.get('/', (req, res) => {
  console.log('Rendering ECHO')
  res.sendFile(ECHO)
})

const io = socketIO(server)

io.on('connection', (socket) => {
  console.log('Client connected')
  socket.on('disconnect', () => console.log('Client disconnected'))
  socket.on('msg', (msg) => {
    console.log('received: %s', msg)
    socket.emit('msg', msg)

    const auditMsg = {
      message: msg,
      createdAt: Date.now(),
      handshake: {
        host: socket.handshake.headers.host,
        referer: socket.handshake.headers.referer,
        address: socket.handshake.address,
        'user-agent': socket.handshake.headers['user-agent'],
        time: socket.handshake.time,
      },
    }

    db.collection('messages').save(auditMsg, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database: %s', msg)
    })
  })
})

setInterval(() => io.emit('time', new Date().toTimeString()), 1000)
