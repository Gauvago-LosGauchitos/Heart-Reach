import Organization from './organization.model.js'

export const test = (req, res) => {
    console.log('test panoli')
    return res.send({
        message: 'test'
    })
}

export const orgRequest = async(req, res) => {
    
}