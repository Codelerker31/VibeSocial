import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const isLoggedIn = !!token;
      const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard');
      const isOnSubmit = req.nextUrl.pathname.startsWith('/submit');
      const isOnSettings = req.nextUrl.pathname.startsWith('/settings');

      if (isOnDashboard || isOnSubmit || isOnSettings) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }
      return true;
    },
  },
});

export const config = {
  matcher: ['/dashboard/:path*', '/submit/:path*', '/settings/:path*'],
};
