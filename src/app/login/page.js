import { ProtectedRoute } from '@/components/auth/protected-route';

export const metadata = {
  title: 'Sign In',
};

export default function PageLogin() {
  return (
    <ProtectedRoute requireAuth={ false }>
      <></>
    </ProtectedRoute>
  );
}
