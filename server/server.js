const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');
require('./db');
const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`Server started at ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});


