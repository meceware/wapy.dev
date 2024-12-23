import { ProtectedRoute } from '@/components/auth/protected-route';

export const metadata = {
  title: 'Account',
};

export default function PageAccount() {
  return (
    <ProtectedRoute requireAuth={ true }>
      <></>
    </ProtectedRoute>
  );
}
