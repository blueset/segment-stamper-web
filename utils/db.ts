import { MongoClient } from "mongodb";

export interface StampDoc {
    date: Date;
    type: "on" | "off";
}

export const client: MongoClient = new MongoClient(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

export async function getCollection() {
    if (!client.isConnected()) await client.connect();
    return client.db().collection<StampDoc>("stamps");
}
