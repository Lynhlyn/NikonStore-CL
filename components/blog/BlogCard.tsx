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
    <Link href={`/blogs/${blog.slug}`}>
      <div className="group cursor-pointer">
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
          {blog.thumbnailUrl && (
            <div className="relative w-full h-48 overflow-hidden">
              <Image
                src={blog.thumbnailUrl}
                alt={blog.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              {blog.category && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {blog.category.name}
                </span>
              )}
            </div>
            <h3 className="text-xl font-semibold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {blog.title}
            </h3>
            {blog.summary && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {blog.summary}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-500">
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

