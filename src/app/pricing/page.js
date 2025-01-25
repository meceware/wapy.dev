'use server';

import { PricingTable } from '@/components/pricing-table';

const PagePricing = async () => {
  return (
    <div className='flex flex-col grow items-center justify-center w-full max-w-4xl gap-4'>
      <section className='flex flex-col gap-8'>
        <div className='flex flex-col gap-4 text-center'>
          <h1 className='font-bold text-4xl sm:text-5xl'>
            Simple, transparent pricing
          </h1>
          <p className='text-muted-foreground text-xl max-w-2xl mx-auto'>
            Track and manage all your subscriptions with powerful features at an affordable price
          </p>
        </div>

        <PricingTable />
      </section>
    </div>
  )
}

export default PagePricing;

export async function generateMetadata() {
  return {
    title: 'Pricing',
  };
};