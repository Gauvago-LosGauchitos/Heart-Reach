import Volunteering from "./volunteering.model.js"

//testeo
export const test = (req, res)=>{
    console.log('test is running')
    return res.send({message: 'Test is running'})
}

//Register

export const registerV = async (req, res) => {
    try {
        let data = req.body;
        const existingVolunteering = await Volunteering.findOne({ nameVolunteering: data.nameVolunteering });
        if (existingVolunteering) {
            return res.status(400).send({ message: 'Volunteering already exists' });
        }
        let volunteering = new Volunteering(data);
        await volunteering.save()
        return res.send({ message: '¡The Volunteering has been successfully registered!' });
    } catch (err) {
        return res.status(500).send({ message: 'Error registering the Volunteering', err: err });
    }
}