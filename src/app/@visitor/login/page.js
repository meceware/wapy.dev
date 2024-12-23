'use server';

import { SignInForm } from './signin-form';

export default async function PageLoginVisitor() {
  return (
    <div className='flex flex-col grow justify-center items-center'>
      <SignInForm />
    </div>
  );
}