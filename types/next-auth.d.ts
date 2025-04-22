import NextAuth from "next-auth"
import { Role } from "@prisma/client"

declare module "next-auth" {
  interface User {
    role: Role
    teamId?: string
  }

  interface Session {
    user: User & {
      role: Role
      teamId?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role
    teamId?: string
  }
} 