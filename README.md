## PIAZZA

A RESTful SaaS for a Twitter-like system

## Pre-requisites

- Node v18 or later (Can be downloaded [here](https://nodejs.org/download/release/v16.13.2/)). Download a `.pkg` file to install Node on MacOS.

### Technologies used
- NodeJS
- Typescript
- Express
- Mongoose

## How to Run

- Clone this repository
- Run `npm install` to install project dependencies
- Create the `.env` file in the root of the project, and copy over the variables from `.env.example`. Add your DB_URI, PORT and TOKEN_SECRET. TOKEN_SECRET is string used to generate a JWT token for user authentication.
- Run `npm run start` to start the server

