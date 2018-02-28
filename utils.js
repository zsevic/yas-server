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

const getLectures = (url, days) => {
  let j = 0
  let k = days.length
  return new Promise((resolve, reject) => {
    request(url, (err, response, body) => {
      if (!err && response.statusCode === 200) {
        const $ = cheerio.load(body, {
          decodeEntities: false
        })
        let schedule = $('table > tbody > tr > td:nth-child(2)').html()
        let table = cheerio.load(schedule, { decodeEntities: false })
        table('td').each((i, element) => {
          let tabler = cheerio.load(element, { decodeEntities: false })
          let subtable = tabler('table > tbody > tr small')

          if (
            element.children &&
            element.children.length === 1 &&
            element.children[0].name === 'br' &&
            element.children[0].type === 'tag'
          ) {
            j += 1
            return
          }

          let colspan = element.attribs.colspan
            ? parseInt(element.attribs.colspan)
            : 1
          if (subtable.length) {
            subtable.each((indix, elix) => {
              let reduced = elix.children.filter(
                i => i.data && i.data !== '\n' && i.data !== '\xa0'
              )
              if (!reduced.length) {
                return
              }
              for (let x of reduced) {
                if (days[k] === undefined) {
                  if (
                    !x.data.includes('Програмске парадигме') &&
                    !x.data.includes('Увод у нумеричку математику')
                  ) {
                    break
                  }
                  days.push({ course: x.data })
                } else if (days[k]) {
                  if (!days[k].group) {
                    days[k].group = x.data
                  } else if (!days[k].professor) {
                    days[k].professor = x.data
                  } else {
                    days[k].classroom = x.data
                    days[k].day = Math.floor(j / 13) + 1
                    days[k].start = (j - 1) % 13 + 1
                    days[k].duration = colspan
                    k++
                  }
                }
              }
            })
            j += 1
          } else {
            for (let el of element.children) {
              if (!el.data || el.data === '\n') {
                continue
              }
              if (days[k] === undefined) {
                if (!el.data.includes('Анализа 3')) {
                  j += colspan
                  break
                }
                days.push({ course: el.data, group: 'x' })
                if (days[k].course.includes('СБГ')) {
                  days[k].professor = 'СБГ'
                }
              } else if (days[k]) {
                if (!days[k].professor) {
                  days[k].professor = el.data
                } else {
                  days[k].classroom = el.data
                  days[k].day = Math.floor(j / 13) + 1
                  days[k].start = (j - 1) % 13 + 1
                  days[k].duration = colspan
                  k++
                  j += colspan
                }
              }
            }
          }
          if (i === table('td').length - 1 || j >= 65) {
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
