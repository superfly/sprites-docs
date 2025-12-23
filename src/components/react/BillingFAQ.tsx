import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    question: 'When does billing start?',
    answer:
      'Compute billing starts when you execute a command and stops when the command completes or the Sprite hibernates.',
  },
  {
    question: 'Do I pay while hibernated?',
    answer: 'No compute charges while hibernated. You only pay for storage.',
  },
  {
    question: 'How is storage measured?',
    answer:
      "Storage is measured based on actual data on disk, not allocated capacity. It's sampled periodically throughout the month.",
  },
  {
    question: 'Are checkpoints billed?',
    answer: 'Yes, checkpoints count toward your storage usage.',
  },
  {
    question: 'What happens if I exceed my included credits?',
    answer:
      "You'll be charged overage rates for any usage beyond your plan's included credits. Overage is billed at the rates shown in the Overage Pricing section above.",
  },
  {
    question: 'Is there a minimum charge?',
    answer:
      "Your subscription plan has a fixed monthly cost. Within your included credits, there's no additional charge—you can run commands as short or long as you need.",
  },
  {
    question: 'How do I see my bill?',
    answer:
      'Usage and billing information is available through your Fly.io dashboard and organization settings.',
  },
]

export function BillingFAQ() {
  return (
    <div className="my-6 border border-[var(--sl-color-hairline)]">
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border-[var(--sl-color-hairline)] px-4">
            <AccordionTrigger className="text-sm hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-[var(--sl-color-gray-2)]">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
