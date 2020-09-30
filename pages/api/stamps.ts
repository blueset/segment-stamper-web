import { NextApiRequest, NextApiResponse } from 'next'
import { getCollection } from '../../utils/db';


export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "POST") {
        const collection = await getCollection();
        const type = req.body.type;
        if (type === "on" || type === "off") {

            const prev = await collection.findOne({
                type: type === "off" ? "on" : "off",
            }, {
                sort: { date: -1 }
            }) || {
                date: new Date(0),
                type: "off",
            };

            const data = {
                date: new Date(),
                type: type,
            };

            await collection.insertOne(data);

            res.status(200).json({
                ok: true,
                previousDate: prev.date,
                currentDate: data.date,
                currentStatus: data.type,
            });
        } else {
            res.status(422).json({
                ok: false,
                error: `Type ${type} is not allowed.`,
            });
        }
    } else if (req.method === "GET") {
        const collection = await getCollection();
        const date = new Date();
        date.setDate(date.getDate() - 7);
        const cursor = await collection.find({
            date: { $gte: new Date(date) },
        }, {
            sort: { date: 1 }
        });
        const docs = await cursor.toArray();
        res.status(200).json(docs);
    } else {
        res.status(405).json({
            ok: false,
            error: "Method not allowed",
        });
    }
}