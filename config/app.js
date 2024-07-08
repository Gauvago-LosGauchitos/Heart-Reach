'use strict'

// Importaciones
import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import { config } from 'dotenv'
import http from 'http'
import { Server } from 'socket.io'
import volunteeringRoutes from '../src/volunteering/volunteering.routes.js'
import orgRoutes from '../src/organization/organization.routes.js'
import userRoutes from '../src/User/user.routes.js'
import { Message } from '../src/chat/message.model.js'
import { PrivateMessage } from '../src/chat/privateMessage.model.js'  
import { UserMessage } from '../src/chat/userMessage.model.js'  


// Inicializacion
const app = express()
config()
const port = process.env.PORT || 2690

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(helmet())
app.use(morgan('dev'))
app.use(cors())

// Declaracion de rutas
app.use('/volu', volunteeringRoutes)
app.use('/org', orgRoutes)
app.use('/user', userRoutes)

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

    // Escuchar eventos de mensaje en foros
    socket.on('message', async (data) => {
        console.log('Mensaje recibido:', data)
        
        // Guardar mensaje en MongoDB
        const newMessage = new Message({
            username: data.username,
            message: data.message,
            chatRoom: data.chatRoom  // ID del voluntariado
        })
        await newMessage.save()

        // Emitir el mensaje a todos los clientes conectados a la misma sala
        io.to(data.chatRoom).emit('message', data)
    })

    // Unir al cliente a una sala de foro específica
    socket.on('joinRoom', (chatRoom) => {
        socket.join(chatRoom)
        console.log(`Cliente ${socket.id} unido a la sala ${chatRoom}`)
    })

    // Escuchar eventos de mensaje privado entre usuario y organización
    socket.on('privateMessage', async (data) => {
        console.log('Mensaje privado recibido:', data)
        
        // Guardar mensaje en MongoDB
        const newMessage = new PrivateMessage({
            username: data.username,
            message: data.message,
            user: data.user,  // ID del usuario
            organization: data.organization  // ID de la organización
        })
        await newMessage.save()

        // Crear una sala única para el usuario y la organización
        const room = `${data.user}-${data.organization}`
        
        // Emitir el mensaje a todos los clientes conectados a la misma sala
        io.to(room).emit('privateMessage', data)
    })

    // Unir al cliente a una sala privada específica entre usuario y organización
    socket.on('joinPrivateRoom', ({ user, organization }) => {
        const room = `${user}-${organization}`
        socket.join(room)
        console.log(`Cliente ${socket.id} unido a la sala privada ${room}`)
    })

    // Escuchar eventos de mensaje privado entre dos usuarios
    socket.on('userMessage', async (data) => {
        console.log('Mensaje entre usuarios recibido:', data)
        
        // Guardar mensaje en MongoDB
        const newMessage = new UserMessage({
            username: data.username,
            message: data.message,
            sender: data.sender,  
            receiver: data.receiver  
        })
        await newMessage.save()

        // Crear una sala única para los dos usuarios
        const room = [data.sender, data.receiver].sort().join('-')
        
        // Emitir el mensaje a todos los clientes conectados a la misma sala
        io.to(room).emit('userMessage', data)
    })

    // Unir al cliente a una sala privada específica entre dos usuarios
    socket.on('joinUserRoom', ({ sender, receiver }) => {
        const room = [sender, receiver].sort().join('-')
        socket.join(room)
        console.log(`Cliente ${socket.id} unido a la sala privada entre usuarios ${room}`)
    })

    // Manejo de desconexiones
    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id)
    })
})

// Inicializar el servidor
export const initServer = () => {
    server.listen(port, () => {
        console.log(`Server HTTP running on port ${port}`)
    })
}
