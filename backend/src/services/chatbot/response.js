export const intents = [
  {
    patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'howzit'],
    response: `Hi there! Welcome to Bleval Inc. I'm here to help you with any questions about our services, pricing, or process. What can I help you with today?`,
  },
  {
    patterns: ['services', 'what do you do', 'what do you offer', 'offer', 'help with'],
    response: `We offer three core services:\n\n• **Web Design & Development** — custom websites built for performance and conversions\n• **Branding & Identity** — logos, colour palettes, brand guidelines\n• **Digital Marketing** — SEO, social media, and content strategy\n\nAll projects come in Starter, Growth, and Pro packages. Would you like to know more about pricing?`,
  },
  {
    patterns: ['price', 'pricing', 'cost', 'how much', 'rates', 'packages', 'plans'],
    response: `Our packages are designed to suit businesses at every stage:\n\n• **Starter** — R8,500 — Clean professional website, up to 5 pages, contact form, mobile responsive\n• **Growth** — R18,500 — Everything in Starter plus blog, booking system, basic SEO, and email automation\n• **Pro** — R35,000+ — Full custom build with AI chatbot, payment integration, CRM, and ongoing support\n\nAll prices include hosting setup and 30 days of post-launch support. Want to request a formal quote?`,
  },
  {
    patterns: ['starter', 'basic', 'simple website'],
    response: `The Starter package at R8,500 includes:\n\n• Up to 5 custom pages\n• Mobile-responsive design\n• Contact form with email notifications\n• Basic SEO setup\n• 30 days post-launch support\n\nPerfect for new businesses needing a professional online presence fast. Ready to get started?`,
  },
  {
    patterns: ['growth', 'medium', 'blog', 'booking'],
    response: `The Growth package at R18,500 includes everything in Starter plus:\n\n• Blog / news section\n• Online booking system\n• Email automation for leads\n• Google Analytics setup\n• Enhanced SEO\n\nIdeal for businesses ready to generate leads and automate their client intake. Want a quote?`,
  },
  {
    patterns: ['pro', 'advanced', 'chatbot', 'payment', 'crm', 'full'],
    response: `The Pro package starts at R35,000 and includes everything in Growth plus:\n\n• AI-powered chatbot\n• Payment integration\n• Full CRM and lead management\n• Custom integrations\n• Priority support\n\nBuilt for businesses serious about scaling. Let's talk about your specific requirements — shall I set up a discovery call?`,
  },
  {
    patterns: ['how long', 'timeline', 'turnaround', 'time', 'deadline', 'delivery'],
    response: `Typical timelines from project kick-off:\n\n• **Starter** — 1 to 2 weeks\n• **Growth** — 2 to 4 weeks\n• **Pro** — 4 to 8 weeks\n\nTimelines depend on how quickly you can provide content and feedback. We keep you updated every step of the way.`,
  },
  {
    patterns: ['process', 'how does it work', 'steps', 'what happens'],
    response: `Here's how we work:\n\n1. **Discovery call** — We learn about your business and goals (free, 30 min)\n2. **Proposal & quote** — You receive a detailed scope and fixed price\n3. **Design** — We build and you review with two rounds of revisions\n4. **Launch** — We handle deployment and domain setup\n5. **Support** — 30 days of post-launch support included\n\nNo surprises, no hidden costs.`,
  },
  {
    patterns: ['contact', 'get in touch', 'reach you', 'email', 'call', 'speak to someone', 'human'],
    response: `You can reach us directly at:\n\n• **Email:** hello@bleval.inc\n• **Contact form:** Fill in the form on our contact page and we'll respond within 1 business day\n• **Book a call:** Use our booking system to schedule a free discovery call\n\nWe're based in Cape Town and work with clients across South Africa and internationally.`,
  },
  {
    patterns: ['location', 'where', 'based', 'cape town', 'south africa'],
    response: `We're based in Cape Town, South Africa. We work with clients across South Africa and internationally — everything is handled remotely so location is never a barrier.`,
  },
  {
    patterns: ['portfolio', 'examples', 'work', 'previous', 'demo', 'samples'],
    response: `You can see examples of our work right here on the site — we have three live demo projects showing what each package delivers in practice. Want me to point you to a specific one based on your budget?`,
  },
  {
    patterns: ['quote', 'proposal', 'request', 'start', 'begin', 'get started'],
    response: `Great — let's get you a quote! Fill in the contact form with a brief description of what you need and we'll send a detailed proposal within 1 business day. Alternatively, book a free 30-minute discovery call and we can scope it together.`,
  },
  {
    patterns: ['payment', 'pay', 'deposit', 'invoice', 'paypal'],
    response: `We accept payment via PayPal, EFT, and major credit cards. Our standard terms are 50% deposit to begin, 50% on completion. For Pro projects we can arrange milestone-based payments. All quotes include a PayPal payment link for convenience.`,
  },
  {
    patterns: ['support', 'maintenance', 'after launch', 'ongoing', 'updates'],
    response: `All packages include 30 days of free post-launch support. After that we offer monthly maintenance retainers starting at R1,500/month covering security updates, content changes, and priority support.`,
  },
  {
    patterns: ['thank', 'thanks', 'appreciate', 'helpful'],
    response: `You're welcome! Is there anything else I can help you with? If you're ready to take the next step, feel free to fill in our contact form or book a free discovery call.`,
  },
  {
    patterns: ['bye', 'goodbye', 'see you', 'later', 'ciao'],
    response: `Thanks for chatting! Feel free to come back anytime. You can also reach us at hello@bleval.inc. Have a great day!`,
  },
]

export const fallbackResponse = `I'm not sure I have the answer to that one. Here's what I can help with:\n\n• Our services and packages\n• Pricing and timelines\n• How our process works\n• Getting a quote or booking a call\n\nOr you can reach a real person at **hello@bleval.inc** — we typically respond within a few hours.`