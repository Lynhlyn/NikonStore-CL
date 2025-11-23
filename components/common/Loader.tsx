"use client"

interface LoaderProps {
  className?: string
}

export default function Loader({ className = "" }: LoaderProps) {
  return <div className={`loader ${className}`}></div>
}

