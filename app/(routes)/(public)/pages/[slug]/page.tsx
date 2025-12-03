"use client"

import { useParams } from "next/navigation"
import { useGetPageBySlugQuery } from "../../../../../lib/service/modules/pageService"
import parse from "html-react-parser"

export default function PublicPageBySlug() {
  const params = useParams()
  const slug = typeof params.slug === "string" ? params.slug : ""

  const { data, isLoading } = useGetPageBySlugQuery(slug, {
    skip: !slug,
  })

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-10">
        <p className="text-center text-muted-foreground">Đang tải nội dung...</p>
      </div>
    )
  }

  if (!data || !data.slug) {
    return (
      <div className="container mx-auto max-w-4xl py-10">
        <p className="text-center text-muted-foreground">Không tìm thấy trang</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-10 px-4">
      <h1 className="mb-6 text-3xl font-bold">{data.title}</h1>
      <div className="prose max-w-none prose-headings:font-bold prose-p:text-gray-700 prose-a:text-[#FF6B00] prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-img:shadow-md">
        {parse(data.content)}
      </div>
    </div>
  )
}


