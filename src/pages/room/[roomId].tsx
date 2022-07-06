import { parse } from "cookie"
import { useRouter } from "next/router"
import { trpc } from "../../utils/trpc"
import ChatBar from "../../components/ChatBar"
import VideoGrid from "../../components/VideoGrid"
import { useQuery } from "react-query"
import { useRef } from "react"

function RoomPage() {
  const router = useRouter()
  const roomId = router.query.roomId as string
  const userVideo = useRef<{ srcObject: MediaStream | null }>({
    srcObject: null,
  })

  const {
    error,
    isLoading,
    data: stream,
  } = useQuery(
    "user-media",
    () => {
      return navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    },
    {
      onSuccess(stream) {
        userVideo.current.srcObject = stream
      },
    }
  )

  const {
    data: roomData,
    isLoading: joiningRoom,
    error: errorJoiningRoom,
  } = trpc.useQuery([
    "room.join-room",
    {
      roomId,
    },
  ])

  if (joiningRoom) {
    return <p>Joining...</p>
  }

  if (errorJoiningRoom) {
    return <p>{JSON.stringify(errorJoiningRoom)}</p>
  }

  if (!roomData) {
    return <p>Something bad went wrong</p>
  }

  if (!roomId) {
    return <p>Waiting for room...</p>
  }

  return (
    <div>
      <VideoGrid
        roomId={roomId}
        yourId={roomData.yourId}
        usersInThisRoom={roomData.usersInThisRoom || []}
      />
      <ChatBar />
    </div>
  )
}

export default RoomPage
