import * as trpc from "@trpc/server"
import { serialize } from "cookie"
import { nanoid } from "nanoid"
import { createRouter } from "./context"
import {
  joinRoomInput,
  Message,
  sendMessageSchema,
  onUserJoinedInputSchema,
  sendCallOfferInputSchema,
  CallOffer,
} from "../../constants/schema"
import { Events } from "../../constants/events"

const users = {}

const socketToRoom = {}

export const roomRouter = createRouter()
  .mutation("sendMessage", {
    input: sendMessageSchema,
    resolve({ input, ctx }) {
      const { ee } = ctx

      const message = { ...input } /* [..] add to db */

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
  .query("join-room", {
    input: joinRoomInput,
    resolve({ input, ctx }) {
      const { roomId } = input

      const yourId = ctx.yourId || `u_${nanoid()}`

      if ("setHeader" in ctx.res && !ctx.yourId) {
        ctx.res.setHeader(
          "Set-Cookie",
          serialize("yourId", yourId, { path: "/" })
        )
      }

      if (users[roomId]) {
        // const length = users[roomId].length
        // if (length === 4) {
        //   // socket.emit("room full")
        //   return
        // }
        users[roomId].push(yourId)
      } else {
        users[roomId] = [yourId]
      }
      socketToRoom[yourId] = roomId

      console.log("users[roomId]", users[roomId])

      const usersInThisRoom = users[roomId].filter((id) => id !== yourId)

      ctx.ee.emit(Events.USER_JOINED, { roomId, userId: yourId })

      return { yourId, usersInThisRoom }
    },
  })

  .mutation("sendCallOffer", {
    input: sendCallOfferInputSchema,
    resolve({ input, ctx }) {
      const { ee } = ctx

      ee.emit(Events.CALL_OFFER, input)

      return `Calling ${input.userToCall}`
    },
  })
  .subscription("onCallOffer", {
    input: onUserJoinedInputSchema,
    resolve({ ctx, input }) {
      const { ee, yourId } = ctx
      const { roomId } = input

      console.log("onCallOffer", roomId, yourId)

      // `resolve()` is triggered for each client when they start subscribing `onAdd`

      // return a `Subscription` with a callback which is triggered immediately
      return new trpc.Subscription<CallOffer>((emit) => {
        const onCallOffer = (data: CallOffer) => {
          if (roomId === data.roomId && yourId === data.userToCall) {
            console.log("sending call offer...", data.roomId, data.userToCall)

            // emit data to client
            emit.data(data)
          }
        }

        // trigger `onAdd()` when `add` is triggered in our event emitter
        ee.on(Events.CALL_OFFER, onCallOffer)

        // unsubscribe function when client disconnects or stops subscribing
        return () => {
          ee.off(Events.CALL_OFFER, onCallOffer)
        }
      })
    },
  })
