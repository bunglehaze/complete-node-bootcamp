/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log('Uncaught Exception, going to sleep now');
        process.exit(1);
});

dotenv.config({path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
    '<PASSWORD>', 
    process.env.DATABASE_PASSWORD
    );

mongoose
   .connect(DB, {
    useNewUrlParser: true
// deprecated    useCreateIndex:true,
// deprecated    useFindAndModify: false
})
.then(() => console.log('DB Connection Successful'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>{
console.log(`app running on port ${port}...`)
});

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('Unhandled Rejection, going to sleep now');
    server.close(() => {
        process.exit(1);
    });
});
