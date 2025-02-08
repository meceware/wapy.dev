'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export const PrivacyPolicy = () => {
  return (
    <div className='flex flex-col items-start justify-start min-h-full mx-auto max-w-4xl'>
      <h1 className='text-3xl font-bold mb-6 text-center'>Privacy Policy</h1>
      <Card className='text-left'>
        <CardContent className='p-6 space-y-6'>
          <section className='space-y-4'>
            <p>
              <strong>Last updated January 17, 2025</strong>
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Introduction</h2>
            <p>
              We are committed to protecting your privacy and ensuring the security of your personal information.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, and safeguard your data when you use our subscription and expense management service.
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Information We Collect</h2>
            <p>
              We collect only the necessary information required to provide you with our services:
            </p>
            <ul className='list-disc pl-8'>
              <li>Account information</li>
              <li>Subscription and expense management data</li>
              <li>Expense tracking information</li>
            </ul>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>How We Use Your Information</h2>
            <p>
              Your information is used exclusively for:
            </p>
            <ul className='list-disc pl-8'>
              <li>Providing and maintaining our services</li>
              <li>Managing your account and subscriptions</li>
              <li>Sending important service updates</li>
              <li>Improving our services through anonymous usage analysis</li>
            </ul>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Payment Processing</h2>
            <p>
              We use <a href='https://www.paddle.com' className='underline underline-offset-4 focus:outline-hidden' target='_blank' rel='noopener noreferrer'>Paddle.com</a> as our payment processing system. When you make a payment, your payment information is collected and processed directly by Paddle. We do not store your payment details on our servers. For information about how Paddle processes your data, please refer to <a href='https://www.paddle.com/legal/privacy' className='underline underline-offset-4 focus:outline-hidden' target='_blank' rel='noopener noreferrer'>Paddle&apos;s Privacy Policy</a>.
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Data Protection</h2>
            <p>
              We implement robust security measures to protect your personal information.
              We never share your data with third parties and maintain strict data protection protocols
              to prevent unauthorized access, disclosure, or misuse of your information.
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Analytics</h2>
            <p>
              We use a custom analytics tool to improve our services. This tool collects anonymous usage data
              to help us understand how users interact with our platform and enhance the user experience.
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul className='list-disc pl-8'>
              <li>Access your personal data</li>
              <li>Request corrections to your data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of non-essential data collection</li>
            </ul>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Contact Us</h2>
            <p>
              If you have any questions about our Privacy Policy or how we handle your data, please contact us using the <Link href='/contact' className='font-medium underline underline-offset-4 focus:outline-hidden'>contact form</Link>.
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Updates to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the effective date.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};
