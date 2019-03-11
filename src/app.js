import express from 'express'
import cors from 'cors'
import { getSchedule } from './utils'

const groups = [
  'http://poincare.matf.bg.ac.rs/~kmiljan/raspored/sve/form_016.html', // 2i2a
  'http://poincare.matf.bg.ac.rs/~kmiljan/raspored/sve/form_024.html', // 3i
]
const app = express()

app.use(cors())

app.get('/', (req, res) => {
  let schedule = []
  let boxCounters = []

  for (let i = 0; i < groups.length; i++) {
    boxCounters.push(0)
    schedule.push([])
  }

  const courses = groups.map(async (url, index) =>
    getSchedule(url, index, boxCounters, schedule),
  )

  Promise.all(courses)
    .then(() => {
      const lectures = schedule.reduce((acc, lecture) => {
        return acc.concat(lecture)
      }, [])

      res.json(lectures)
    })
    .catch(e => {
      res.json({ err: e.message })
    })
})

export default app
