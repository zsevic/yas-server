import * as scheduleService from './schedule.service';

export async function getScheduleHandler(_, res) {
  const schedule = await scheduleService.getScheduler();

  res.json(schedule);
}
