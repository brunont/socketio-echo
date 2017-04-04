'use strict'

const express = require('express')
const socketIO = require('socket.io')
const path = require('path')

const PORT = process.env.PORT || 3000
const TIME = path.join(__dirname, '..', 'public', 'time.html')
const ECHO = path.join(__dirname, '..', 'public', 'echo.html')

const server = express()
  .get('/time', (req, res) => {
    console.log('Rendering TIME')
    res.sendFile(TIME)
  })
  .get('/', (req, res) => {
    console.log('Rendering ECHO')
    res.sendFile(ECHO)
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

const io = socketIO(server)

io.on('connection', (socket) => {
  console.log('Client connected')
  socket.on('disconnect', () => console.log('Client disconnected'))
  socket.on('msg', (msg) => {
    console.log('received: %s', msg)
    socket.emit('msg', msg)
  })
})

setInterval(() => io.emit('time', new Date().toTimeString()), 1000)
