import { NextApiRequest, NextApiResponse } from 'next'
import { getCollection, StampDoc } from '../../utils/db'


export default async (req: NextApiRequest, res: NextApiResponse<StampDoc[]>) => {
    const collection = await getCollection();
    const date = new Date();
    date.setDate(date.getDate() - 7);
    const cursor = await collection.find({
        date: { $gte: new Date(date) },
    }, {
        sort: { date: -1 }
    });
    const docs = await cursor.toArray();
    res.status(200).json(docs);
}