import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "Who can donate blood?", a: "Any healthy UAP student or alumni aged 18-65, weighing at least 50kg, with no chronic diseases. You must not have donated in the last 3 months." },
  { q: "How often can I donate?", a: "You can safely donate whole blood every 3 months (90 days). UapBlood automatically tracks your cooldown period and notifies you when you're eligible again." },
  { q: "Is my information private?", a: "Yes! Only your name, blood group, department, and availability status are visible to other UAP members. Your phone number and email are hidden unless you choose to share them." },
  { q: "How do I contact a donor?", a: "Click the 'Contact' button on any donor's card to reach them via email or WhatsApp. You can also post a blood request and matching donors will be notified automatically." },
  { q: "What if I'm an Alumni?", a: "Alumni are welcome! Sign up using the Alumni tab, enter your graduation year, and you'll get a special gold Alumni badge on your profile." },
];

export function FAQSection() {
  return (
    <section className="py-[100px]">
      <div className="container px-4 max-w-[760px]">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-3">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
        </motion.div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}
              className="card-gradient rounded-2xl px-6 border-none overflow-hidden data-[state=open]:border-l-[3px] data-[state=open]:border-l-accent hover:bg-accent/[0.03] transition-colors">
              <AccordionTrigger className="font-heading font-semibold text-left hover:no-underline text-white py-5">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-gray-300 text-sm leading-[1.7] pb-5">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
