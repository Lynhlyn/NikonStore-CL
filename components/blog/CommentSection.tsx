'use client';

import { useState } from 'react';
import { useFetchCommentsByBlogQuery, useAddCommentMutation } from '@/lib/service/modules/commentService';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/src/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, User, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CommentSectionProps {
  blogId: number;
}

interface CommentItemProps {
  comment: any;
  level?: number;
}

const CommentItem = ({ comment, level = 0 }: CommentItemProps) => {
  const hasReplies = comment.replies && comment.replies.length > 0;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDisplayName = () => {
    if (comment.staff) {
      return comment.staff.fullName || comment.staff.username;
    }
    if (comment.customer) {
      return comment.customer.fullName || comment.customer.username;
    }
    return comment.userComment || 'Khách vãng lai';
  };

  const getBadgeClassName = () => {
    if (comment.staff) {
      return 'bg-green-100 border-green-300 text-green-800';
    }
    if (comment.customer) {
      return 'bg-blue-100 border-blue-300 text-blue-800';
    }
    return 'bg-gray-100 border-gray-300 text-gray-800';
  };

  return (
    <div className={`${level > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
            comment.staff ? 'bg-green-500' : 'bg-blue-500'
          }`}>
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${getBadgeClassName()}`}>
                <User className="h-3 w-3" />
                {getDisplayName()}
              </span>
              <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
            </div>
            <p className="text-gray-700">{comment.content}</p>
          </div>
        </div>
      </div>
      {hasReplies && (
        <div className="mt-2">
          {comment.replies.map((reply: any) => (
            <CommentItem key={reply.id} comment={reply} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function CommentSection({ blogId }: CommentSectionProps) {
  const { customerId, isAuthenticated } = useAuth();
  const [content, setContent] = useState('');
  const [userComment, setUserComment] = useState('');

  const { data: commentsData, isLoading, refetch } = useFetchCommentsByBlogQuery({
    blogId,
    status: true,
  });

  const [addComment, { isLoading: isAdding }] = useAddCommentMutation();

  const comments = commentsData?.data || [];
  const topLevelComments = comments.filter((c: any) => !c.parentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung comment');
      return;
    }

    if (!isAuthenticated && !userComment.trim()) {
      toast.error('Vui lòng nhập tên của bạn');
      return;
    }

    try {
      await addComment({
        blogId,
        customerId: isAuthenticated ? customerId : undefined,
        userComment: isAuthenticated ? undefined : userComment,
        content: content.trim(),
      }).unwrap();
      toast.success('Gửi comment thành công! Comment sẽ được duyệt trước khi hiển thị.');
      setContent('');
      setUserComment('');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi gửi comment');
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="h-6 w-6" />
        Bình luận ({topLevelComments.length})
      </h2>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          {!isAuthenticated && (
            <div>
              <label className="block text-sm font-medium mb-2">Tên của bạn</label>
              <input
                type="text"
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Nhập tên của bạn..."
                className="w-full px-3 py-2 border rounded-md"
                required={!isAuthenticated}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Nội dung comment</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập comment của bạn..."
              rows={4}
              className="w-full"
              required
            />
          </div>
          <Button type="submit" disabled={isAdding}>
            {isAdding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Gửi comment
              </>
            )}
          </Button>
        </div>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : topLevelComments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Chưa có comment nào. Hãy là người đầu tiên comment!
        </div>
      ) : (
        <div className="space-y-4">
          {topLevelComments.map((comment: any) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}

