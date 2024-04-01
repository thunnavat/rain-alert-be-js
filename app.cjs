const express = require('express')
const mongoose = require('mongoose')
const config = require('./config/config')
const districtRoute = require('./routes/districtRoute')
const reportRoute = require('./routes/reportRoute')
const userRoute = require('./routes/userRoute')
const authenRoute = require('./routes/authenRoute')
// const districtUserSubscribeRoute = require('./routes/districtUserSubscribeRoute')
const adminRoute = require('./routes/adminRoute')
const bugReportRoute = require('./routes/bugReportRoute')
require('dotenv').config();
const firebase = require('firebase/app')
const axios = require('axios')
const User = require('./models/user')

const app = express()
app.use(express.json())
app.use('/api/districts', districtRoute)
app.use('/api/reports', reportRoute)
app.use('/api/users', userRoute)
app.use('/api/login', authenRoute)
// app.use('/api/districtUserSubscribe', districtUserSubscribeRoute)
app.use('/api/admin', adminRoute)
app.use('/api/bugReport', bugReportRoute)

// Route to handle the callback from Line Notify
app.get('/api/notifyCallback', async (req, res) => {
  const authorizationCode = req.query.code;
  const userId = req.query.state;
  const user = await User.findOne({ _id: userId })

  try {
    // Exchange authorization code for access token
    const tokenUrl = 'https://notify-bot.line.me/oauth/token';
    const response = await axios.post(tokenUrl, {
      grant_type: 'authorization_code',
      code: authorizationCode,
      client_id: "e48bP0urIm25wxyt3PtwM5",
      client_secret: "8arayYmWrmewnhQykYRjt9i39Ml6RjsZbzaQvEWE4QZ",
      redirect_uri: `${process.env.URL_FE}/api/notifyCallback`
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    
    });

    // Extract access token from response
    const accessToken = response.data.access_token;

    user.notifyToken = accessToken;
    user.notificationByLine = true;
    await user.save();

    // Redirect to a success page or send a success message
    res.redirect(`${process.env.NODE_ENV === 'production' ? process.env.URL_FE_PROD: process.env.URL_FE}/tt3/profile`);
  } catch (error) {
    console.error('Failed to get access token:', error.response.data);
    // Redirect to an error page or send an error message
    res.status(500).send('Failed to get access token');
  }
});

const firebaseConfig = {
  apikey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
  measurementId: config.measurementId
};
firebase.initializeApp(firebaseConfig);


app.listen(8080, () => {
  console.log('Server is running on port 8080')
})

const MONGODB_URI = process.env.NODE_ENV === 'production' ? process.env.MONGODB_URI_PROD : process.env.MONGODB_URI_DEV;

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Could not connect to MongoDB', err));