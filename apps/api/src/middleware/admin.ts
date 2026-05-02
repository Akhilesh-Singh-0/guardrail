import { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/AppError'

const ADMIN_SET = new Set(
  (process.env.ADMIN_USER_IDS ?? '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean)
)

export const adminMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
  }

  const userId = req.user.id

  if (!ADMIN_SET.has(userId)) {
    // add logging here later
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }

  next()
}