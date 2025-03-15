import { notFound } from 'next/navigation';

export default function PageView() {
  return notFound();
}

export const metadata = {
  title: 'Page Not Found',
};