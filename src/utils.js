import axios from 'axios'
import cheerio from 'cheerio'

const getLectures = (
  box,
  colspan,
  boxCounters,
  days,
  urlIndex,
  wholeBoxes = false,
) => {
  let validLectures = box.children.filter(
    el => el.data && el.data !== '\n' && el.data !== '\xa0',
  )

  if (validLectures.length === 0) {
    return
  }

  for (let lecture of validLectures) {
    let counter = days[urlIndex].length - 1

    if (days[urlIndex][counter]) {
      // lecture has all necessary info
      if (days[urlIndex][counter].hasOwnProperty('classroom')) {
        counter += 1
      }
    }

    if (!days[urlIndex][counter]) {
      if (
        !lecture.data.includes('Анализа 3') &&
        !lecture.data.includes('Програмске парадигме')
      ) {
        if (wholeBoxes) {
          boxCounters[urlIndex] += colspan
        }
        break
      }

      if (wholeBoxes) {
        days[urlIndex].push({ course: lecture.data, group: 'x' })
        if (
          days[urlIndex][counter] &&
          days[urlIndex][counter].course.includes('СБГ')
        ) {
          days[urlIndex][counter].professor = 'СБГ'
        }
      } else {
        days[urlIndex].push({ course: lecture.data })
      }
    } else if (!days[urlIndex][counter].group) {
      days[urlIndex][counter].group = lecture.data
    } else if (!days[urlIndex][counter].professor) {
      days[urlIndex][counter].professor = lecture.data
    } else {
      let j = boxCounters[urlIndex]

      days[urlIndex][counter].classroom = lecture.data
      days[urlIndex][counter].day = Math.floor(j / 13) + 1
      days[urlIndex][counter].start = ((j - 1) % 13) + 1
      days[urlIndex][counter].duration = colspan

      if (wholeBoxes) {
        boxCounters[urlIndex] += colspan
      }
    }
  }
}

export const getSchedule = async (url, urlIndex, boxCounters, days) => {
  try {
    const body = await axios(url)
    const $ = cheerio.load(body.data, {
      decodeEntities: false,
    })
    let schedule = $('table > tbody > tr > td:nth-child(2)').html()
    schedule = cheerio.load(schedule, { decodeEntities: false })

    let response

    schedule('td').each((i, box) => {
      let lectureBox = cheerio.load(box, { decodeEntities: false })
      let subtable = lectureBox('table > tbody > tr small')
      // empty boxes
      if (
        box.children &&
        box.children.length === 1 &&
        box.children[0].name === 'br' &&
        box.children[0].type === 'tag'
      ) {
        boxCounters[urlIndex] += 1
        return
      }

      let colspan = box.attribs.colspan ? Number(box.attribs.colspan) : 1

      // multiple lecture inside one box
      if (subtable.length > 0) {
        subtable.each((index, element) => {
          getLectures(element, colspan, boxCounters, days, urlIndex)
        })

        boxCounters[urlIndex] += 1
      } else {
        getLectures(box, colspan, boxCounters, days, urlIndex, true)
      }

      // all boxes are passed
      if (i === schedule('td').length - 1 || boxCounters[urlIndex] >= 65) {
        response = days
      }
    })

    return response
  } catch (e) {
    return e
  }
}
