import type { NextFunction, Request, Response } from 'express';

export function asyncHandler<
  Params = Request['params'],
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Request['query'],
  Locals extends Record<string, unknown> = Record<string, unknown>,
>(
  handler: (
    req: Request<Params, ResBody, ReqBody, ReqQuery, Locals>,
    res: Response<ResBody, Locals>,
    next: NextFunction,
  ) => Promise<unknown>,
) {
  return (req: Request<Params, ResBody, ReqBody, ReqQuery, Locals>, res: Response<ResBody, Locals>, next: NextFunction) => {
    void handler(req, res, next).catch(next);
  };
}
