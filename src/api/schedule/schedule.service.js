import { groups } from '../../config/constants';
import { getCourses, getInitialSetup } from './schedule.utils';

export async function getSchedule() {
  const { boxCounters, classes } = getInitialSetup();

  const courses = groups.map(async (url, index) => getCourses(url, index, boxCounters, classes));

  try {
    const schedule = await Promise.all(courses);

    return schedule[1].flat();
  } catch (e) {
    return { err: e.message };
  }
}
