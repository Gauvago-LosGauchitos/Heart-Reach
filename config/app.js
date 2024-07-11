'use strict'

// Importaciones
import express from 'express'

import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import { config } from 'dotenv'
import http from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import volunteeringRoutes from '../src/volunteering/volunteering.routes.js'
import orgRoutes from '../src/organization/organization.routes.js'
import userRoutes from '../src/User/user.routes.js'
 
//Inicializacion
 // Obtener la ruta del archivo actual
const __filename = fileURLToPath(import.meta.url);

// Obtener el directorio base de la aplicación
const __dirname = dirname(__filename);

const app = express()

app.use(express.json({ limit: '100mb' }));

    config();
    const port = process.env.PORT || 2690

    // Configuración del servidor
app.use(express.urlencoded({ extended: 'false' }));
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(express.json());
// Permitir solicitudes de origen cruzado
app.use(cors());
app.use(morgan('dev'));

const staticFilesPath = path.join(__dirname, '../dataImages');
app.use('/dataImages', express.static(staticFilesPath));

 
    app.use(express.urlencoded({extended: false}))
    app.use(express.json())
    app.use(helmet())
    app.use(morgan('dev'))
    app.use(cors())
 
    //Declaracion de rutas
    app.use('/volu', volunteeringRoutes)
    app.use('/org', orgRoutes)
    app.use('/user', userRoutes);
 
    export const initServer = ()=>{
        app.listen(port)
        console.log(`Server HTTP running in port ${port}`)
    }