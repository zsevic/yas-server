import { groups } from '../../config/constants';
import { getSchedule, getInitialSetup } from './schedule.utils';

export async function getScheduler() {
  const { boxCounters, classes } = getInitialSetup();

  const courses = groups.map(async (url, index) => getSchedule(url, index, boxCounters, classes));

  try {
    const schedule = await Promise.all(courses);

    return schedule[0].flat();
  } catch (e) {
    return { err: e.message };
  }
}
