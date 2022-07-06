import { useRouter } from "next/router"
import { useState, useId } from "react"
import { useRef } from "react"
import { useEffect } from "react"
import Peer from "simple-peer"

import { useQuery } from "react-query"

import { trpc } from "../utils/trpc"

const iceServers = [
  {
    urls: "stun:openrelay.metered.ca:80",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
  {
    urls: "turn:openrelay.metered.ca:80",
    username: "openrelayproject",
    credential: "98376683",
  },
  {
    urls: "turn:openrelay.metered.ca:443",
    username: "openrelayproject",
    credential: "98376683",
  },
  {
    urls: "turn:openrelay.metered.ca:80?transport=tcp",
    username: "openrelayproject",
    credential: "98376683",
  },
]

function VideoGrid({
  roomId,
  yourId,
  usersInThisRoom,
}: {
  roomId: string
  yourId: string
  usersInThisRoom: Array<string>
}) {
  const [usersCalled, setUsersCalled] = useState<Array<string>>([])

  const userVideo = useRef<{ srcObject: MediaStream | null }>({
    srcObject: null,
  })
  const partnerVideo = useRef<{ srcObject: MediaStream | null }>({
    srcObject: null,
  })

  const { mutateAsync: sendCallOffer } = trpc.useMutation([
    "room.sendCallOffer",
  ])

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

  function acceptCall({ signal }: { signal: Peer.SignalData }) {
    console.log("accepting call", signal)

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
      config: {
        iceServers,
      },
    })

    peer.on("error", (err) => {
      console.log("acceptCall: error", err)
    })

    peer.on("connect", () => {
      console.log("acceptCall: CONNECT")
    })

    peer.on("stream", (stream) => {
      console.log("acceptCall: stream", stream)
      partnerVideo.current.srcObject = stream
    })

    peer.signal(signal)
  }

  trpc.useSubscription(
    [
      "room.onCallOffer",
      {
        roomId,
      },
    ],
    {
      onNext(data) {
        acceptCall({ signal: data.signal })
      },
    }
  )

  useEffect(() => {
    console.log({ usersInThisRoom })

    for (let i = 0; i < usersInThisRoom.length; i++) {
      const userToCall = usersInThisRoom[i]

      if (userToCall && !usersCalled.includes(userToCall)) {
        const peer = new Peer({
          initiator: true,
          trickle: false,
          stream: stream,
          config: {
            iceServers,
          },
        })

        peer.on("signal", (signal) => {
          sendCallOffer({
            roomId,
            userToCall,
            signal,
          })

          setUsersCalled((u) => [...u, userToCall])
        })

        peer.on("error", (err) => {
          console.log("sendCallOffer: error", err)
        })

        peer.on("connect", () => {
          console.log("sendCallOffer: CONNECT")
        })

        peer.on("data", (data) => {
          console.log("sendCallOffer: data", data)
        })

        peer.on("stream", (stream) => {
          console.log("sendCallOffer: stream", stream)
          if (partnerVideo.current) {
            partnerVideo.current.srcObject = stream
          }
        })
      }
    }
  }, [usersInThisRoom])

  return (
    <>
      yourId: {yourId}
      <hr />
      roomId: {roomId}
      <div className="grid grid-cols-2 gap-4">
        <video
          className="aspect-video border-4 border-red-500"
          playsInline
          muted
          ref={userVideo}
          autoPlay
        />

        {partnerVideo.current?.srcObject && (
          <video
            className="aspect-video border-4 border-emerald-700"
            playsInline
            ref={partnerVideo}
            autoPlay
          />
        )}
      </div>
    </>
  )
}

export default VideoGrid
