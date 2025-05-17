'use server';

import jsonwebtoken from 'jsonwebtoken';

export const sendWebhook = async (url, data) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: jsonwebtoken.sign(data, process.env.SUBSCRIPTION_JWT_SECRET) }),
    });

    if (!response.ok || response.status !== 200) {
      console.warn('Error sending webhook:', response.status);
      return false;
    }

    const responseData = await response.json();
    return responseData?.success ? true : false;
  } catch (error) {
    console.warn('Error sending webhook:', error);
    return false;
  }
};
