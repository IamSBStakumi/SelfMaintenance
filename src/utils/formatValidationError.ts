import { ZodError } from "zod";

const formatValidationError = (error: ZodError) => {
  return error.issues?.[0]?.message || "入力内容を確認してください。";
};

export default formatValidationError;
