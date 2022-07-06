// src/server/router/context.ts
import ws from "ws"
import { EventEmitter } from "events"
import * as trpc from "@trpc/server"
import { NodeHTTPCreateContextFnOptions } from "@trpc/server/adapters/node-http"
import * as trpcNext from "@trpc/server/adapters/next"
import { prisma } from "../db/client"
import { IncomingMessage } from "http"
import { parse } from "cookie"
import { NextApiRequest } from "next"

// create a global event emitter (could be replaced by redis, etc)
const ee = new EventEmitter()

function getYourId(req: NextApiRequest | IncomingMessage) {
  const cookies = parse(req.headers.cookie || "")

  if (cookies.yourId) {
    return cookies.yourId
  }

  return null
}

export const createContext = ({
  req,
  res,
}:
  | trpcNext.CreateNextContextOptions
  | NodeHTTPCreateContextFnOptions<IncomingMessage, ws>) => {
  return {
    req,
    res,
    prisma,
    ee,
    yourId: getYourId(req),
  }
}

type Context = trpc.inferAsyncReturnType<typeof createContext>

export const createRouter = () => trpc.router<Context>()
