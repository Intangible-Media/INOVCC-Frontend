import NextAuth, { NextAuthOptions, Session, User as NextAuthUser } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string; // Added picture field
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

export const authOptions:NextAuthOptions = {
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
          // Step 1: Authenticate the user and get the user ID
          const loginResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local`,
            {
              identifier: credentials.username,
              password: credentials.password,
            }
          );

          const userId = loginResponse.data.user.id;

          if (userId) {
            // Step 2: Fetch detailed user information, including role and picture
            const userDetailsResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/${userId}?populate=role,picture`, // Populate role and picture
              {
                headers: {
                  Authorization: `Bearer ${loginResponse.data.jwt}`,
                },
              }
            );

            // Extract picture URL if it exists
            const pictureUrl = userDetailsResponse.data.picture?.url || null;
            console.log("USER INFORMATION", userDetailsResponse.data.picture?.url);

            // Combine login response and detailed user information as needed
            const userWithRoleAndPicture = {
              ...loginResponse.data,
              user: {
                ...loginResponse.data.user,
                role: userDetailsResponse.data.role, // Assuming Strapi v4 structure
                picture: pictureUrl ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${pictureUrl}` : null, // Ensure full URL
              },
            };

            console.log("response", userWithRoleAndPicture);
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
      // Your signIn logic here
      return true;
    },
    async jwt({ token, user: rawUser, account }) {
      const user = rawUser as ExtendedUser;
      const extendedToken = token as ExtendedToken; // Use the ExtendedToken type
      if (account && user) {
        console.log("account", account);
        console.log("user", user);
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
          extendedToken.user.picture = user.user.picture; // Add picture to token
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
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
