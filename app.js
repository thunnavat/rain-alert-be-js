const express = require('express')
const mongoose = require('mongoose')
const districtRoute = require('./route/districtRoute')
const reportRoute = require('./route/reportRoute')

const app = express()

app.use(express.json())
app.use('/api/district', districtRoute)
app.use('/api/report', reportRoute)

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})

mongoose
  .connect('mongodb://admin:111111@cp23tt3.sit.kmutt.ac.th:27017/rainalert')
  .then(() => {
    console.log('connect to MongoDB')
  })
  .catch((error) => {
    console.log(error)
  })
