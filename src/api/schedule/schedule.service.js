import { getSchedule } from '../../utils';

const groups = [
  'http://poincare.matf.bg.ac.rs/~kmiljan/raspored/sve/form_016.html', // 2i2a
  'http://poincare.matf.bg.ac.rs/~kmiljan/raspored/sve/form_024.html', // 3i
];

export async function getScheduler() {
  const schedule = [];
  const boxCounters = [];

  for (let i = 0; i < groups.length; i += 1) {
    boxCounters.push(0);
    schedule.push([]);
  }

  const courses = groups.map(async (url, index) => getSchedule(url, index, boxCounters, schedule));

  try {
    const newSchedule = await Promise.all(courses);

    return newSchedule[0].flat();
  } catch (e) {
    return { err: e.message };
  }
}
