import BlogDetail from '@/components/blog/BlogDetail';

interface BlogDetailPageProps {
  params: {
    slug: string;
  };
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  return <BlogDetail slug={params.slug} />;
}

