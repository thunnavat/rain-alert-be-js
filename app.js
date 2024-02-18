const express = require('express')
const mongoose = require('mongoose')
const districtRoute = require('./routes/districtRoute')
const reportRoute = require('./routes/reportRoute')
const userRoute = require('./routes/userRoute')
const authenRoute = require('./routes/authenRoute')
const districtUserSubscribeRoute = require('./routes/districtUserSubscribeRoute')
require('dotenv').config();


const app = express()

app.use(express.json())
app.use('/api/districts', districtRoute)
app.use('/api/reports', reportRoute)
app.use('/api/users', userRoute)
app.use('/api/login', authenRoute)
app.use('/api/districtUserSubscribe', districtUserSubscribeRoute)

app.listen(8080, () => {
  console.log('Server is running on port 8080')
})

const MONGODB_URI = process.env.NODE_ENV === 'production' ? process.env.MONGODB_URI_PROD : process.env.MONGODB_URI_DEV;

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Could not connect to MongoDB', err));