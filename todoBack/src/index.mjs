import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { redis } from '../lib/redis.mjs';

const app = express();
app.use(cors());

app.use(express.json())

const PORT = process.env.PORT || 3000;

app.post("/addtodo", async (req, res) => {
    const { body } = req;
    
    if (!body.todo || !body.description) {
        return res.status(400).json({ error: 'Bad request: todo and description are required' });
    }

    try {
        // Check if the todo item exists in Redis
        const exist = await redis.exists(body.todo);

        if (exist) {
            return res.status(400).json({ error: 'Bad request: todo already exists' });
        }

        // Set the todo item in Redis
        await client.set(body.todo, body.description);

        return res.status(201).json(body);
    } catch (err) {
        console.error('Redis error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.get("/gettodo/:key", async (req, res) => {
    const key = req.params.key;

    try {
        const value = await redis.get(key);
        if (value) {
            res.json({ key, value });
        } else {
            res.status(404).json({ error: 'Key not found' });
        }
    } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
    }
});

app.get("/gettodo", async (req, res) => {
    try {
        const keys = await redis.keys('*');

        if (keys.length === 0) {
            return res.status(404).json({ error: 'No keys found' });
        }

        const values = await Promise.all(keys.map(key => redis.get(key)));

        const Values = keys.reduce((acc, key, index) => {
            acc[key] = {
                key: key,
                value: values[index]
            };
            return acc;
        }, {}); // Provide an empty object as the initial value for acc

        res.json(Values);
    } catch (err) {
        console.error('Error fetching data from Redis:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.delete("/deletetodo/:key", async (req, res) => {
    const key = req.params.key;
    try {
        const value = await redis.get(key);
        if (value) {
            await redis.del(key);
            res.json({ key, value });
        } else {
            res.status(404).json({ error: 'Key not found' });
        }
    } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
    }
});

app.put("/changetodo/:key", async (req, res) => {
    const key = req.params.key;
    const newValue = req.body;

    if (!newValue || !newValue.description || !newValue.todo) {
        return res.status(400).json({ error: 'Description and todo are required' });
    }

    try {

        const multi = redis.multi();
        multi.set(key, newValue.description); 
        multi.rename(key, newValue.todo);     
        await multi.exec();  

        const updatedValue = await redis.get(newValue.todo);

        res.json({ key: newValue.todo, value: updatedValue });
    } catch (err) {
        console.error('Error updating value:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`);
});