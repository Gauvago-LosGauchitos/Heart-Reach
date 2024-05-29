'use strict'

import { hash, compare } from 'bcrypt'

//encriptar contra
export const encrypt = async (password) => {
    try {
        return hash(password, 10)
    } catch (err) {
        console.error(err)
        return err
    }
}

//validacion de contra
export const checkPassword = async (password, hash) => {
    try {
        return await compare(password, hash)
    } catch (err) {
        console.error(err);
        return err
    }
}
//Update User
export const checkUpdateUser = (data, userId) => {
    if (userId) {
      if (Object.entries(data).length === 0) {
        return false;
      }
  
      // Verificar si se esta actualizando la contraseña y/o el DPI
      if (data.password || data.dpi) {
        return false;
      }
  
      return true;
    } else {
      return false;
    }
  };