import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser'
import { env } from 'node:process';
import dotenv from 'dotenv';

import { router as postsRoute } from './routes/posts';
import { router as userRoute } from './routes/users';

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use('/api/posts', postsRoute);
app.use('/api/users', userRoute);

// app.use('/api/users', userRoute);

mongoose.connect(`${env.DB_URI}`, {dbName: 'piazza'}).then(() => {
    console.log('Connected to DB');
});

app.listen(env.PORT, () => {
    console.log('Running on: http://localhost:3000');
});
