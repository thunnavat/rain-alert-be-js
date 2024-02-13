const express = require('express')
const mongoose = require('mongoose')
const districtRoute = require('./routes/districtRoute')
const reportRoute = require('./routes/reportRoute')
const userRoute = require('./routes/userRoute')

const app = express()

app.use(express.json())
app.use('/api/districts', districtRoute)
app.use('/api/reports', reportRoute)
app.use('/api/users', userRoute)

app.listen(8080, () => {
  console.log('Server is running on port 8080')
})

mongoose
  .connect(
    // 'mongodb://admin:111111@database:27017/rainalert?directConnection=true'
    'mongodb://admin:111111@cp23tt3.sit.kmutt.ac.th:27017/rainalert'
  )
  .then(() => {
    console.log('connect to MongoDB')
  })
  .catch((error) => {
    console.log(error)
  })
