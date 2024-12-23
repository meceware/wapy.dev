'use client';

import { Card, CardContent } from '@/components/ui/card';

export const PrivacyPolicy = () => {
  return (
    <div className='flex flex-col items-start justify-start min-h-full mx-auto max-w-4xl'>
      <h1 className='text-3xl font-bold mb-6 text-center'>Privacy Policy</h1>
      <Card className='text-left'>
        <CardContent className='p-6 space-y-6'>
          <section>
            <h2 className='text-2xl font-semibold mb-3'>Introduction</h2>
            <p className='text-muted-foreground'>
              We are committed to protecting your privacy and ensuring the security of your personal information.
              This Privacy Policy explains how we collect, use, and safeguard your data when you use our subscription and expense management service.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3'>Information We Collect</h2>
            <p className='text-muted-foreground mb-2'>
              We collect only the necessary information required to provide you with our services:
            </p>
            <ul className='list-disc pl-6 text-muted-foreground'>
              <li>Account registration information (email)</li>
              <li>Subscription management data</li>
              <li>Expense tracking information</li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3'>How We Use Your Information</h2>
            <p className='text-muted-foreground mb-2'>
              Your information is used exclusively for:
            </p>
            <ul className='list-disc pl-6 text-muted-foreground'>
              <li>Providing and maintaining our services</li>
              <li>Managing your account and subscriptions</li>
              <li>Sending important service updates</li>
              <li>Improving our services through anonymous usage analysis</li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3'>Data Protection</h2>
            <p className='text-muted-foreground'>
              We implement robust security measures to protect your personal information.
              We never share your data with third parties and maintain strict data protection protocols
              to prevent unauthorized access, disclosure, or misuse of your information.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3'>Analytics</h2>
            <p className='text-muted-foreground'>
              We use a custom analytics tool to improve our services. This tool collects anonymous usage data
              to help us understand how users interact with our platform and enhance the user experience.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3'>Your Rights</h2>
            <p className='text-muted-foreground mb-2'>
              You have the right to:
            </p>
            <ul className='list-disc pl-6 text-muted-foreground'>
              <li>Access your personal data</li>
              <li>Request corrections to your data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of non-essential data collection</li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3'>Contact Us</h2>
            <p className='text-muted-foreground'>
              If you have any questions about our Privacy Policy or how we handle your data,
              please contact us through our support channels.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-3'>Updates to This Policy</h2>
            <p className='text-muted-foreground'>
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the effective date.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};
