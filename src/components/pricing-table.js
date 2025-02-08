'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const PricingTable = () => {
  return (
    <div className='container mx-auto'>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
        <Card className='relative overflow-hidden border-2 border-primary bg-primary/5 sm:col-span-1 md:col-span-2 flex flex-col'>
          <CardHeader>
            <CardTitle className='text-2xl font-bold'>Enjoy</CardTitle>
            <CardDescription className='text-sm'>
              Perfect for a hassle-free experience
            </CardDescription>
            <div>
              <span className='text-4xl font-bold'>€1.5</span>
              <span className='text-sm text-muted-foreground'> +tax/month</span>
            </div>
          </CardHeader>
          <CardContent className='flex flex-col gap-2 text-left grow'>
            <div className='grid md:grid-cols-2 gap-2'>
              {[
                'Unlimited Subscriptions',
                'Email & Push Notifications',
                'Reports & Insights',
                'Premium Support',
                'First Month Free',
                'Priority Feature Requests'
              ].map((feature) => (
                <div key={feature} className='flex items-center gap-2'>
                  <Icons.check className='h-5 w-5 text-primary' />
                  <span className='text-sm'>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className='flex justify-center items-end'>
            <Button size='lg' className='w-full md:w-auto' asChild>
              <Link href='/login'>
                Get Started
                <Icons.arrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className='relative overflow-hidden border-2 hover:border-primary/50 transition-all md:col-span-1 flex flex-col'>
          <CardHeader>
            <CardTitle className='text-2xl font-bold'>Self Hosted</CardTitle>
            <CardDescription className='text-sm'>
              Perfect for self-hosters
            </CardDescription>
            <div>
              <span className='text-4xl font-bold'>Free</span>
              <span className='text-sm text-muted-foreground'> forever</span>
            </div>
          </CardHeader>
          <CardContent className='flex flex-col gap-2 text-left grow'>
            <>
              {[
                'Your Infrastructure',
                'Source Code Access',
                'Community Support'
              ].map((feature) => (
                <div key={feature} className='flex items-center gap-2'>
                  <Icons.check className='h-5 w-5 text-primary' />
                  <span className='text-sm'>{feature}</span>
                </div>
              ))}
            </>
          </CardContent>
          <CardFooter className='flex justify-center items-end'>
            <Button variant='outline' size='lg' className='w-full' asChild>
              <Link href='https://github.com/meceware/wapy.dev' target='_blank' rel='noopener noreferrer'>
                <Icons.github className='mr-2 h-4 w-4' />
                View on GitHub
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
