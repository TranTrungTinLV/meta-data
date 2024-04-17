import { BadRequestException } from '@nestjs/common';
import { EStatisticsTimeAnnual } from '../enums/statistics-time.enum';
import moment, { Moment } from 'moment';

/**
 * Calculate the renewal date by adding a number of days to the start date.
 *
 * @param {string} startDate - The start date in ISO string format.
 * @param {number} numberOfDaysToAdd - The number of days to add to the start date.
 * @returns {string} The renewal date in ISO string format.
 * @throws {BadRequestException} If an error occurs while calculating the renewal date.
 */
export function calculateRenewal(
  startDate: string,
  numberOfDaysToAdd: number,
): string {
  try {
    const start = new Date(startDate);
    const newDate = new Date();
    newDate.setDate(start.getDate() + numberOfDaysToAdd);
    return newDate.toISOString();
  } catch (err) {
    throw new BadRequestException(err.message);
  }
}

/**
 * Get the start and end date of a specific range.
 *
 * @param {number} numberClone - The number of units to subtract from the current date.
 * @param {string} filter - The type of unit to subtract (month, year, week).
 * @returns {Object} An object containing the start and end date of the range.
 */
export function getDateInRange(
  numberClone: number,
  filter: string,
): { startDate: Date; endDate: Date } {
  const currentDate = moment();
  const typeFilterStrategies = new Map([
    [`${EStatisticsTimeAnnual.MONTH}`, 'months'],
    [`${EStatisticsTimeAnnual.YEAR}`, 'years'],
    [`${EStatisticsTimeAnnual.WEEK}`, 'weeks'],
  ]);
  const startDate = currentDate
    .clone()
    .subtract(numberClone, typeFilterStrategies.get(filter) as any);
  const endDate = currentDate
    .clone()
    .subtract(numberClone - 1, typeFilterStrategies.get(filter) as any);
  return { startDate: startDate.toDate(), endDate: endDate.toDate() };
}

/**
 * Calculate the start and end day of a week.
 *
 * @param {Moment} date - The date to calculate from.
 * @param {number} value - The number of weeks to subtract from the date.
 * @returns {Object} An object containing the start and end day of the week.
 */
function printStartAndEndDayOfWeek(
  date: Moment,
  value: number,
): { startDay: string; endDay: string } {
  const startDay = date
    .clone()
    .subtract(value, 'week')
    .startOf('isoWeek')
    .format('YYYY-MM-DD HH:mm:ss');
  const endDay = date
    .clone()
    .subtract(value, 'week')
    .endOf('isoWeek')
    .format('YYYY-MM-DD HH:mm:ss');
  return { startDay, endDay };
}

/**
 * Calculate the start and end day of a specific date.
 *
 * @param {Moment} date - The date to calculate from.
 * @param {number} value - The number of days to add to the date.
 * @returns {Object} An object containing the start and end day of the date.
 */
function printStartAndEndDayOfSignalDate(
  date: Moment,
  value: number,
): { startDay: string; endDay: string } {
  const startDay = date
    .clone()
    .add(value, 'days')
    .startOf('days')
    .format('YYYY-MM-DD HH:mm:ss');
  const endDay = date
    .clone()
    .add(value, 'days')
    .endOf('days')
    .format('YYYY-MM-DD HH:mm:ss');
  return { startDay, endDay };
}

/**
 * Calculate the start and end day of a month.
 *
 * @param {Moment} date - The date to calculate from.
 * @param {number} value - The number of months to subtract from the date.
 * @returns {Object} An object containing the start and end day of the month.
 */
function printStartAndEndDayOfMonth(
  date: Moment,
  value: number,
): { startDay: string; endDay: string } {
  const startDay = date
    .clone()
    .subtract(value, 'months')
    .startOf('months')
    .format('YYYY-MM-DD HH:mm:ss');
  const endDay = date
    .clone()
    .subtract(value, 'months')
    .endOf('months')
    .format('YYYY-MM-DD HH:mm:ss');
  return { startDay, endDay };
}

/**
 * Calculate the start and end day of a year.
 *
 * @param {Moment} date - The date to calculate from.
 * @param {number} value - The number of years to subtract from the date.
 * @returns {Object} An object containing the start and end day of the year.
 */
function printStartAndEndDayOfYear(
  date: Moment,
  value: number,
): { startDay: string; endDay: string } {
  const startDay = date
    .clone()
    .subtract(value, 'years')
    .startOf('years')
    .format('YYYY-MM-DD HH:mm:ss');
  const endDay = date
    .clone()
    .subtract(value, 'years')
    .endOf('years')
    .format('YYYY-MM-DD HH:mm:ss');
  return { startDay, endDay };
}

/**
 * Print start/end date of date
 * with filter: date | week | month | year
 * with value: date previous
 *
 * @param date
 * @param filter
 */
export function printStartAndEndDayTimeSchedule(
  date: Moment,
  filter: string,
  value: number,
): { startDay: string; endDay: string } {
  const result = new Map<string, any>([
    [
      `${EStatisticsTimeAnnual.DATE}`,
      printStartAndEndDayOfSignalDate(date, value),
    ],
    [`${EStatisticsTimeAnnual.WEEK}`, printStartAndEndDayOfWeek(date, value)],
    [`${EStatisticsTimeAnnual.MONTH}`, printStartAndEndDayOfMonth(date, value)],
    [`${EStatisticsTimeAnnual.YEAR}`, printStartAndEndDayOfYear(date, value)],
  ]);
  return result.get(filter);
}

/**
 * Calculate a mapping of months to zero values.
 *
 * @param {string} month - The month to start from.
 * @returns {Object} An object mapping months to zero values.
 */
export function calZeroMonths(month: string): Record<number, number> {
  const monthsKey: Record<number, number> = {};
  const currentMonth = new Date().getMonth() + 1;
  const startMonth = currentMonth - parseInt(month);

  for (let i = startMonth; i < currentMonth; i++) {
    if (i === 1) {
      monthsKey[i] = 1;
    } else if (i <= 0) {
      monthsKey[i] = i + 12;
    } else {
      monthsKey[i] = i;
    }
  }

  return Object.values(monthsKey).reduce((acc, key: number) => {
    acc[key] = 0;
    return acc;
  }, {});
}

/**
 * Calculate the valid date for an enterprise given a number of months.
 *
 * @param {number} month_number - The number of months to add to the current date.
 * @returns {Date} The valid date for the enterprise.
 */
export function getValidToEnterprise(month_number: number): Date {
  const currentDate = new Date();
  const validTo = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + month_number,
    currentDate.getDate(),
  );
  return validTo;
}
