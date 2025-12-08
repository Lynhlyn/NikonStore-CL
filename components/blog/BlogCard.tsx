'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Eye, FileText } from 'lucide-react';
import type { Blog } from '@/lib/service/modules/blogService/type';

interface BlogCardProps {
  blog: Blog;
}

export default function BlogCard({ blog }: BlogCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Link href={`/blogs/${blog.slug}`} className="h-full block">
      <div className="group cursor-pointer h-full flex flex-col">
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
          <div className="relative w-full h-48 overflow-hidden flex-shrink-0 bg-gray-100">
            {blog.thumbnailUrl ? (
              <Image
                src={blog.thumbnailUrl}
                alt={blog.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
          <div className="p-6 flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-2">
              {blog.category && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {blog.category.name}
                </span>
              )}
            </div>
            <h3 className="text-xl font-semibold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[3.5rem]">
              {blog.title}
            </h3>
            <div className="flex-1">
              {blog.summary ? (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 min-h-[4rem]">
                  {blog.summary}
                </p>
              ) : (
                <p className="text-gray-600 text-sm mb-4 min-h-[4rem]"></p>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-auto">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(blog.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {blog.viewCount || 0} lượt xem
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

