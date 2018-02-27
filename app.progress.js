const express = require('express')
const cheerio = require('cheerio')
const request = require('request')
const app = express()

const urls = [
  // "http://poincare.matf.bg.ac.rs/~kmiljan/raspored/sve/form_016.html"
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
  let j = -1
  let k = 0
  let m = 0
  let l = 0
  let r = 0
  let days = []
  let testArr = []
  request(urls[0], (err, response, body) => {
    if (!err && response.statusCode === 200) {
      const $ = cheerio.load(body, {
        decodeEntities: false
      })
      let schedule = $('table > tbody > tr > td:nth-child(2)').html()
      let table = cheerio.load(schedule, { decodeEntities: false })
      table('td').each((i, element) => {
        let tabler = cheerio.load(element, { decodeEntities: false })
        let subtable = tabler('table > tbody > tr small')

        // let tas = tabler("table").length;
        // console.log("tas", tas, "tas");

        let colspan = element.attribs.colspan
          ? parseInt(element.attribs.colspan)
          : 1

        console.log(`^^^^^^^^^^^^^^^${j}^^^^^^^^^^^^^^^`)

        if (subtable.length) {
          console.log('%%%%%%%%%%%%%%%%%%%%')
          console.log('subcolspan', colspan)
          console.log('%%%%%%%%%%%%%%%%%%%%')

          j += 1
          subtable.each((s, e) => {
            console.log(
              `***************      ${i}      ${j % 13}        &&&&&&&`
            )
            console.log('33333333333333333333')
            let reduced = e.children.filter(
              i => i.data && i.data !== '\n' && i.data !== '\xa0'
            )
            // console.log(reduced);
            // console.log(reduced.length);

            for (let o of reduced) {
              // console.log(j % 13);
              console.log(o.data)
            }
            //   if (testArr[m] === undefined) {
            //     //if (!el.data.includes('Анализа 3')) break
            //     testArr.push({ course: o.data });
            //   } else if (testArr[m]) {
            //     if (!testArr[m].group) {
            //       testArr[m].group = o.data;
            //     } else if (!testArr[m].professor) {
            //       testArr[m].professor = o.data;
            //     } else {
            //       //j -= len;
            //       testArr[m].classroom = o.data;
            //       testArr[m].day = Math.round(j / 13) - 2;
            //       testArr[m].start = (j - 27 - colspan) % 14;
            //       testArr[m].duration = 1;
            //       m++;
            //     }
            //   }
            // }*/
            console.log('**************')
          })
        } else if (colspan > 1) {
          console.log('usaoooooooooooooo')
          // j += colspan;
          for (let el of element.children) {
            if (!el.data || el.data === '\n' || el.data === '\xa0') {
              continue
            }
            console.log('&&&&&&&&&&&&&&&&&&&')
            console.log(el.data)
            console.log('&&&&&&&&&&&&&&&&&&&')
            if (days[k] === undefined) {
              // if (!el.data.includes('Анализа 3')) break
              days.push({ course: el.data })
              if (days[k].course.includes('СБГ')) days[k].professor = 'СБГ'
            } else if (days[k]) {
              /* if (!days[k].group) {
              days[k].group = '';
              } else */
              if (!days[k].professor) {
                days[k].professor = el.data
              } else {
                j += 1
                days[k].classroom = el.data
                days[k].day = Math.round(j / 13) - 2
                console.log('22222222222222222')
                console.log(i - j)
                console.log('22222222222222222')
                days[k].start = (j - 27 - colspan) % 14
                days[k].duration = colspan
                k++
              }
            }
          }
        } else {
          // console.log("ajdeeeeeee");
          console.log(element)
          if (
            element.name === 'td' &&
            element.children.length === 1 &&
            element.children[0].name === 'br' &&
            !element.children[0].children.length &&
            element.parent === null
          ) {
            // console.log("oeeeeeeeeeeeeeeeeeeeeeeee");
            console.log(
              element.name === 'td',
              element.children.length === 1,
              element.children[0].name === 'br',
              !element.children[0].children.length,
              element.parent === null &&
                element.next === null &&
                element.prev === null
            )
            j += 1
          }
        }
      })
      console.log('(((((((((((((((((((')
      console.log(testArr)
      console.log('(((((((((((((((((((((')
      res.json(days)
    }
  })
})

module.exports = app
