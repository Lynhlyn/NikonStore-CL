"use client"

import { useFetchBlogsQuery } from "@/lib/service/modules/blogService"
import BlogCard from "@/components/blog/BlogCard"
import Link from "next/link"
import { FileText, ArrowRight } from "lucide-react"

export default function LatestBlogsSection() {
  const { data: blogsData, isLoading } = useFetchBlogsQuery({
    page: 0,
    size: 5,
    isPublished: true,
    sort: "createdAt",
    direction: "desc",
  })

  const blogs = blogsData?.data || []

  if (isLoading) {
    return null
  }

  if (blogs.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Bài viết mới nhất</h2>
            <p className="text-gray-600">Khám phá những bài viết hữu ích từ chúng tôi</p>
          </div>
          <Link
            href="/blogs"
            className="flex items-center gap-2 text-[#FF6B00] hover:text-[#FF8C00] font-semibold transition-colors"
          >
            Xem tất cả
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {blogs.slice(0, 3).map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>

        {blogs.length > 3 && (
          <div className="mt-8 text-center">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B00] text-white font-semibold rounded-lg hover:bg-[#FF8C00] transition-colors"
            >
              <FileText className="h-5 w-5" />
              Xem thêm bài viết
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

