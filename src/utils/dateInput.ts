const DATE_INPUT_VALUE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const padDatePart = (value: number) => String(value).padStart(2, "0");

export const dateToDateInputValue = (date: Date): string => {
  if (Number.isNaN(date.getTime())) return "";

  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join("-");
};

export const timestampToDateInputValue = (timestamp: string): string =>
  dateToDateInputValue(new Date(timestamp));

export const dateInputValueToTimestamp = (dateInputValue: string): string => {
  const match = DATE_INPUT_VALUE_PATTERN.exec(dateInputValue);

  if (!match) {
    throw new Error("日付はyyyy-MM-dd形式で指定してください。");
  }

  const [, year, month, day] = match;
  const localNoon = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    12,
    0,
    0,
    0,
  );

  if (
    Number.isNaN(localNoon.getTime()) ||
    localNoon.getFullYear() !== Number(year) ||
    localNoon.getMonth() !== Number(month) - 1 ||
    localNoon.getDate() !== Number(day)
  ) {
    throw new Error("有効な日付を指定してください。");
  }

  return localNoon.toISOString();
};
