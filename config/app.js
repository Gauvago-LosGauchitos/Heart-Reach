'use strict'

import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import { config } from 'dotenv'
import http from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import path from 'path'
import volunteeringRoutes from '../src/volunteering/volunteering.routes.js'
import orgRoutes from '../src/organization/organization.routes.js'
import userRoutes from '../src/User/user.routes.js'
import messageRoutes from '../src/chat/message.routes.js' 

// Inicialización
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const app = express()
config()

app.use(express.json({ limit: '100mb' }))
const port = process.env.PORT || 2690

// Configuración del servidor
app.use(express.urlencoded({ extended: 'false' }))
app.use(helmet({
  crossOriginResourcePolicy: false
}))
app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

const staticFilesPath = path.join(__dirname, '../dataImages')
app.use('/dataImages', express.static(staticFilesPath))

// Declaración de rutas
app.use('/volu', volunteeringRoutes)
app.use('/org', orgRoutes)
app.use('/user', userRoutes)
app.use('/messages', messageRoutes) 

// Crear servidor HTTP
const server = http.createServer(app)
// Configuración de Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

// Manejo de conexiones de Socket.IO
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id)

  socket.on('sendMessage', (data) => {
    io.emit('receiveMessage', data)
  })

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id)
  })
})

export const initServer = () => {
  server.listen(port)
  console.log(`Server HTTP running in port ${port}`)
}
