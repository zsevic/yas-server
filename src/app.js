import express from 'express';
import cors from 'cors';
import * as scheduleController from './api/schedule/schedule.controller';

const app = express();

app.use(cors());

app.get('/', scheduleController.getScheduleHandler);

export default app;
