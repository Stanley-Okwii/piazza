import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser'
import { env } from 'node:process';
import {parse} from 'qs';
import dotenv from 'dotenv';

import { postsRouter } from './routes/posts';
import { usersRouter } from './routes/users';

dotenv.config();

const app = express();

//Add querystring parsing and stringifying library with some added security: https://www.npmjs.com/package/qs
app.set('query parser', (str: any) => parse(str, { /* custom options */ }));

app.use(bodyParser.json());
app.use('/api/posts', postsRouter);
app.use('/api/users', usersRouter);

// app.use('/api/users', userRoute);

mongoose.connect(`${env.DB_URI}`, {dbName: 'piazza'}).then(() => {
    console.log('Connected to DB');
});

app.listen(env.PORT, () => {
    console.log('Running on: http://localhost:3000');
});
