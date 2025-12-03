'use client';

import { useFetchBlogBySlugQuery } from '@/lib/service/modules/blogService';
import { Calendar, Eye, User } from 'lucide-react';
import Image from 'next/image';
import CommentSection from './CommentSection';
import { Loader2 } from 'lucide-react';
import parse from 'html-react-parser';

interface BlogDetailProps {
  slug: string;
}

export default function BlogDetail({ slug }: BlogDetailProps) {
  const { data: blog, isLoading } = useFetchBlogBySlugQuery(slug);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Không tìm thấy bài viết</p>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <article>
          {blog.thumbnailUrl && (
            <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
              <Image
                src={blog.thumbnailUrl}
                alt={blog.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="mb-6">
            {blog.category && (
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm mb-4">
                {blog.category.name}
              </span>
            )}
            <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
            {blog.summary && (
              <p className="text-xl text-gray-600 mb-6">{blog.summary}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              {blog.staff && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {blog.staff.fullName}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(blog.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {blog.viewCount || 0} lượt xem
              </div>
            </div>
          </div>

          <div className="prose max-w-none mb-12 prose-headings:font-bold prose-p:text-gray-700 prose-a:text-[#FF6B00] prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-img:shadow-md prose-ul:list-disc prose-ol:list-decimal">
            {parse(blog.content)}
          </div>
        </article>

        <CommentSection blogId={blog.id} />
      </div>
    </div>
  );
}

