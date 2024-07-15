const mongoose = require('mongoose');

const conn_str = process.env.DB_URL.replace(
  '<PASSWORD>',
  process.env.DB_PASSWORD
);
mongoose.set('runValidators', true);
mongoose.connect(conn_str).then(() => {
  console.log('DB connection successful');
});


