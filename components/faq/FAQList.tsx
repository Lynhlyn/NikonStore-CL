'use client';

import { useState } from 'react';
import { useFetchFAQsQuery } from '@/lib/service/modules/faqService';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';
import parse from 'html-react-parser';

export default function FAQList() {
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  
  const { data: faqsData, isLoading } = useFetchFAQsQuery({
    page: 0,
    size: 100,
    categoryId: selectedCategory,
  });

  const faqs = (faqsData?.data || []).filter(faq => faq.status);
  const categories = Array.from(new Set(faqs.map(faq => faq.category).filter(Boolean)));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Câu hỏi thường gặp</h1>
          <p className="text-gray-600">Tìm câu trả lời cho các câu hỏi phổ biến</p>
        </div>

        {categories.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={`px-4 py-2 rounded-md ${
                selectedCategory === undefined
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tất cả
            </button>
            {categories.map((category: any) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-md ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {faqs.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Chưa có câu hỏi nào</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="prose max-w-none prose-p:text-gray-700 prose-a:text-[#FF6B00] prose-a:no-underline hover:prose-a:underline">
                    {parse(faq.answer)}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}

