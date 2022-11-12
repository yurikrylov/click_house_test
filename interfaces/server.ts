import express, { Express, Request, Response } from 'express';
import { createClient, commandOptions } from 'redis';

const app: Express = express();
const jsonParser = express.json();
const port = process.env.PORT || 3000;
const redisClient = createClient({ url: 'redis://172.22.247.188:6379' });
redisClient.on('error', (err) => console.log('Redis Client Error', err));

const listName = 'clickHouse';
const result: {
    "date": string,
    "time": string,
    "uid": string,
    "url": string,
    "count": number
}[] = [];
app.post(
    '/',
    jsonParser,
    async (req: Request, res: Response) => {
        await redisClient.connect();
        console.log(req.body);
        const value: string = JSON.stringify(req.body);
        const response = await redisClient.rPush(commandOptions({}), listName, value);
        res.json(response);
        await redisClient.disconnect()
    });

app.get(
    '/',
    async (req: Request, res: Response) => {
        await redisClient.connect();
        const response = await redisClient.lRange(commandOptions({}), listName, 0, - 1);
        console.log(response);
        response.forEach((v: string) => {
            result.push(JSON.parse(v))
        })
        res.send(result);
        await redisClient.disconnect()
    })
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
