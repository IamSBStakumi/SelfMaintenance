import { z } from "zod";

export const maintenanceTaskLimits = {
  nameMaxLength: 100,
  iconMaxLength: 2,
  memoMaxLength: 1000,
  intervalDaysMax: 36500,
} as const;

const isoDateSchema = z.iso.date();
const isoDateTimeSchema = z.iso.datetime({ offset: true });

const requiredDateString = z
  .string()
  .min(1, "前回の実施日を入力してください。")
  .refine(
    (value) =>
      isoDateSchema.safeParse(value).success ||
      isoDateTimeSchema.safeParse(value).success,
    {
      message: "前回の実施日には有効な日付を入力してください。",
    },
  );

const optionalText = (maxLength: number, message: string) =>
  z
    .string()
    .max(maxLength, message)
    .optional()
    .nullable()
    .transform((value) => {
      if (value === undefined) return undefined;

      return value?.trim() || null;
    });

export const maintenanceTaskSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "タスク名を入力してください。")
    .max(
      maintenanceTaskLimits.nameMaxLength,
      `タスク名は${maintenanceTaskLimits.nameMaxLength}文字以内で入力してください。`,
    ),
  icon: optionalText(
    maintenanceTaskLimits.iconMaxLength,
    `アイコンは${maintenanceTaskLimits.iconMaxLength}文字以内で入力してください。`,
  ),
  interval_days: z
    .number({ error: "周期には数値を入力してください。" })
    .int("周期には整数を入力してください。")
    .min(1, "周期には1以上の数値を入力してください。")
    .max(
      maintenanceTaskLimits.intervalDaysMax,
      `周期は${maintenanceTaskLimits.intervalDaysMax}日以内で入力してください。`,
    ),
  last_completed_at: requiredDateString,
  memo: optionalText(
    maintenanceTaskLimits.memoMaxLength,
    `メモは${maintenanceTaskLimits.memoMaxLength}文字以内で入力してください。`,
  ),
});

export const maintenanceTaskUpdateSchema = maintenanceTaskSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "更新する項目を指定してください。",
  });

export const maintenanceTaskFormSchema = maintenanceTaskSchema.extend({
  icon: z
    .string()
    .max(
      maintenanceTaskLimits.iconMaxLength,
      `アイコンは${maintenanceTaskLimits.iconMaxLength}文字以内で入力してください。`,
    )
    .optional(),
  memo: z
    .string()
    .max(
      maintenanceTaskLimits.memoMaxLength,
      `メモは${maintenanceTaskLimits.memoMaxLength}文字以内で入力してください。`,
    )
    .optional(),
});

export type MaintenanceTaskFormValues = z.infer<
  typeof maintenanceTaskFormSchema
>;
