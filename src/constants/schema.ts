import z, { string } from "zod"

export const sendMessageSchema = z.object({
  roomId: string(),
  text: z.string(),
})

const messageSchema = z.object({
  id: z.string(),
  text: z.string(),
  user: z.object({
    name: z.string(),
  }),
  sentAt: z.date(),
})

export type Message = z.TypeOf<typeof messageSchema>
