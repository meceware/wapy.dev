'use server';

import { HomeVisitor } from '@/components/home-visitor';
import HomeMember from '@/components/home-member';
import { paddleGetSession } from '@/lib/paddle/status';
import { SubscriptionGuard } from '@/components/subscription-guard';

export default async function PageHome() {
  const { session, paddleStatus } = await paddleGetSession();

  if (!session || !session.user) {
    return <HomeVisitor />;
  }

  return (
    <SubscriptionGuard paddleStatus={paddleStatus}>
      <HomeMember userId={ session.user.id } externalServices={session.user?.externalServices || {}}/>
    </SubscriptionGuard>
  );
}
