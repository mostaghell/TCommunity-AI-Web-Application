import { useEffect } from "react"

export default function Notification() {
  useEffect(() => {
    const notification = document.getElementById("notification")
    if (notification) {
      notification.style.display = "block"
    }
  }, [])
}