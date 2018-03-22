const express = require('express')
const app = express()
const cors = require('cors')
const { getLectures } = require('./utils')

const LINKS = [
  'http://poincare.matf.bg.ac.rs/~kmiljan/raspored/sve/form_016.html',
  'http://poincare.matf.bg.ac.rs/~kmiljan/raspored/sve/form_024.html'
]

app.use(cors())

app.get('/', (req, res) => {
  let days = []
  let boxCounters = []

  for (let i = 0; i < LINKS.length; i++) {
    boxCounters.push(0)
    days.push([])
  }

  const lectures = LINKS.map((url, index) =>
    getLectures(url, index, boxCounters, days)
  )

  Promise.all(lectures).then(response => {
    const lects = []
    for (let i = 0; i < days.length; i++) {
      for (let j = 0; j < days[i].length; j++) {
        lects.push(days[i][j])
      }
    }
    res.json(lects)
  })
})

module.exports = app
