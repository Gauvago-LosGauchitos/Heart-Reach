import {initServer} from "./config/app.js"
import {connect} from "./config/mongo.js"
import { defaultUser } from "./src/user/user.controller.js"

initServer()
connect()
defaultUser()