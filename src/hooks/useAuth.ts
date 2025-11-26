import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  return {
    session,
    user: session?.user,
    loading,
    isAuthenticated,
    status,
  };
}

export function useRequireAuth(redirectUrl = '/login') {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, loading, router, redirectUrl]);

  return { isAuthenticated, loading };
}
