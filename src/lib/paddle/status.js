'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addMonths, differenceInDays, isPast } from 'date-fns';
import { PADDLE_STATUS_MAP, TRIAL_DURATION_MONTHS } from './enum';

export const paddleGetStatus = async (user) => {
  const status = {
    // If API key is not set, it means it's self hosted so
    // Don't enable anything
    enabled: process.env.PADDLE_API_KEY ? true : false,
    now: new Date(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

    status: PADDLE_STATUS_MAP.none,
    nextPaymentAt: null,
    remainingDays: 0,
    scheduledChange: null,

    // Paddle configuration parameters
    environment: '',
    clientToken: '',
    priceId: '',
  };

  // If there is no user or the API key is not set, return the status
  if (!user || !status.enabled) {
    return status;
  }

  // If the user is blocked, set it to blocked
  if (user.isBlocked) {
    return {
      ...status,
      status: PADDLE_STATUS_MAP.blocked,
    };
  }

  if (user.fullAccess) {
    return {
      ...status,
      status: PADDLE_STATUS_MAP.full,
    };
  }

  // Check if the user has a subscription now or in the past
  if (user?.paddleUserDetails && user.paddleUserDetails.subId && user.paddleUserDetails.subStatus !== 'none') {
    return {
      ...status,
      status: user.paddleUserDetails.subStatus,
      nextPaymentAt: user.paddleUserDetails?.subNextPaymentAt,
      remainingDays: user.paddleUserDetails?.subNextPaymentAt ? differenceInDays(user.paddleUserDetails.subNextPaymentAt, status.now) : 0,
      scheduledChange: user.paddleUserDetails?.subScheduledChange,

      // Paddle configuration parameters
      environment: process.env.NEXT_PUBLIC_PADDLE_ENV ?? '',
      clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? '',
      priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID ?? '',
    };
  }

  // We are on trial mode, check the trial status
  const trialStartedAt = user.trialStartedAt;
  const trialEndDate = addMonths(new Date(trialStartedAt), TRIAL_DURATION_MONTHS);
  const trialIsActive = !isPast(trialEndDate);
  return {
    ...status,
    status: trialIsActive ? PADDLE_STATUS_MAP.trialActive : PADDLE_STATUS_MAP.trialExpired,
    nextPaymentAt: trialEndDate,
    remainingDays: trialIsActive ? differenceInDays(trialEndDate, status.now) : 0,
    scheduledChange: null,

    // Paddle configuration parameters
    environment: process.env.NEXT_PUBLIC_PADDLE_ENV ?? '',
    clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? '',
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID ?? '',
  };
};

export const paddleGetSession = async () => {
  const session = await auth();
  if (!session || !session?.user?.id) {
    return {
      session: session,
      user: null,
      paddleStatus: null,
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    omit: {
      id: true,
    },
    include: {
      categories: {
        select: {
          id: true,
          name: true,
          color: true,
        },
        orderBy: {
          name: 'asc'
        },
      },
      paddleUserDetails: {
        select: {
          customerStatus: true,
          subId: true,
          subStatus: true,
          subStartedAt: true,
          subNextPaymentAt: true,
          subScheduledChange: true,
        },
      },
    },
  });

  const paddleStatus = await paddleGetStatus(user);

  return {
    session,
    user,
    paddleStatus,
  };
};
