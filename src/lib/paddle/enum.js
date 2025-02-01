export const PADDLE_STATUS_MAP = {
  none: 'none',
  full: 'full',
  blocked: 'blocked',
  // Paddle statuses
  // https://developer.paddle.com/webhooks/subscriptions/subscription-created
  active: 'active',
  cancelled: 'canceled',
  past_due: 'past_due',
  paused: 'paused',
  trialActive: 'trialing',
  trialExpired: 'trial_expired',
};

export const TRIAL_DURATION_MONTHS = 1;

export const paddleIsValid = (status) => {
  return [
    PADDLE_STATUS_MAP.full,
    PADDLE_STATUS_MAP.active,
    PADDLE_STATUS_MAP.trialActive,
  ].includes(status);
};