'use server';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jsonwebtoken from 'jsonwebtoken';
import { SubscriptionActionMarkAsPaid } from '@/components/subscriptions/actions';
import { siteConfig } from '@/components/config';

export async function GET(request) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.json({error: 'Missing token'}, { status: 400 });
    }

    const secret = process.env.SUBSCRIPTION_JWT_SECRET;

    const decoded = jsonwebtoken.verify(token, secret);
    if (!decoded || !decoded?.id || !decoded?.userId) {
      return NextResponse.json({error: 'Invalid token!'}, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: {
        id: decoded.id,
        userId: decoded.userId,
      }
    });

    if (!subscription) {
      return NextResponse.json({error: 'Invalid token!'}, { status: 404 });
    }

    const result = await SubscriptionActionMarkAsPaid(subscription.id, subscription.userId);
    if (!result) {
      return NextResponse.json({error: 'Failed to mark as paid!'}, { status: 500 });
    }

    return NextResponse.redirect(new URL('/', siteConfig.url));
  } catch (error) {
    console.error('Error marking subscription as paid:', error);
    return NextResponse.json({error: 'Internal server error'}, { status: 500 });
  }
}