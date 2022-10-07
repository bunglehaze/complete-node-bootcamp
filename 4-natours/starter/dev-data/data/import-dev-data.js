/* eslint-disable no-console */
const fs = require('fs');   
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({path: './config.env' });

const DB = process.env.DATABASE.replace(
    '<PASSWORD>', 
    process.env.DATABASE_PASSWORD
    );

mongoose
   .connect(DB, {
    useNewUrlParser: true
})
.then(() => console.log('DB Connection Successful'));

// read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

//import data into db
const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('data successfully loaded');
    } catch (err) { 
    console.log(err);

    }
    process.exit();
};

//delete all db from collection
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('data successfully deleted');
    } catch (err) { 
    console.log(err);

    }
    process.exit();
};

console.log(process.argv);
if (process.argv[2] === '--import') {
importData();
} else if (process.argv[2] == '--delete') {deleteData();
}

