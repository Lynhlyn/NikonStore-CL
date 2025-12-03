'use client';

import { useState } from 'react';
import { useFetchBlogsQuery } from '@/lib/service/modules/blogService';
import BlogCard from './BlogCard';
import { FileText, Loader2 } from 'lucide-react';

export default function BlogList() {
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');

  const { data: blogsData, isLoading } = useFetchBlogsQuery({
    page,
    size: 12,
    keyword: keyword || undefined,
    isPublished: true,
    sort: 'createdAt',
    direction: 'desc',
  });

  const blogs = blogsData?.data || [];
  const totalPages = blogsData?.pagination?.totalPages || 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Blog</h1>
          <p className="text-gray-600">Khám phá các bài viết mới nhất</p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Tìm kiếm blog..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
            className="w-full max-w-md mx-auto block px-4 py-2 border rounded-md"
          />
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Chưa có bài viết nào</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 border rounded-md disabled:opacity-50"
                >
                  Trước
                </button>
                <span className="px-4 py-2">
                  Trang {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 border rounded-md disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

