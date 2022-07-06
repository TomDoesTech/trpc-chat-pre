import z, { string } from "zod"

export const sendMessageSchema = z.object({
  roomId: string(),
  text: z.string(),
})

const messageSchema = z.object({
  text: z.string(),
})

export type Message = z.TypeOf<typeof messageSchema>

export const joinRoomInput = z.object({
  roomId: z.string({
    required_error: "roomId is required to join a room",
  }),
})

export const onUserJoinedInputSchema = z.object({
  roomId: z.string({
    required_error: "roomId is required to join a room",
  }),
})

export const sendCallOfferInputSchema = z.object({
  roomId: z.string({
    required_error: "roomId is required to join a room",
  }),
  userToCall: z.string({
    required_error: "userId is required to join a room",
  }),
  signal: z.any(),
})

export type CallOffer = z.TypeOf<typeof sendCallOfferInputSchema>
