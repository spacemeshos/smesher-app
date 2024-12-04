import { z } from 'zod';

export const ErrorResponse = z.object({
  code: z.number(),
  message: z.string(),
  details: z.array(z.any()),
});

type ErrorResponse = z.infer<typeof ErrorResponse>;

export type APIError = Error & { code: number };

export const toError = (err: ErrorResponse): APIError => {
  const error = new Error(err.message) as APIError;
  error.code = err.code;
  return error;
};

export const parseResponse =
  <T extends z.ZodType>(schema: T) =>
  (input: unknown): z.infer<T> => {
    try {
      return schema.parse(input);
    } catch (err) {
      if (
        typeof input === 'object' &&
        !!input &&
        Object.hasOwn(input, 'message')
      ) {
        throw toError(ErrorResponse.parse(input));
      } else {
        throw err;
      }
    }
  };
