import { Request, Response } from 'express'
import { prisma } from '../../config/prisma'
import { AppError } from '../../lib/AppError'

const getUserId = (
  req: Request
): string => {
  const userId = req.user?.id

  if (!userId) {
    throw new AppError(
      'Unauthorized',
      401,
      'UNAUTHORIZED'
    )
  }

  return userId
}

export const getAlerts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = getUserId(req)

  const alerts =
    await prisma.alert.findMany({
      where: { userId },

      orderBy: {
        createdAt: 'desc'
      }
    })

  res.status(200).json({ alerts })
}

export const createAlert = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = getUserId(req)

  const {
    type,
    threshold
  } = req.body

  if (
    !type ||
    threshold === undefined
  ) {
    throw new AppError(
      'type and threshold are required',
      400,
      'INVALID_BODY'
    )
  }

  const alert =
    await prisma.alert.upsert({
      where: {
        userId_type: {
          userId,
          type
        }
      },

      update: {
        threshold
      },

      create: {
        userId,
        type,
        threshold
      }
    })

  res.status(201).json({ alert })
}

export const deleteAlert = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = getUserId(req)

  const deleted =
    await prisma.alert.deleteMany({
      where: {
        id: req.params.id,
        userId
      }
    })

  if (deleted.count === 0) {
    throw new AppError(
      'Alert not found',
      404,
      'ALERT_NOT_FOUND'
    )
  }

  res.status(200).json({
    message: 'Alert deleted'
  })
}

export const resolveAlert = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = getUserId(req)

  const updated =
    await prisma.alert.updateMany({
      where: {
        id: req.params.id,
        userId
      },

      data: {
        triggered: false,
        triggeredAt: null
      }
    })

  if (updated.count === 0) {
    throw new AppError(
      'Alert not found',
      404,
      'ALERT_NOT_FOUND'
    )
  }

  res.status(200).json({
    message: 'Alert resolved'
  })
}