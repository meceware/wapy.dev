'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export const TermsOfService = () => {
  return (
    <div className='flex flex-col items-start justify-start min-h-full mx-auto max-w-4xl'>
      <h1 className='text-3xl font-bold mb-6 text-center'>Terms of Service</h1>
      <Card className='text-left'>
        <CardContent className='p-6 space-y-6'>
          <section className='space-y-4'>
            <p>
              <strong>Last updated January 17, 2025</strong>
            </p>
          </section>

          <section className='space-y-4'>
            <p>
              Welcome to the Wapy.dev website (the "Site"). By accessing or using the Site, you agree to comply with and be bound by the following terms and conditions ("Terms of Service").
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Overview</h2>
            <p>
              Wapy.dev offers this Site, including all information, tools, and services available from this Site to you, the user, conditioned upon your acceptance of all terms, conditions, policies, and notices stated here.
            </p>
            <p>
              Please read these Terms of Service carefully before accessing or using the Site. By accessing or using any part of the Site, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions of this agreement, then you may not access the Site or use any services. If these Terms of Service are considered an offer, acceptance is expressly limited to these Terms of Service.
            </p>
            <p>
              Any new features or tools which are added to the Site shall also be subject to the Terms of Service. You can review the most current version of the Terms of Service at any time on this page. Site reserves the right to update, change or replace any part of these Terms of Service by posting updates and/or changes to the Site. It is your responsibility to check this page periodically for changes. Your continued use of or access to the Site following the posting of any changes constitutes acceptance of those changes.
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Website Terms</h2>
            <p>
              By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this site.
            </p>
            <p>
              The use of our services must comply with all applicable laws and regulations. Specifically:
            </p>
            <ul className='list-disc pl-8'>
              <li>You agree not to use our products for any unlawful or unauthorized purposes</li>
              <li>You must comply with all laws in your jurisdiction, including copyright and intellectual property laws</li>
              <li>You may not transmit malicious code, viruses, or other harmful content</li>
            </ul>
            <p>
              Please note that any violation of these Terms of Service will lead to immediate termination of your access to our Services.
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Payment</h2>
            <p>
              If you purchase a subscription to the Site, you agree to pay the applicable fees as indicated during the checkout process.
            </p>
            <p>
              We use <a href='https://www.paddle.com' className='underline underline-offset-4 focus:outline-none' target='_blank' rel='noopener noreferrer'>Paddle.com</a> as our payment service provider. By making a purchase, you also agree to Paddle&apos;s <a href='https://www.paddle.com/legal/terms' className='underline underline-offset-4 focus:outline-none' target='_blank' rel='noopener noreferrer'>Terms of Service</a>. Paddle processes all payments and handles the related customer service inquiries.
            </p>
            <p>
              Site process refunds according to our <Link href='/refund-policy' className='font-medium underline underline-offset-4 focus:outline-none'>refund policy</Link>.
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Use of Cookies</h2>
            <p>
              Site uses cookies and similar technologies (such as local storage) to track your usage of the Site and for marketing purposes. By using the Site, you consent to the use of cookies in accordance with our <Link href='/privacy' className='font-medium underline underline-offset-4 focus:outline-none'>Privacy Policy</Link>.
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Intellectual Property</h2>
            <p>
              All content on the Site, including but not limited to text, graphics, logos, images, videos, and course content, is the property of the Site or its licensors and is protected by intellectual property laws. You may not reproduce, modify, distribute, or otherwise use any content on the Site without our prior written consent.
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Disclaimer</h2>
            <p>
              The information and content on the Site are provided for informational purposes only and are not intended as professional advice. Site makes no representations or warranties of any kind, express or implied, about the accuracy, reliability, completeness, or suitability of the information and content on the Site. You use the Site at your own risk.
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Limitation of Liability</h2>
            <p>
              Wapy.dev shall not be held responsible for any indirect, incidental, special, or consequential damages that may occur from your use of the Site, regardless of whether such damages arise from contract, tort, negligence, strict liability, or any other legal theory. The maximum amount Site may be liable for in any claim related to the Site is limited to the total subscription fees you have paid in the last 12 months.
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Changes to the Terms of Service</h2>
            <p>
              Site may update or modify these Terms of Service from time to time, and any changes will be effective upon posting on the Site. Your continued use of the Site after any such changes constitutes your acceptance of the revised Terms of Service.
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Wapy.dev, its affiliates, officers, directors, employees, agents, and licensors from and against any claims, liabilities, damages, losses, and expenses, including without limitation reasonable attorney&apos;s fees, arising out of or in connection with your use of the Site, your violation of these Terms of Service, or your violation of any rights of another party.
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Modifications to the Service and Prices</h2>
            <p>
              Prices for our services are subject to change without notice. Site reserves the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.
            </p>
            <p>
              Site shall not be liable to you or to any third-party for any modification, price change, suspension, or discontinuance of the Service.
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Governing Law and Jurisdiction</h2>
            <p>
              These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction where Wapy.dev is headquartered without giving effect to any principles of conflicts of law. You agree to submit to the exclusive jurisdiction of the courts in that jurisdiction for any disputes arising out of or in connection with these Terms of Service or your use of the Site.
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Entire Agreement</h2>
            <p>
              These Terms of Service constitute the entire agreement between you and Wapy.dev regarding your use of the Site and supersede all prior and contemporaneous agreements and understandings, whether oral or written, relating to the same subject matter.
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Severability</h2>
            <p>
              If any provision of these Terms of Service is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect.
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Waiver</h2>
            <p>
              The failure of Wapy.dev to enforce any right or provision of these Terms of Service shall not constitute a waiver of that right or provision.
            </p>
          </section>

          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Contact Us</h2>
            <p>
              If you have any questions or concerns about these Terms of Service, please contact us using the <Link href='/contact' className='font-medium underline underline-offset-4 focus:outline-none'>contact form</Link> on the Site.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};
