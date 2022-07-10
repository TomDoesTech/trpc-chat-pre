import * as trpc from "@trpc/server"
import { serialize } from "cookie"
import { randomUUID } from "crypto"
import { createRouter } from "./context"
import { Message, sendMessageSchema } from "../../constants/schema"
import { Events } from "../../constants/events"

export const roomRouter = createRouter()
  .mutation("sendMessage", {
    input: sendMessageSchema,
    resolve({ input, ctx }) {
      const { ee } = ctx

      const message = {
        ...input,
        id: randomUUID(),
        user: ctx.session?.user,
        sentAt: new Date(),
      }

      ee.emit(Events.SEND_MESSAGE, message)
      return message
    },
  })
  .subscription("onSendMessage", {
    resolve({ ctx }) {
      const { ee } = ctx

      // `resolve()` is triggered for each client when they start subscribing `onAdd`

      // return a `Subscription` with a callback which is triggered immediately
      return new trpc.Subscription<Message>((emit) => {
        const onSendMessage = (data: Message) => {
          // emit data to client
          emit.data(data)
        }

        // trigger `onAdd()` when `add` is triggered in our event emitter
        ee.on(Events.SEND_MESSAGE, onSendMessage)

        // unsubscribe function when client disconnects or stops subscribing
        return () => {
          ee.off(Events.SEND_MESSAGE, onSendMessage)
        }
      })
    },
  })
