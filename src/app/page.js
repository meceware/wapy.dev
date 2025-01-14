'use server';

import { auth } from '@/lib/auth';
import { HomeVisitor } from "@/components/home-visitor";
import { HomeMember } from '@/components/home-member';


export default async function PageHome() {
  const session = await auth();

  if (!session || !session.user) {
    return <HomeVisitor />;
  }

  return <HomeMember userId={ session.user.id }/>;
}
