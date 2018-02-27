const request = require('request')
const cheerio = require('cheerio')

const promisesInSequence = funcs =>
  funcs.reduce(
    (promise, func) =>
      promise.then(result =>
        func(result).then(() => Array.prototype.concat.bind(result))
      ),
    Promise.resolve([])
  )

const getLectures = (url, days, k, j) => {
  return new Promise((resolve, reject) => {
    request(url, (err, response, body) => {
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
          // console.log(`&&&&&&&&&&&&&&&&&    ${j}    $$$$$$$$$$`);
          for (let el of element.children) {
            if (!el.data || el.data === '\n') {
              continue
            }
            // console.log(el.data);
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
          if (i === table('td').length - 1) {
            resolve(k)
          }
        })
      }
    })
  })
}

module.exports = {
  getLectures,
  promisesInSequence
}
