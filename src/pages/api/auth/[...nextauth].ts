import NextAuth from "next-auth"
import { AppProviders } from "next-auth/providers"
import CredentialsProvider from "next-auth/providers/credentials"

const providers: AppProviders = [
  CredentialsProvider({
    id: "credentials",
    name: "Login",
    async authorize(credentials) {
      const user = {
        id: credentials?.name,
        name: credentials?.name,
      }
      return user
    },
    credentials: {
      name: { type: "text" },
    },
  }),
]

export default NextAuth({
  // Configure one or more authentication providers
  providers,
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
})
