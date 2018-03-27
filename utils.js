const request = require('request')
const cheerio = require('cheerio')

const getLectures = (url, index, boxCounters, days) => {
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
            boxCounters[index] += 1
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
                let counter = days[index].length - 1

                if (days[index][counter]) {
                  if (days[index][counter].hasOwnProperty('classroom')) {
                    counter += 1
                  }
                }

                if (!days[index][counter]) {
                  if (
                    !x.data.includes('Програмске парадигме') &&
                    !x.data.includes('Увод у нумеричку математику')
                  ) {
                    break
                  }
                  days[index].push({ course: x.data })
                } else if (!days[index][counter].group) {
                  days[index][counter].group = x.data
                } else if (!days[index][counter].professor) {
                  days[index][counter].professor = x.data
                } else {
                  let j = boxCounters[index]
                  days[index][counter].classroom = x.data
                  days[index][counter].day = Math.floor(j / 13) + 1
                  days[index][counter].start = (j - 1) % 13 + 1
                  days[index][counter].duration = colspan
                }
              }
            })

            boxCounters[index] += 1
          } else {
            for (let el of element.children) {
              if (!el.data || el.data === '\n') {
                continue
              }

              let counter = days[index].length - 1

              if (days[index][counter]) {
                if (days[index][counter].hasOwnProperty('classroom')) {
                  counter += 1
                }
              }

              if (!days[index][counter]) {
                if (
                  !el.data.includes('Анализа 3') &&
                  !el.data.includes('Програмске парадигме') &&
                  !el.data.includes('Увод у нумеричку математику')
                ) {
                  boxCounters[index] += colspan
                  break
                }

                days[index].push({ course: el.data }) //, group: 'x' })

                if (
                  days[index][counter] &&
                  days[index][counter].course.includes('СБГ')
                ) {
                  days[index][counter].professor = 'СБГ'
                }
              } else if (!days[index][counter].professor) {
                days[index][counter].professor = el.data
              } else {
                let j = boxCounters[index]
                days[index][counter].classroom = el.data
                days[index][counter].day = Math.floor(j / 13) + 1
                days[index][counter].start = (j - 1) % 13 + 1
                days[index][counter].duration = colspan
                boxCounters[index] += colspan
              }
            }
          }

          if (i === table('td').length - 1 || boxCounters[index] >= 65) {
            resolve(days)
          }
        })
      }
    })
  })
}

module.exports = {
  getLectures
}
