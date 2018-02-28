const express = require('express')
const cors = require('cors')
const app = express()
const { getLectures, promisesInSequence } = require('./utils')

const urls = [
  'http://poincare.matf.bg.ac.rs/~kmiljan/raspored/sve/form_024.html',
  'http://poincare.matf.bg.ac.rs/~kmiljan/raspored/sve/form_016.html'
]

app.use(
  cors({
    origin: 'https://sevic.me'
  })
)

app.get('/', (req, res) => {
  let days = []
  const lectures = urls.map(url => () => getLectures(url, days))

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
