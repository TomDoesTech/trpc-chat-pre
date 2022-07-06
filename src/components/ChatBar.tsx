import { useRouter } from "next/router"
import { useCallback } from "react"
import { useState } from "react"
import { Message } from "../constants/schema"
import { trpc } from "../utils/trpc"

function ChatBar() {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const utils = trpc.useContext()

  const roomId = router.query.roomId as string

  const sendMessage = trpc.useMutation("room.sendMessage")

  const [messages, setMessages] = useState<Message[]>([])

  trpc.useSubscription(["room.onSendMessage"], {
    onNext(message) {
      console.log({ message })
      setMessages((m) => [...m, message])
    },
    onError(err) {
      console.error("Subscription error:", err)
      // we might have missed a message - invalidate cache
      utils.queryClient.invalidateQueries()
    },
  })

  async function postMessage() {
    try {
      await sendMessage.mutateAsync({
        roomId,
        text: message,
      })
      setMessage("")
      // onMessagePost();
    } catch {}
  }

  return (
    <div>
      {messages.map((m, i) => {
        return <li key={i}>{m.text}</li>
      })}

      <form
        onSubmit={async (e) => {
          e.preventDefault()

          await postMessage()
        }}
      >
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="bg-transparent flex-1 outline-0"
        />

        <div>
          <button type="submit" className="px-4 bg-indigo-500 rounded py-1">
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatBar
