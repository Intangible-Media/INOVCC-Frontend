import NextAuth, { Session, User as NextAuthUser } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  // add other user properties here
}

interface ExtendedUser extends User {
  jwt?: string;
  user?: any; // Replace 'any' with a more specific type if you know the structure
}

// Extending the NextAuth Token type
interface ExtendedToken extends JWT {
  accessToken?: string;
  user?: ExtendedUser;
}

// Extending the NextAuth Session type
interface ExtendedSession extends Session {
  accessToken?: string;
  user?: ExtendedUser;
}

const handler = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local`,
            {
              identifier: credentials.username,
              password: credentials.password,
            }
          );

          if (res.data) {
            return res.data;
          } else {
            return null;
          }
        } catch (e) {
          const errorMessage =
            e.response?.data?.message[0]?.messages[0]?.message ||
            "An error occurred during login.";
          throw new Error(errorMessage);
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Your signIn logic here
      return true;
    },
    async jwt({ token, user: rawUser, account }) {
      const user = rawUser as ExtendedUser;
      const extendedToken = token as ExtendedToken; // Use the ExtendedToken type
      if (account && user) {
        if (user.jwt) {
          extendedToken.accessToken = user.jwt;
        }
        if (user.user) {
          extendedToken.user = user.user;
        }
      }
      return extendedToken;
    },
    async session({ session, token }) {
      const extendedSession = session as ExtendedSession; // Use the ExtendedSession type
      const extendedToken = token as ExtendedToken;
      if (extendedToken.accessToken) {
        extendedSession.accessToken = extendedToken.accessToken;
      }
      if (extendedToken.user) {
        extendedSession.user = extendedToken.user;
      }
      return extendedSession;
    },
  },
});

export { handler as GET, handler as POST };
