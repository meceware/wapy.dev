'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export const RefundPolicy = () => {
  return (
    <div className='flex flex-col items-start justify-start min-h-full mx-auto max-w-4xl'>
      <h1 className='text-3xl font-bold mb-6 text-center'>Refund Policy</h1>
      <Card className='text-left'>
        <CardContent className='p-6 space-y-6'>
          <section className='space-y-4'>
            <p>
              <strong>Last updated January 17, 2025</strong>
            </p>
          </section>

          <section className='space-y-4'>
            <p>
              Bad refund policies are infuriating. You feel like the company is just trying to rip you off. We never want our customers to feel that way, so our refund policy is simple: If you&apos;re ever unhappy for any reason, just <Link href='/contact' className='font-medium underline underline-offset-4 focus:outline-none'>contact us</Link> and tell us what&apos;s up, and we&apos;ll work with you to make sure you&apos;re happy.
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-xl font-semibold'>Examples of full refunds</h2>
            <ul className='list-disc pl-8'>
              <li>If you were just charged for your next month of service but you meant to cancel, we&apos;re happy to refund that extra charge</li>
            </ul>
          </section>

          <section className='space-y-4'>
            <h2 className='text-xl font-semibold'>Examples of partial refunds</h2>
            <ul className='list-disc pl-8'>
              <li>If you were charged for a month of service but you only used it for a week, we&apos;ll refund the difference</li>
              <li>If you were charged for a year of service but you only used it for a month, we&apos;ll refund the difference</li>
              <li>If you were charged for a month of service but you only used it for a week, we&apos;ll refund the difference</li>
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};
