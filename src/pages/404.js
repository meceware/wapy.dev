import React, { Fragment } from 'react';

/* SEO */
import SEO from '../components/seo';
import Layout from '../components/layout';
import Section from '../components/section';
import Link from '../components/link';

export default () => {
  return (
    <Fragment>
      <SEO />
      <Layout>
        <Section>
          <div className = 'p-1 sm:p-6 lg:p-48'>
            <div className = 'relative rounded-lg block sm:flex items-center bg-gray-100 shadow-xl'>
              <div className = 'relative w-full border-solid border-gray-400 border-b-8	sm:border-none sm:w-3/12 md:w-4/12 h-full overflow-hidden mr-0 sm:mr-16'>
                <p className = 'text-6xl text-gray-500 text-center sm:text-right'>404</p>
              </div>
              <div className = 'w-full sm:w-9/12 md:w-8/12 h-full flex items-center bg-gray-100 rounded-lg justify-center sm:justify-start'>
                <div className = 'p-8 text-center sm:text-left sm:pr-8 sm:pl-16 sm:py-8'>
                  <p className = 'text-gray-600 text-4xl'>Sorry!</p>
                  <p className = 'text-gray-600'>It looks like the page you are looking for isn&apos;t in the system.</p>
                  <Link to = '/' className = 'flex items-center justify-end mt-3 text-orange-600 hover:text-orange-600 focus:text-orange-600'>
                    <span className = 'mr-2'>Head Back Home</span>
                  </Link>
                </div>
                <svg className = 'hidden text-gray-400 sm:block absolute inset-y-0 h-full w-24 fill-current -ml-12' viewBox = '0 0 100 100' preserveAspectRatio = 'none'>
                  <polygon points = '50,0 100,0 50,100 0,100' />
                </svg>
              </div>
            </div>
          </div>
        </Section>
      </Layout>
    </Fragment>
  );
};
