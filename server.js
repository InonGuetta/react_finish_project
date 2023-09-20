require('log-timestamp');
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

const app = express();

// loads environment variables from a .env file into process.env
require('dotenv').config();

const port = process.env.PORT || 5000;

// load all routes
require("./init_project/routes")(app);

mongoose.connect('mongodb://localhost:27017/inon_final_project_react').
  then(() => console.log("DB Connected!")).
  catch(error => handleError(error));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.listen(port, () => console.log(`Listening on port ${port}`));