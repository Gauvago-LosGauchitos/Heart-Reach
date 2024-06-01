import Organization from './organization.model.js'

export const test = (req, res) => {
    console.log('test panoli')
    return res.send({
        message: 'test'
    })
}

export const orgRequest = async (req, res) => {
    try {
        let data = req.body
        data.owner = req.user._id
        const existingOrg = await Organization.findOne({
            $or: [
                {
                    name: data.name
                },
                {
                    address: data.address
                }
            ]
        });
        console.log(data)
        if (existingOrg) {
            return res.status(400).send({
                message: 'The org Request request already exists or repeated data. The data that cannot be repeated is the name, address and telephone number.'
            });
        }
        let orgRequest = new Organization(data);
        await orgRequest.save();
        return res.send({
            message: '¡The hotel Request has been successfully registered!'
        });
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Error solicitating the organization' })
    }
}