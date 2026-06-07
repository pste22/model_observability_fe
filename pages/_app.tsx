import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { AuthProvider, useAuth } from '../lib/auth';

const PUBLIC_ROUTES = ['/login'];

function Gate({ Component, pageProps }: Pick<AppProps, 'Component' | 'pageProps'>) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isPublic = PUBLIC_ROUTES.includes(router.pathname);

  // While resolving the session, or while redirecting an unauthenticated user
  // away from a protected page, render nothing to avoid flashing dashboards.
  if (loading || (!user && !isPublic)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Loading…
      </div>
    );
  }

  return <Component {...pageProps} />;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Gate Component={Component} pageProps={pageProps} />
    </AuthProvider>
  );
}
