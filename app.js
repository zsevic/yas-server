const express = require('express')
const cheerio = require('cheerio')
const request = require('request')
const cors = require('cors')
const app = express()

const urls = [
  'http://poincare.matf.bg.ac.rs/~kmiljan/raspored/sve/form_016.html'
  // "http://poincare.matf.bg.ac.rs/~kmiljan/raspored/sve/form_024.html"
]

app.use(
  cors({
    origin: 'https://sevic.me'
  })
)

app.get('/', (req, res) => {
  let j = 0
  let k = 0
  let days = []
  request(urls[0], (err, response, body) => {
    if (!err && response.statusCode === 200) {
      const $ = cheerio.load(body, {
        decodeEntities: false
      })
      let schedule = $('table > tbody > tr > td:nth-child(2)').html()
      let table = cheerio.load(schedule, { decodeEntities: false })
      table('td').each((i, element) => {
        let colspan = element.attribs.colspan
          ? parseInt(element.attribs.colspan)
          : 1
        j += colspan
        for (let el of element.children) {
          if (!el.data || el.data === '\n') {
            continue
          }
          if (days[k] === undefined) {
            if (!el.data.includes('Анализа 3')) break
            days.push({ course: el.data })
          } else if (days[k]) {
            if (!days[k].professor) {
              days[k].professor = el.data
            } else {
              days[k].classroom = el.data
              days[k].day = Math.round(j / 13) - 2
              days[k].start = (j - 27 - colspan) % 14
              days[k].duration = colspan
              k++
            }
          }
        }
      })
      res.json(days)
    }
  })
})

module.exports = app
