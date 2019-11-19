import { groups } from '../../config/constants';
import { getSchedule } from '../../utils';

export async function getScheduler() {
  const classes = [];
  const boxCounters = [];

  for (let i = 0; i < groups.length; i += 1) {
    boxCounters.push(0);
    classes.push([]);
  }

  const courses = groups.map(async (url, index) => getSchedule(url, index, boxCounters, classes));

  try {
    const schedule = await Promise.all(courses);

    return schedule[0].flat();
  } catch (e) {
    return { err: e.message };
  }
}
