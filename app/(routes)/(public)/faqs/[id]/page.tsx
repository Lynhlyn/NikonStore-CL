"use client"

import { useParams } from "next/navigation"
import { useFetchFAQByIdQuery } from "@/lib/service/modules/faqService"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Loader2 } from "lucide-react"
import parse from "html-react-parser"

export default function FAQDetailPage() {
  const params = useParams()
  const id = typeof params.id === "string" ? parseInt(params.id) : 0

  const { data: faq, isLoading } = useFetchFAQByIdQuery(id, {
    skip: !id || id === 0,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!faq) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Không tìm thấy câu hỏi</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Câu hỏi thường gặp</h1>
        </div>
        <Accordion type="single" collapsible className="w-full" defaultValue={`faq-${faq.id}`}>
          <AccordionItem value={`faq-${faq.id}`}>
            <AccordionTrigger className="text-left text-xl">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent>
              <div className="prose max-w-none prose-p:text-gray-700 prose-a:text-[#FF6B00] prose-a:no-underline hover:prose-a:underline">
                {parse(faq.answer)}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}

