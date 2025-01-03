import { ContactForm } from '@/app/contact/form';

export const metadata = {
  title: 'Contact Us',
};

export default function PageContact() {
  return (
    <div className='flex flex-col grow justify-center items-center'>
      <ContactForm />
    </div>
  );
}
