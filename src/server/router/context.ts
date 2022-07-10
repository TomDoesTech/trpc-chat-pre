// src/server/router/context.ts
import ws from "ws"
import { EventEmitter } from "events"
import * as trpc from "@trpc/server"
import { NodeHTTPCreateContextFnOptions } from "@trpc/server/adapters/node-http"
import * as trpcNext from "@trpc/server/adapters/next"
import { getSession } from "next-auth/react"
import { prisma } from "../db/client"
import { IncomingMessage } from "http"

// create a global event emitter (could be replaced by redis, etc)
const ee = new EventEmitter()

export const createContext = async ({
  req,
  res,
}:
  | trpcNext.CreateNextContextOptions
  | NodeHTTPCreateContextFnOptions<IncomingMessage, ws>) => {
  const session = await getSession({ req })

  console.log("createContext for", session?.user?.name ?? "unknown user")

  return {
    req,
    res,
    prisma,
    ee,
    session,
  }
}

type Context = trpc.inferAsyncReturnType<typeof createContext>

export const createRouter = () => trpc.router<Context>()
