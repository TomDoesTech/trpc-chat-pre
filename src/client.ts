import { createWSClient, wsLink } from "@trpc/client/links/wsLink"
import { httpBatchLink } from "@trpc/client/links/httpBatchLink"
import { AppRouter } from "./server/router"
import { createTRPCClient } from "@trpc/client"

// create persistent WebSocket connection
const wsClient = createWSClient({
  url: `ws://localhost:3001`,
})

// configure TRPCClient to use WebSockets transport
const client = createTRPCClient<AppRouter>({
  links: [
    wsLink({
      client: wsClient,
    }),
  ],
})
