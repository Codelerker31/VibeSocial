import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const isLoggedIn = !!token;
      const path = req.nextUrl.pathname;

      if (path.startsWith('/admin')) {
        // Check for admin email
        // For MVP, we can hardcode or use env var. 
        // Using a specific email for now or checking env.
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@devsocial.com';
        return isLoggedIn && token?.email === adminEmail;
      }

      const isOnDashboard = path.startsWith('/dashboard');
      const isOnSubmit = path.startsWith('/submit');
      const isOnSettings = path.startsWith('/settings');

      if (isOnDashboard || isOnSubmit || isOnSettings) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }
      return true;
    },
  },
});

export const config = {
  matcher: ['/dashboard/:path*', '/submit/:path*', '/settings/:path*', '/admin/:path*'],
};
