/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
    '<PASSWORD>', 
    process.env.DATABASE_PASSWORD
    );
mongoose
   .connect(DB, {
    useNewUrlParser: true
})
.then(() => console.log('DB Connection Successful'));

console.log(process.env);
const port = process.env.PORT || 3000;
app.listen(port, () =>{
console.log(`app running on port ${port}...`)
});

