"use client"

import { useFetchFAQsQuery } from "@/lib/service/modules/faqService"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"
import { HelpCircle, ArrowRight } from "lucide-react"
import parse from "html-react-parser"

export default function LatestFAQsSection() {
  const { data: faqsData, isLoading } = useFetchFAQsQuery({
    page: 0,
    size: 5,
    sort: "createdAt",
    direction: "desc",
  })

  const faqs = (faqsData?.data || []).filter(faq => faq.status)

  if (isLoading) {
    return null
  }

  if (faqs.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Câu hỏi thường gặp</h2>
            <p className="text-gray-600">Những câu hỏi được quan tâm nhất</p>
          </div>
          <Link
            href="/faqs"
            className="flex items-center gap-2 text-[#FF6B00] hover:text-[#FF8C00] font-semibold transition-colors"
          >
            Xem tất cả
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full bg-white rounded-lg shadow-sm">
            {faqs.slice(0, 5).map((faq) => (
              <AccordionItem key={faq.id} value={`faq-${faq.id}`} className="border-b last:border-b-0">
                <AccordionTrigger className="text-left px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-[#FF6B00] mt-0.5 flex-shrink-0" />
                    <span className="font-medium">{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <div className="prose max-w-none text-gray-700 prose-p:text-gray-700 prose-a:text-[#FF6B00] prose-a:no-underline hover:prose-a:underline">
                    {parse(faq.answer)}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

