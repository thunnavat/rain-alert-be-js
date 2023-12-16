const express = require('express')
const mongoose = require('mongoose')
const districtRoute = require('./route/districtRoute')
const reportRoute = require('./route/reportRoute')

const app = express()

app.use(express.json())
app.use('/api/districts', districtRoute)
app.use('/api/reports', reportRoute)

app.listen(8080, () => {
  console.log('Server is running on port 8080')
})

mongoose
  .connect(
    'mongodb://admin:111111@database:27017/rainalert?directConnection=true'
  )
  .then(() => {
    console.log('connect to MongoDB')
  })
  .catch((error) => {
    console.log(error)
  })
