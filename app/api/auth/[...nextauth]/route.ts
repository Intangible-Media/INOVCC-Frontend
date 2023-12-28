import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

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
          // Add logic here to look up the user from the credentials supplied
          const res = await axios.post(
            `http://localhost:1337/api/auth/local`,
            {
              identifier: credentials.username,
              password: credentials.password,
            }
          );

          if (res.data) {
            // Any object returned will be saved in `user` property of the JWT
            return res.data;
          } else {
            // If you return null or false then the credentials will be rejected
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
      // Handle sign in and return true if the user is authenticated,
      // false otherwise. This is where you'd handle the Strapi JWT.
      return true;
    },
    async jwt({ token, user, account, profile }) {
      // This is called whenever a JWT is created or updated
      if (account && user) {
        console.log(user)
        // console.log(account)
        // console.log(token)
        // console.log(profile)
        token.accessToken = user.jwt; // Store the JWT from Strapi in the token
        token.user = user.user; // Store the user details in the token
      }
      return token;
    },
    
    async session({ session, token }) {
      // This is called whenever a session is checked
      session.accessToken = token.accessToken; // Attach the JWT token to the session
      session.user = token.user; // Attach the user details to the session
      return session;
    },
  },
});

export { handler as GET, handler as POST }