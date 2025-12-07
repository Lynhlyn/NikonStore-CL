import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const genderMapper = {
  toVietnamese: (gender: string | null | undefined): string => {
    if (!gender) return ""
    const map: Record<string, string> = {
      "Male": "Nam",
      "Female": "Nữ",
      "Other": "Khác",
    }
    return map[gender] || gender
  },
  toEnglish: (gender: string | null | undefined): string => {
    if (!gender) return ""
    const map: Record<string, string> = {
      "Nam": "Male",
      "Nữ": "Female",
      "Khác": "Other",
    }
    return map[gender] || gender
  },
}

export const formatNote = (note: string | null | undefined): string => {
  if (!note || note.trim() === "" || note.trim().toLowerCase() === "null") {
    return "Không có"
  }
  return note.trim()
}