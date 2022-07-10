import { parse } from "cookie"
import { useRouter } from "next/router"
import { trpc } from "../../utils/trpc"
import ChatBar from "../../components/Chat"
import { useQuery } from "react-query"
import { useRef } from "react"

function RoomPage() {
  const router = useRouter()
  const roomId = router.query.roomId as string

  if (!roomId) {
    return <p>Waiting for room...</p>
  }

  return (
    <div>
      <ChatBar />
    </div>
  )
}

export default RoomPage
