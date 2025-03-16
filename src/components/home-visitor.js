'use client'

import Image from 'next/image'
import { Icons } from '@/components/icons';
import { PricingTable } from '@/components/pricing-table';
import { siteConfig } from '@/components/config';

export const HomeVisitor = () => {
  return (
    <div className='flex flex-col grow mx-auto gap-24 w-full justify-center items-center'>
      {/* Hero Section */}
      <div className='flex flex-col items-center text-center gap-6'>
        <div className='inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4'>
          ✨ Want to take control of your expenses?
        </div>
        <h1 className='text-3xl md:text-6xl font-bold tracking-tight'>
          Smart Subscription Management Made Easy
        </h1>
        <h2 className='text-xl text-muted-foreground-light max-w-4xl'>
          {siteConfig.name} helps you track subscriptions, monitor recurring expenses, and get payment reminders in one powerful and human readable dashboard.
        </h2>
        <h3 className='text-xl text-muted-foreground-light font-semibold max-w-4xl'>
          Get notified and never miss a payment again.
        </h3>
        <div className='w-full max-w-4xl'>
          <PricingTable />
        </div>
        <Image src='/images/banner.png' alt='Hero' width={960} height={600} />
      </div>

      <div className='flex flex-col gap-6'>
        <div className='text-center'>
          <h2 className='text-3xl font-bold mb-4'>Powerful Features</h2>
          <p className='text-muted-foreground max-w-2xl mx-auto'>
            Everything you need to manage your subscriptions effectively
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div className='p-6 rounded-lg border bg-card shadow-lg'>
            <div className='flex flex-col items-center gap-4 mb-4'>
              <Icons.repeat className='size-5 text-primary' />
              <h3 className='font-semibold text-xl'>Flexible Billing Cycles</h3>
            </div>
            <p className='text-muted-foreground'>
              Support for monthly, yearly, and custom billing intervals
            </p>
          </div>

          <div className='p-6 rounded-lg border bg-card shadow-lg'>
            <div className='flex flex-col items-center gap-4 mb-4'>
              <Icons.bell className='size-5 text-primary' />
              <h3 className='font-semibold text-xl'>Smart Notifications</h3>
            </div>
            <p className='text-muted-foreground'>
              Get timely reminders for payments and trial ends
            </p>
          </div>

          <div className='p-6 rounded-lg border bg-card shadow-lg'>
            <div className='flex flex-col items-center gap-4 mb-4'>
              <Icons.pieChart className='size-5 text-primary' />
              <h3 className='font-semibold text-xl'>Reports & Insights</h3>
            </div>
            <p className='text-muted-foreground'>
              Track your spending with detailed reports and insights
            </p>
          </div>

          <div className='p-6 rounded-lg border bg-card shadow-lg'>
            <div className='flex flex-col items-center gap-4 mb-4'>
              <Icons.currency className='size-5 text-primary' />
              <h3 className='font-semibold text-xl'>Multiple Currencies</h3>
            </div>
            <p className='text-muted-foreground'>
              Support for multiple currencies with real-time cost tracking
            </p>
          </div>

          <div className='p-6 rounded-lg border bg-card shadow-lg'>
            <div className='flex flex-col items-center gap-4 mb-4'>
              <Icons.globe className='size-5 text-primary' />
              <h3 className='font-semibold text-xl'>Timezone Support</h3>
            </div>
            <p className='text-muted-foreground'>
              Track subscriptions across different timezones with automatic date conversions
            </p>
          </div>

          <div className='p-6 rounded-lg border bg-card shadow-lg'>
            <div className='flex flex-col items-center gap-4 mb-4'>
              <Icons.tag className='size-5 text-primary' />
              <h3 className='font-semibold text-xl'>Category Management</h3>
            </div>
            <p className='text-muted-foreground'>
              Organize subscriptions with custom categories and color coding
            </p>
          </div>
        </div>
      </div>

      <div className='flex flex-col gap-6'>
        <div className='text-center'>
          <h2 className='text-3xl font-bold mb-4'>How Wapy Works</h2>
          <p className='text-muted-foreground max-w-2xl mx-auto'>
            Get started in minutes
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div className='text-center space-y-4'>
            <div className='w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-xl font-bold'>
              1
            </div>
            <h3 className='font-semibold text-xl'>Sign Up & Login</h3>
            <p className='text-muted-foreground'>
              Create an account or login to start tracking your expenses
            </p>
          </div>
          <div className='text-center space-y-4'>
            <div className='w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-xl font-bold'>
              2
            </div>
            <h3 className='font-semibold text-xl'>Set Up Notifications</h3>
            <p className='text-muted-foreground'>
              Customize alerts for upcoming payments and trial end dates via email and push notifications
            </p>
          </div>
          <div className='text-center space-y-4'>
            <div className='w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-xl font-bold'>
              3
            </div>
            <h3 className='font-semibold text-xl'>Track & Optimize</h3>
            <p className='text-muted-foreground'>
              Monitor spending patterns and get insights to reduce unnecessary subscription costs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
