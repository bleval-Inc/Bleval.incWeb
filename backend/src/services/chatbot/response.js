export const intents = [
  // 🔥 HIGH INTENT
  {
    patterns: ['request quote', 'get started', 'start project', 'begin project', 'proposal'],
    priority: 30,
    category: 'high',
  },

  // 💰 PRICING
  {
    patterns: ['pricing', 'price', 'cost', 'how much', 'rates', 'packages', 'plans'],
    priority: 28,
    category: 'high',
  },

  // ✅ PACKAGE-SPECIFIC (REFINED — no single word "pro")
  {
    patterns: ['starter package', 'starter plan', 'basic website'],
    priority: 27,
    category: 'medium',
  },
  {
    patterns: ['growth package', 'growth plan', 'booking system', 'automation'],
    priority: 26,
    category: 'medium',
  },
  {
    patterns: [
      'pro package',
      'pro plan',
      'advanced package',
      'ai chatbot',
      'crm system',
      'payment integration',
    ],
    priority: 35,
    category: 'high',
  },

  // 🧩 SERVICES
  {
    patterns: ['services', 'what do you do', 'what do you offer', 'your services'],
    priority: 22,
    category: 'medium',
  },
  {
    patterns: [
      'web design',
      'website design',
      'web development',
      'website development',
      'ecommerce',
      'e-commerce',
      'online store',
      'growth maintenance',
      'maintenance',
    ],
    priority: 21,
    category: 'medium',
  },

  // ⏱ PROCESS
  {
    patterns: ['process', 'how it works', 'steps', 'workflow'],
    priority: 18,
    category: 'low',
  },
  {
    patterns: ['timeline', 'how long', 'delivery time', 'turnaround'],
    priority: 16,
    category: 'low',
  },

  // 📍 LOCATION
  {
    patterns: ['location', 'where are you based', 'where are you located'],
    priority: 20,
    category: 'medium',
  },

  // 🧠 ABOUT BLEVAL
  {
    patterns: ['what is bleval', 'what does bleval mean', 'bleval meaning', 'about bleval'],
    priority: 23,
    category: 'medium',
  },

  // 📞 CONTACT
  {
    patterns: ['contact', 'get in touch', 'call you', 'email you', 'speak to someone'],
    priority: 24,
    category: 'high',
  },

  // 💬 CASUAL
  {
    patterns: ['sounds good', 'okay', 'cool', 'thanks', 'great'],
    priority: 10,
    category: 'low',
  },

  // 🎯 PORTFOLIO
  {
    patterns: ['portfolio', 'examples', 'previous work'],
    priority: 12,
    category: 'low',
  },

  {
    patterns: ['bye', 'goodbye'],
    priority: 5,
    category: 'low',
  },
]

function valueLine() {
  return 'We design and build conversion-focused digital systems engineered for scalability, performance, and long-term growth.'
}

function nextStepFor({ stage, highIntent = false }) {
  const base = {
    booking: [{ type: 'booking', label: 'Book a Call', link: '/booking' }],
    contact: [
      { type: 'contact', label: 'Contact Us', link: '/contact' },
      { type: 'booking', label: 'Book a Call', link: '/booking' },
    ],
  }

  return highIntent ? base.contact : base.booking
}

function buildReply(intentName, stage) {
  const v = valueLine()

  // 👋 GREETING / DEFAULT
  if (!intentName) {
    return {
      reply:
        `Welcome to Bleval.inc. What are you looking to build or improve—web presence, e-commerce, or growth systems? ` +
        v,
      cta: nextStepFor({ stage }),
    }
  }

  // 🧩 SERVICES
  if (intentName.includes('services') || intentName.includes('web')) {
    return {
      reply:
        'We specialise in four core areas:\n\n' +
        '• Web Design\n• Web Development\n• E-Commerce Solutions\n• Growth & Maintenance\n\n' +
        v +
        ' What outcome are you aiming for—more leads, bookings, or sales?',
      cta: nextStepFor({ stage }),
    }
  }

  // 💰 PRICING
  if (intentName.includes('price') || intentName.includes('cost') || intentName.includes('pricing')) {
    return {
      reply:
        'Our packages are structured for clear outcomes:\n\n' +
        '• Starter — strong online foundation\n' +
        '• Growth — conversion + automation systems\n' +
        '• Pro — full-scale digital infrastructure\n\n' +
        v +
        ' Tell me your goal and I’ll recommend the right fit.',
      cta: nextStepFor({ stage, highIntent: true }),
    }
  }

  // 📍 LOCATION
  if (intentName.includes('location') || intentName.includes('based')) {
    return {
      reply:
        'We operate remotely and work with clients globally. Our systems are designed to deliver consistent results regardless of location.',
      cta: nextStepFor({ stage }),
    }
  }

  // 🧠 BLEVAL MEANING (NEW)
  if (intentName.includes('bleval')) {
    return {
      reply:
        'Bleval is derived from a refined fusion of “Blue” and “Value”.\n\n' +
        '“Blue” represents trust, clarity, and stability — the foundation of strong digital systems.\n' +
        '“Value” represents measurable impact — results that drive growth, efficiency, and performance.\n\n' +
        'Together, Bleval represents a commitment to delivering high-standard digital solutions built with precision, reliability, and long-term scalability at their core.',
      cta: nextStepFor({ stage }),
    }
  }

  // 📞 CONTACT
  if (intentName.includes('contact')) {
    return {
      reply:
        'You can reach us directly through our contact page or book a call for a faster start. We’ll guide you through the next steps based on your goals.',
      cta: nextStepFor({ stage, highIntent: true }),
    }
  }

  // 🔁 FALLBACK (IMPROVED)
  return {
    reply:
      'Great Question  — tell me what you’re trying to achieve (more leads, bookings, or sales), and I’ll guide you to the best solution for your setup.',
    cta: nextStepFor({ stage }),
  }
}

export const fallbackResponse = buildReply(null, 'exploring')
export { buildReply }