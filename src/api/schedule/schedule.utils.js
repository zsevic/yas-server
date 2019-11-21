import axios from 'axios';
import cheerio from 'cheerio';
import { groups, courses } from '../../config/constants';

export function getInitialSetup() {
  const classes = [];
  const boxCounters = [];

  for (let i = 0; i < groups.length; i += 1) {
    boxCounters.push(0);
    classes.push([]);
  }

  return {
    boxCounters,
    classes,
  };
}

const getLectures = (
  box,
  colspan,
  boxCounters,
  days,
  urlIndex,
  wholeBoxes = false,
) => {
  const validLectures = box.children.filter(
    (el) => el.data && el.data !== '\n' && el.data !== '\xa0',
  );

  if (validLectures.length === 0) {
    return;
  }

  for (const lecture of validLectures) {
    let counter = days[urlIndex].length - 1;

    if (days[urlIndex][counter]) {
      // lecture has all necessary info
      if ('classroom' in days[urlIndex][counter]) {
        counter += 1;
      }
    }

    if (!days[urlIndex][counter]) {
      const chosenCourses = courses.filter((course) => !lecture.data.includes(course));
      if (chosenCourses.length === courses.length) {
        if (wholeBoxes) {
          boxCounters[urlIndex] += colspan;
        }
        break;
      }

      if (wholeBoxes) {
        days[urlIndex].push({ course: lecture.data, group: 'x' });
        if (
          days[urlIndex][counter]
          && days[urlIndex][counter].course.includes('СБГ')
        ) {
          days[urlIndex][counter].professor = 'СБГ';
        }
      } else {
        days[urlIndex].push({ course: lecture.data });
      }
    } else if (!days[urlIndex][counter].group) {
      days[urlIndex][counter].group = lecture.data;
    } else if (!days[urlIndex][counter].professor) {
      days[urlIndex][counter].professor = lecture.data;
    } else {
      const j = boxCounters[urlIndex];

      days[urlIndex][counter].classroom = lecture.data;
      days[urlIndex][counter].day = Math.floor(j / 13) + 1;
      days[urlIndex][counter].start = ((j - 1) % 13) + 1;
      days[urlIndex][counter].duration = colspan;

      if (wholeBoxes) {
        boxCounters[urlIndex] += colspan;
      }
    }
  }
};

export const getCourses = async (url, urlIndex, boxCounters, days) => {
  try {
    const body = await axios(url);
    const $ = cheerio.load(body.data, {
      decodeEntities: false,
    });
    let schedule = $('table > tbody > tr > td:nth-child(2)').html();
    schedule = cheerio.load(schedule, { decodeEntities: false });

    let response;

    schedule('td').each((i, box) => {
      const lectureBox = cheerio.load(box, { decodeEntities: false });
      const subtable = lectureBox('table > tbody > tr small');
      // empty boxes
      if (
        box.children
        && box.children.length === 1
        && box.children[0].name === 'br'
        && box.children[0].type === 'tag'
      ) {
        boxCounters[urlIndex] += 1;
        return;
      }

      const colspan = box.attribs.colspan ? Number(box.attribs.colspan) : 1;

      // multiple lecture inside one box
      if (subtable.length > 0) {
        subtable.each((index, element) => {
          getLectures(element, colspan, boxCounters, days, urlIndex);
        });

        boxCounters[urlIndex] += 1;
      } else {
        getLectures(box, colspan, boxCounters, days, urlIndex, true);
      }

      // all boxes are passed
      if (i === schedule('td').length - 1 || boxCounters[urlIndex] >= 65) {
        response = days;
      }
    });

    return response;
  } catch (e) {
    return e;
  }
};
