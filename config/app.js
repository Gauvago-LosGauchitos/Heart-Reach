'use strict'
 
//Importaciones
import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import { config } from "dotenv"
import volunteeringRoutes from '../src/volunteering/volunteering.routes.js'
 
//Inicializacion
 
const app = express()
    config();
    const port = process.env.PORT || 2690
 
    app.use(express.urlencoded({extended: false}))
    app.use(express.json())
    app.use(helmet())
    app.use(morgan('dev'))
    app.use(cors())
 
    //Declaracion de rutas
    app.use('/volunteering', volunteeringRoutes)
 
    export const initServer = ()=>{
        app.listen(port)
        console.log(`Server HTTP running in port ${port}`)
    }