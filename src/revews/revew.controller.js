import revewORG from './revew.model.js';
import Organization from '../organization/organization.model.js';
import User from '../User/user.model.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export const newRevew = async (req, res) => {
    try {
        let data = req.body;

        let { authorization } = req.headers;
        let secretKey = process.env.SECRET_KEY;
        let { uid } = jwt.verify(authorization, secretKey); 
        data.userR = uid;

        let findUserReview = await revewORG.findOne({ userR: uid, organizationR: data.organizationR });

        let organization = await Organization.findById(data.organizationR);

        if (!findUserReview) {
            const newRating = (organization.rating ? (parseFloat(organization.rating) + parseFloat(data.rating)) / 2 : data.rating);

            if (newRating > 5) {
                return res.status(400).send({ message: 'You cannot give more than 5 stars' });
            }

            organization.rating = newRating;

            await organization.save();
            let review = new revewORG   (data);
            await review.save();

            return res.send({ message: 'Se ha agregado la revew' });
        } else {
            return res.status(400).send({ message: 'You have already reviewed this organization.' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Internal server error.' });
    }
};


export const getAllReviews = async (req, res) => {
    try {
        const reviews = await revewORG.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userR',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: 'organizations', 
                    localField: 'organizationR',
                    foreignField: '_id',
                    as: 'organization'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $unwind: '$organization'
            },
            {
                $project: {
                    _id: 1,
                    review: 1,
                    rating: 1,
                    created: 1,
                    userR: 1,
                    organizationR: 1,
                    username: '$user.username',
                    organizationName: '$organization.name' 
                }
            }
        ]);

        return res.send(reviews);
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Internal server error.' });
    }
};


export const getOrganizationReviews = async (req, res) => {
    const { orgId } = req.body; // Obtener el ID de la organización desde el cuerpo de la solicitud

    try {
        console.log(`Buscando reviews para la organización con ID: ${orgId}`);

        const reviews = await revewORG.aggregate([
            {
                $match: { organizationR: new mongoose.Types.ObjectId(orgId) } 
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userR',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    _id: 1,
                    review: 1,
                    rating: 1,
                    created: 1,
                    userR: 1,
                    username: '$user.username'
                }
            }
        ]);

        console.log(`Reviews encontradas:`, reviews);

        return res.send(reviews);
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Internal server error.' });
    }
};

