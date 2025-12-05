"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

interface CountdownTimerProps {
  endDate: string
  className?: string
}

export default function CountdownTimer({ endDate, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    total: number
  } | null>(null)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const end = new Date(endDate).getTime()
      const difference = end - now

      if (difference <= 0) {
        return null
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      return {
        days,
        hours,
        minutes,
        seconds,
        total: difference,
      }
    }

    const updateTimer = () => {
      const time = calculateTimeLeft()
      setTimeLeft(time)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [endDate])

  if (!timeLeft) {
    return (
      <div className={`flex items-center gap-1 text-red-600 font-semibold ${className}`}>
        <Clock className="w-4 h-4" />
        <span>Đã hết hạn</span>
      </div>
    )
  }

  const isUrgent = timeLeft.total < 24 * 60 * 60 * 1000
  const isVeryUrgent = timeLeft.total < 6 * 60 * 60 * 1000

  const formatTime = () => {
    if (timeLeft.days > 0) {
      return `${timeLeft.days} ngày ${timeLeft.hours} giờ`
    } else if (timeLeft.hours > 0) {
      return `${timeLeft.hours} giờ ${timeLeft.minutes} phút`
    } else {
      return `${timeLeft.minutes} phút ${timeLeft.seconds} giây`
    }
  }

  return (
    <div
      className={`flex items-center gap-1.5 font-semibold transition-all ${
        isVeryUrgent
          ? "text-red-600 animate-pulse"
          : isUrgent
            ? "text-orange-600"
            : "text-gray-700"
      } ${className}`}
    >
      <Clock className={`w-4 h-4 ${isUrgent ? "animate-spin" : ""}`} style={{ animationDuration: "2s" }} />
      <span>Còn {formatTime()}</span>
    </div>
  )
}

