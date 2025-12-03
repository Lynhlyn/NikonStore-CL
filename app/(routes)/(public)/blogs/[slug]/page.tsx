"use client"

import { useParams } from "next/navigation"
import BlogDetail from "@/components/blog/BlogDetail"

export default function BlogDetailPage() {
  const params = useParams()
  const slug = typeof params.slug === "string" ? params.slug : ""

  if (!slug) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Không tìm thấy bài viết</p>
      </div>
    )
  }

  return <BlogDetail slug={slug} />
}

