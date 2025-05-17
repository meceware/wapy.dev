'use server';

import { NextResponse } from 'next/server';
import jsonwebtoken from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { token } = await request.json();
    const secret = process.env.SUBSCRIPTION_JWT_SECRET;
    const data = jsonwebtoken.verify(token, secret);

    if (!data || !data?.event) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    // console.log('Received webhook data:', data);

    // Process the webhook data
    // Example: Handle different event types
    switch (data.event) {
      case 'verify':
        // Handle verification event
        // console.log('Test event received');
        break;

      case 'payment_due_now':
        // Handle subscription created event
        // console.log('Payment notification is received:', data.title, data.message, data.markAsPaidUrl, data.url);
        break;

      case 'payment_due_upcoming':
        // Handle subscription updated event
        // console.log('Upcoming payment notification is received:', data.title, data.message, data.markAsPaidUrl, data.url);
        break;

      default:
        console.warn('Unhandled event type:', data.event);
        return NextResponse.json({ success: false, message: 'Unhandled event type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ success: false, message: 'Error processing webhook' }, { status: 500 });
  }
}