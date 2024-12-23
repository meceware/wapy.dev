import { ProtectedRoute } from '@/components/auth/protected-route';

export const metadata = {
  title: 'Subscription Report',
};

export default function PageReports() {
  return (
    <ProtectedRoute requireAuth={ true }>
      <></>
    </ProtectedRoute>
  );
}
