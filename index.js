import {initServer} from "./config/app.js"
import {connect} from "./config/mondongo.js"
import { createDefaultTypes } from "./src/volunteering/volunteering.controller.js"

initServer()
connect()

createDefaultTypes().then(() => {
    console.log('Tipos de voluntariado por defecto creados');
}).catch(err => {
    console.error('Error al crear los tipos de voluntariado por defecto', err);
});