import { ProtectedRoute } from '@/components/auth/protected-route';

export const metadata = {
  title: 'New Subscription',
};

export default function PageNewSubscription() {
  return (
    <ProtectedRoute requireAuth={ true }>
      <></>
    </ProtectedRoute>
  );
}
