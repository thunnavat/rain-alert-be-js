const express = require('express')
const mongoose = require('mongoose')
const districtRoute = require('./routes/districtRoute')
const reportRoute = require('./routes/reportRoute')
const userRoute = require('./routes/userRoute')
const authenRoute = require('./routes/authenRoute')
const districtUserSubscribeRoute = require('./routes/districtUserSubscribeRoute')

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

  mongoose
    .connect('mongodb://admin:111111@cp23tt3.sit.kmutt.ac.th:27017/rainalert')
    .then(() => {
      console.log('แอปพลิเคชันกำลังทำงานในโหมด Development')
    })
    .catch((error) => {
      console.log(error)
    })

