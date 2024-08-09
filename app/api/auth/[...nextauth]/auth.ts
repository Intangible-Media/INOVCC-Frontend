// src/app/api/auth/[...nextauth]/auth.ts

import { NextAuthOptions, Session } from "next-auth"; // Importing NextAuthOptions and Session types
import { JWT } from "next-auth/jwt"; // Importing JWT type
import CredentialsProvider from "next-auth/providers/credentials"; // Importing the credentials provider
import axios from "axios"; // Importing axios for making HTTP requests

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface ExtendedUser extends User {
  jwt?: string;
  user?: any;
}

interface ExtendedToken extends JWT {
  accessToken?: string;
  user?: ExtendedUser;
}

interface ExtendedSession extends Session {
  accessToken?: string;
  user?: ExtendedUser;
}

export const authOptions: NextAuthOptions = {
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
          const loginResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local`,
            {
              identifier: credentials.username,
              password: credentials.password,
            }
          );

          const userId = loginResponse.data.user.id;

          if (userId) {
            const userDetailsResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/${userId}?populate=role,picture`,
              {
                headers: {
                  Authorization: `Bearer ${loginResponse.data.jwt}`,
                },
              }
            );

            const pictureUrl = userDetailsResponse.data.picture?.url || null;

            const userWithRoleAndPicture = {
              ...loginResponse.data,
              user: {
                ...loginResponse.data.user,
                role: userDetailsResponse.data.role,
                picture: pictureUrl
                  ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${pictureUrl}`
                  : null,
              },
            };

            return userWithRoleAndPicture;
          } else {
            return null;
          }
        } catch (e) {
          const errorMessage =
            e.response?.data?.message[0]?.messages[0]?.message ||
            "An error occurred during login.";
          console.error("Login error:", e);
          throw new Error(errorMessage);
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
    async jwt({ token, user: rawUser, account }) {
      const user = rawUser as ExtendedUser;
      const extendedToken = token as ExtendedToken;
      if (account && user) {
        if (user.jwt) {
          extendedToken.accessToken = user.jwt;
        }
        if (user.user) {
          extendedToken.user = user.user;
        }
        if (user.user.role) {
          extendedToken.role = user.user.role.name;
        }
        if (user.user.picture) {
          extendedToken.user.picture = user.user.picture;
        }
      }
      return extendedToken;
    },
    async session({ session, token }) {
      const extendedSession = session as ExtendedSession;
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
};
