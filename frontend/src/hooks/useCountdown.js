import { useState, useEffect } from 'react'

export function useCountdown(targetDate) {
  const [remaining, setRemaining] = useState('')

  const targetTime = targetDate instanceof Date ? targetDate.getTime() : new Date(targetDate).getTime()

  useEffect(() => {
    const update = () => {
      const ms = Math.max(0, targetTime - Date.now())
      const days = Math.floor(ms / 86400000)
      const hours = Math.floor(ms / 3600000) % 24
      const minutes = Math.floor(ms / 60000) % 60
      const seconds = Math.floor(ms / 1000) % 60

      if (days > 0) {
        setRemaining(`${days}d ${String(hours).padStart(2, '0')}h`)
      } else {
        setRemaining(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        )
      }
    }

    update()
    const intervalId = setInterval(update, 1000)
    return () => clearInterval(intervalId)
  }, [targetTime])

  return remaining
}
