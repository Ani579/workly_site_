import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

const providers: NextAuthOptions['providers'] = [
  CredentialsProvider({
    id: 'credentials',
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      name: { label: 'Name', type: 'text' },
      role: { label: 'Role', type: 'text' },
    },
    async authorize(credentials) {
      if (!credentials?.email) return null;
      await connectDB();
      const email = credentials.email.trim().toLowerCase();
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          email,
          name: credentials.name || 'Demo User',
          role: credentials.role ? (credentials.role.toUpperCase() as any) : null,
        });
      } else if (credentials.role && !user.role) {
        user.role = credentials.role.toUpperCase() as any;
        await user.save();
      }
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image,
      };
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On initial sign-in, upsert the user in MongoDB
      if (user) {
        await connectDB();
        const dbUser = await User.findOneAndUpdate(
          { email: user.email },
          {
            $setOnInsert: {
              name: user.name ?? 'User',
              email: user.email,
              image: user.image,
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        token.userId = dbUser._id.toString();
        token.role = dbUser.role;
      }

      // On session update (after role selection), refresh role from token
      if (trigger === 'update' && session?.role) {
        token.role = session.role;
      }

      return token;
    },
    async session({ session, token }) {
      // Expose userId and role to client session
      if (session.user) {
        session.user.userId = token.userId as string;
        session.user.role = token.role as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

