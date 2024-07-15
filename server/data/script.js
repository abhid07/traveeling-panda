const dotenv = require('dotenv');
const Tour = require('../Model/Tour');
const fs = require('fs');
dotenv.config({ path: '../config.env' });
const app = require('../app');
require('../db');
const port = process.env.PORT;

const mongoose = require('mongoose');

const conn_str = process.env.DB_URL.replace(
  '<PASSWORD>',
  process.env.DB_PASSWORD
);
mongoose
  .connect(conn_str)
  .then(() => {
    console.log('DB connection successful');
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(port, () => {
  console.log(`Server started at ${port}`);
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data imported successfully');
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted successfully');
    importData();
  } catch (err) {
    console.log(err);
  }
};
deleteData();
