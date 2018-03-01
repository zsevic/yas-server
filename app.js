const express = require('express')
const app = express()
const { getLectures, promisesInSequence } = require('./utils')

const links = [
  'http://poincare.matf.bg.ac.rs/~kmiljan/raspored/sve/form_016.html',
  'http://poincare.matf.bg.ac.rs/~kmiljan/raspored/sve/form_024.html'
]

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

app.get('/', (req, res) => {
  let days = []
  const lectures = links.map(url => () => getLectures(url, days))

  promisesInSequence(lectures)
    .then(() => {
      /* days = days.reduce((acc, current) => {
        if (!acc[current.day]) {
          acc[current.day] = [];
          acc[current.day][current.start] = current;
          return acc;
        } else {
          acc[current.day].push(current);
          return acc;
        }
      }, {}); */
      console.log(days)
      res.json(days)
    })
    .catch(err => {
      res.send(err)
    })
})

module.exports = app
