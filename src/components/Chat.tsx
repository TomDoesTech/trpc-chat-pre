import { useRouter } from "next/router"
import { signIn, useSession } from "next-auth/react"
import { useState } from "react"
import { Message } from "../constants/schema"
import { trpc } from "../utils/trpc"
import { Session } from "next-auth"

function MessageItem({
  message,
  session,
}: {
  message: Message
  session: Session
}) {
  const baseLiClasses =
    "mb-4 text-sm font-medium w-7/12 p-4 text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"

  const lineItemClasses =
    message.user.name === session?.user?.name
      ? baseLiClasses
      : baseLiClasses.concat(" self-end")

  return (
    <li className={lineItemClasses}>
      <div className="flex">
        <time dateTime={message.sentAt.toISOString()} className="mr-1">
          {message.sentAt.toLocaleTimeString("en-AU", {
            timeStyle: "short",
          })}
        </time>
        - <span className="ml-1">{message.user.name}</span>
      </div>
      {message.text}
    </li>
  )
}

function ChatBar() {
  const router = useRouter()
  const { data: session } = useSession()
  const [message, setMessage] = useState("")
  const utils = trpc.useContext()

  const roomId = router.query.roomId as string

  const sendMessage = trpc.useMutation("room.sendMessage")

  const [messages, setMessages] = useState<Message[]>([])

  trpc.useSubscription(["room.onSendMessage"], {
    onNext(message) {
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
    } catch {}
  }

  if (!session) {
    return <button onClick={() => signIn()}>Sign in</button>
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1">
        <ul className="flex flex-col p-4">
          {messages.map((m, i) => {
            return <MessageItem key={m.id} message={m} session={session} />
          })}
        </ul>
      </div>
      <form
        className="flex"
        onSubmit={(e) => {
          e.preventDefault()

          postMessage()
        }}
      >
        <textarea
          className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What do you want to say?"
        />

        <button
          type="submit"
          className="flex-1 text-white bg-gray-700 hover:bg-gray-900 focus:outline-none font-medium text-sm px-5 py-2.5 mr-2 mb-2"
        >
          Send message
        </button>
      </form>
    </div>
  )
}

export default ChatBar
