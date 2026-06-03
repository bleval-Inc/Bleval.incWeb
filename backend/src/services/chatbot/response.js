export const intents = [
  // 👋 GREETINGS
  {
    patterns: [
      'hello',
      'hi',
      'hey',
      'good morning',
      'good afternoon',
      'good evening',
      'yo',
      'hey there',
    ],
    priority: 40,
    category: 'conversation',
  },

  // 🔥 HIGH INTENT
  {
    patterns: [
      'request quote',
      'get started',
      'start project',
      'begin project',
      'proposal',
      'book consultation',
      'book a call',
    ],
    priority: 35,
    category: 'high',
  },

  // 💰 PRICING
  {
    patterns: [
      'pricing',
      'price',
      'cost',
      'how much',
      'rates',
      'packages',
      'plans',
      'website cost',
      'website pricing',
    ],
    priority: 32,
    category: 'high',
  },

  // 📦 PACKAGES
  {
    patterns: ['quick win', 'starter package', 'starter plan', 'basic website'],
    priority: 30,
    category: 'medium',
  },

  {
    patterns: ['growth package', 'growth system', 'automation package', 'booking system'],
    priority: 29,
    category: 'medium',
  },

  {
    patterns: ['revenue machine', 'advanced package', 'pro package', 'ai chatbot', 'crm system', 'payment integration'],
    priority: 34,
    category: 'high',
  },

  // 🧩 SERVICES
  {
    patterns: ['services', 'what do you do', 'what do you offer', 'your services'],
    priority: 28,
    category: 'medium',
  },

  // 🌐 WEB DESIGN
  {
    patterns: [
      'web design',
      'website design',
      'website',
      'web development',
      'website development',
      'redesign website',
      'improve website',
    ],
    priority: 27,
    category: 'medium',
  },

  // 🤖 AI AUTOMATION
  {
    patterns: ['ai automation', 'automation', 'workflow automation', 'business automation', 'automate my business', 'ai systems'],
    priority: 31,
    category: 'high',
  },

  // 🖥 WEB APPS / SYSTEMS
  {
    patterns: ['web app', 'web application', 'dashboard', 'portal', 'custom system', 'business system'],
    priority: 26,
    category: 'medium',
  },

  // 🎨 BRANDING
  {
    patterns: ['branding', 'logo design', 'brand identity'],
    priority: 22,
    category: 'medium',
  },

  // ⏱ PROCESS
  {
    patterns: ['process', 'how it works', 'steps', 'workflow', 'onboarding'],
    priority: 20,
    category: 'medium',
  },

  // ⏳ TIMELINES
  {
    patterns: ['timeline', 'how long', 'delivery time', 'turnaround'],
    priority: 18,
    category: 'low',
  },

  // 🌍 LOCATION / INTERNATIONAL
  {
    patterns: ['location', 'where are you based', 'where are you located', 'international', 'do you work internationally', 'remote'],
    priority: 24,
    category: 'medium',
  },

  // 🧠 ABOUT BLEVAL
  {
    patterns: ['what is bleval', 'what does bleval mean', 'bleval meaning', 'about bleval', 'who are you'],
    priority: 29,
    category: 'medium',
  },

  // 🏗 FOUNDED
  {
    patterns: ['when was bleval founded', 'when did you start', 'how old is bleval', 'who founded bleval', 'who owns bleval'],
    priority: 23,
    category: 'conversation',
  },

  // 📞 CONTACT
  {
    patterns: ['contact', 'get in touch', 'call you', 'email you', 'speak to someone', 'consultation'],
    priority: 33,
    category: 'high',
  },

  // 🙋 HELP
  {
    patterns: ['can you help me', 'i need help', 'not sure what i need', 'where do i start'],
    priority: 30,
    category: 'conversation',
  },

  // 🎯 PORTFOLIO
  {
    patterns: ['portfolio', 'examples', 'previous work', 'projects'],
    priority: 15,
    category: 'low',
  },

  // 🏆 DIFFERENTIATOR
  {
    patterns: ['why choose bleval', 'what makes you different', 'why bleval'],
    priority: 25,
    category: 'medium',
  },

  // 💬 CASUAL
  {
    patterns: ['sounds good', 'okay', 'cool', 'thanks', 'great', 'awesome', 'nice'],
    priority: 10,
    category: 'conversation',
  },

  // 👋 GOODBYE
  {
    patterns: ['bye', 'goodbye', 'see you'],
    priority: 5,
    category: 'conversation',
  },
]

function valueLine() {
  return (
    'We help businesses build smarter digital systems through modern web experiences, AI automation, and scalable technology solutions.'
  )
}

function normalizeText(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(text) {
  const n = normalizeText(text)
  return n ? n.split(' ') : []
}

function levenshtein(a, b) {
  const s = String(a || '')
  const t = String(b || '')
  const m = s.length
  const n = t.length
  if (m === 0) return n
  if (n === 0) return m

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      )
    }
  }

  return dp[m][n]
}

function tokenSimilarity(a, b) {
  const ta = tokenize(a)
  const tb = tokenize(b)
  if (ta.length === 0 || tb.length === 0) return 0

  const setB = new Set(tb)
  let overlap = 0
  for (const tokA of ta) {
    if (setB.has(tokA)) overlap++
  }

  const overlapScore = overlap / Math.max(ta.length, tb.length)

  // Tiny typo tolerance: allow one edit for short tokens
  let typoScore = 0
  for (const tokA of ta) {
    for (const tokB of tb) {
      if (tokA.length <= 4 && tokB.length <= 4) {
        const d = levenshtein(tokA, tokB)
        if (d > 0 && d <= 1) typoScore += 0.15
      }
    }
  }

  return Math.min(1, overlapScore + typoScore)
}

function bestPatternMatch(message, pattern) {
  const m = normalizeText(message)
  const p = normalizeText(pattern)
  if (!m || !p) return { hit: false, score: 0 }

  // Exact phrase (post-normalization)
  if (m.includes(p)) return { hit: true, score: 1.0 }

  const mTokens = tokenize(m)
  const pTokens = tokenize(p)

  // Token overlap
  const setM = new Set(mTokens)
  let overlap = 0
  for (const t of pTokens) {
    if (setM.has(t)) overlap++
  }
  if (overlap > 0) {
    return { hit: true, score: 0.4 + overlap / Math.max(3, pTokens.length) }
  }

  // Typo tolerance for short patterns
  if (pTokens.length === 1 && pTokens[0].length <= 5) {
    const sim = tokenSimilarity(m, pTokens[0])
    if (sim >= 0.45) return { hit: true, score: 0.35 + sim * 0.25 }
  }

  return { hit: false, score: 0 }
}

function matchIntent(message) {
  const m = String(message || '')

  let best = null
  let bestScore = 0
  let bestMatchedPatterns = []

  for (const intent of intents) {
    let score = 0
    const matchedPatterns = []

    for (const pattern of intent.patterns || []) {
      const { hit, score: pScore } = bestPatternMatch(m, pattern)
      if (hit) {
        matchedPatterns.push(pattern)
        score += pScore

        // Multi-pattern bonus (prevents single weak matches)
        if (matchedPatterns.length >= 2) score += 0.15
      }
    }

    if (score > 0) {
      const weighted = score * (intent.priority || 1)
      if (weighted > bestScore) {
        bestScore = weighted
        best = intent
        bestMatchedPatterns = matchedPatterns
      }
    }
  }

  if (!best) {
    return {
      intent: null,
      intentName: null,
      confidence: 0,
      category: null,
      matchedPatterns: [],
    }
  }

  const rawConfidence = bestScore / 20
  const confidence = Math.max(0, Math.min(1, rawConfidence))
  const intentName = bestMatchedPatterns[0] || null

  return {
    intent: best,
    intentName,
    confidence,
    category: best.category || null,
    matchedPatterns: bestMatchedPatterns,
  }
}

function nextStepFor({ stage, highIntent = false, services = false, lastCtaShown = null }) {
  const base = {
    booking: [{ type: 'booking', label: 'Book a Consultation', link: '/home?book=1' }],
    services: [{ type: 'services', label: 'View Services', link: '/services' }],
    contact: [
      { type: 'contact', label: 'Contact Us', link: '/contact' },
      { type: 'booking', label: 'Book a Consultation', link: '/home?book=1' },
    ],
  }

  const pick = () => {
    if (highIntent) return base.contact
    if (services) return base.services
    return base.booking
  }

  const candidates = pick()
  if (Array.isArray(candidates) && candidates.length) {
    // Anti-repeat: if last CTA type matches the first candidate, rotate list
    if (lastCtaShown && candidates[0]?.type === lastCtaShown && candidates.length > 1) {
      return [...candidates.slice(1), candidates[0]]
    }
  }

  return candidates
}

function followUpPrompt({ context, intentCategory, confidence }) {
  const stage = context?.stage || 'exploring'

  // High-intent or qualifying: ask 1 strategic question
  if (intentCategory === 'high' || context?.highIntent) {
    if (stage === 'exploring') {
      return 'To point you to the right solution, what outcome matter most right now—more leads, better conversion, or automation of day-to-day ops?'
    }
    if (stage === 'qualifying') {
      return 'What’s your timeline—this month, next quarter, or later?'
    }
  }

  // Default guidance
  if (stage === 'exploring') {
    return 'What kind of project are you thinking about (website, automation, or a custom system)?'
  }

  if (stage === 'qualifying') {
    return 'Do you want a brand-new build or improvements to what you already have?'
  }

  return 'Would you like to book a quick consultation so we can recommend the best next step?'
}

function updateStateFromMatch({ context, match }) {
  const prev = context?.previousIntent || ''
  const next = { ...(context || {}) }

  next.previousIntent = prev
  next.currentTopic = match?.category || next.currentTopic || ''
  next.interest = match?.category || next.interest || ''
  next.highIntent = Boolean(match?.category === 'high')

  // Stage progression
  if (!match || match.confidence < 0.32) {
    next.stage = next.stage || 'exploring'
  } else if (next.stage === 'exploring') {
    next.stage = 'qualifying'
  } else {
    next.stage = 'conversion'
  }

  return next
}


function buildReply(intentName, stage) {
  // New signature: buildReply({ userMessage, context, intentFromPrev })
  if (intentName && typeof intentName === 'object') {
    const { userMessage, context } = intentName
    const prev = context?.previousIntent || ''

    const match = matchIntent(userMessage)
    const updatedContext = updateStateFromMatch({ context, match })

    const lastCtaShown = updatedContext?.lastCtaShown || null
    const intentCategory = match?.category || null

    // Confidence gating: if unsure, keep it conversational + ask follow-up
    if (!match.intent || match.confidence < 0.32) {
      const replyBase =
        'That makes sense.\n\n' +
        'To make sure I guide you in the right direction for Bleval’s services, let me ask one quick question:'

      const followUp = followUpPrompt({ context: updatedContext, intentCategory, confidence: match.confidence })

      const cta = nextStepFor({
        stage: updatedContext.stage,
        highIntent: Boolean(updatedContext.highIntent),
        services: updatedContext.stage === 'qualifying',
        lastCtaShown,
      })

      // Store last CTA type for anti-repeat behavior
      const nextLastCta = Array.isArray(cta) && cta[0]?.type ? cta[0].type : null
      updatedContext.lastCtaShown = nextLastCta

      return {
        reply: `${replyBase}\n\n${followUp}`,
        cta,
      }
    }

    // Update last CTA type for anti-repeat
    const highIntent = intentCategory === 'high' || Boolean(updatedContext.highIntent)
    const services = intentCategory === 'medium'

    const cta = nextStepFor({
      stage: updatedContext.stage,
      highIntent,
      services,
      lastCtaShown,
    })

    const nextLastCta = Array.isArray(cta) && cta[0]?.type ? cta[0].type : null
    updatedContext.lastCtaShown = nextLastCta

    // Response selection: use legacy intentName mapping to preserve existing wording
    // Keep original behavior by mapping match.intentName to existing logic.
    const legacy = buildReply(match.intentName, updatedContext.stage)

    const followUp = followUpPrompt({ context: updatedContext, intentCategory, confidence: match.confidence })

    // Avoid excessive follow-ups for casual/low intents
    const shouldAppendFollowUp = updatedContext.stage !== 'conversion' || match.confidence < 0.6

    return {
      reply: shouldAppendFollowUp ? `${legacy.reply}\n\n${followUp}` : legacy.reply,
      cta,
    }
  }

  // Backward-compatible signature (legacy callers)
  const v = valueLine()



  // 👋 GREETING / DEFAULT
  if (!intentName) {
    return {
      reply:
        'Welcome to Bleval Inc.\n\n' +
        'We help businesses build smarter digital systems through AI automation, modern websites, and scalable technology solutions.\n\n' +
        'What are you looking to improve today?',
      cta: nextStepFor({ stage }),
    }
  }

  // 👋 GREETINGS
  if (
    intentName.includes('hello') ||
    intentName.includes('hi') ||
    intentName.includes('hey')
  ) {
    return {
      reply:
        'Hey — welcome to Bleval Inc.\n\n' +
        'We help businesses improve digital presence, automate workflows, and build scalable online systems.\n\n' +
        'What can we help you with today?',
      cta: nextStepFor({ stage }),
    }
  }

  // 🙋 HELP
  if (
    intentName.includes('help') ||
    intentName.includes('start')
  ) {
    return {
      reply:
        'Absolutely.\n\n' +
        'Tell us a little about your business or what you’re trying to improve, and we’ll help guide you toward the right solution.',
      cta: nextStepFor({ stage, services: true }),
    }
  }

  // 🧩 SERVICES
  if (
    intentName.includes('services') ||
    intentName.includes('offer')
  ) {
    return {
      reply:
        'Bleval Inc provides AI automation, web design, branding, workflow optimization, and scalable digital business systems.\n\n' +
        'Our solutions are designed to help businesses improve performance, automate repetitive processes, and create stronger digital experiences.\n\n' +
        'What type of solution are you looking for?',
      cta: nextStepFor({ stage, services: true }),
    }
  }

  // 🌐 WEB DESIGN
  if (
    intentName.includes('web') ||
    intentName.includes('website')
  ) {
    return {
      reply:
        'We design and develop modern, high-performance websites tailored to your business goals.\n\n' +
        'Our websites focus on scalability, user experience, performance, and conversion optimization while helping businesses strengthen their online presence.\n\n' +
        'Are you looking for a new website or improving an existing one?',
      cta: nextStepFor({ stage, highIntent: true }),
    }
  }

  // 🤖 AI AUTOMATION
  if (
    intentName.includes('automation') ||
    intentName.includes('ai')
  ) {
    return {
      reply:
        'We help businesses improve efficiency by integrating AI-powered automation into their workflows.\n\n' +
        'This can include lead handling, onboarding systems, appointment flows, customer communication, and other repetitive operational tasks.\n\n' +
        'What part of your workflow are you looking to improve?',
      cta: nextStepFor({ stage, highIntent: true }),
    }
  }

  // 🖥 WEB APPS / SYSTEMS
  if (
    intentName.includes('application') ||
    intentName.includes('system') ||
    intentName.includes('dashboard')
  ) {
    return {
      reply:
        'Yes — Bleval Inc develops custom web applications and digital systems tailored around business workflows and operational needs.\n\n' +
        'From dashboards to automation systems and portals, we build scalable solutions designed around performance and usability.',
      cta: nextStepFor({ stage, highIntent: true }),
    }
  }

  // 💰 PRICING
  if (
    intentName.includes('pricing') ||
    intentName.includes('price') ||
    intentName.includes('cost')
  ) {
    return {
      reply:
        'Our pricing is structured around the level of functionality, automation, and scalability your business needs.\n\n' +
        'We offer flexible packages ranging from professional websites to advanced AI-powered digital systems.\n\n' +
        'If you’d like, we can help recommend the best solution based on your goals.',
      cta: nextStepFor({ stage, highIntent: true }),
    }
  }

  // 📦 QUICK WIN
  if (
    intentName.includes('quick') ||
    intentName.includes('starter')
  ) {
    return {
      reply:
        'The Quick Win package is ideal for businesses looking to establish a stronger digital presence with a professional website and foundational optimization systems.',
      cta: nextStepFor({ stage, highIntent: true }),
    }
  }

  // 📦 GROWTH SYSTEM
  if (
    intentName.includes('growth')
  ) {
    return {
      reply:
        'The Growth System package is designed for businesses looking to improve lead conversion, automate workflows, and scale operations more efficiently.',
      cta: nextStepFor({ stage, highIntent: true }),
    }
  }

  // 📦 REVENUE MACHINE
  if (
    intentName.includes('revenue') ||
    intentName.includes('pro')
  ) {
    return {
      reply:
        'The Revenue Machine package is built for businesses ready to scale using advanced automation, AI-powered systems, and conversion-focused digital infrastructure.',
      cta: nextStepFor({ stage, highIntent: true }),
    }
  }

  // ⏱ PROCESS
  if (
    intentName.includes('process') ||
    intentName.includes('workflow') ||
    intentName.includes('onboarding')
  ) {
    return {
      reply:
        'Our process starts with understanding your business goals and operational challenges.\n\n' +
        'From there, we create a tailored strategy, design the solution, implement the system, and optimize it for long-term performance and scalability.',
      cta: nextStepFor({ stage }),
    }
  }

  // ⏳ TIMELINES
  if (
    intentName.includes('timeline') ||
    intentName.includes('delivery')
  ) {
    return {
      reply:
        'Project timelines depend on the complexity and scope of the solution.\n\n' +
        'Most projects move through strategy, design, development, testing, and launch phases to ensure quality and long-term scalability.',
      cta: nextStepFor({ stage }),
    }
  }

  // 🌍 LOCATION
  if (
    intentName.includes('location') ||
    intentName.includes('international') ||
    intentName.includes('remote')
  ) {
    return {
      reply:
        'Yes — Bleval Inc works remotely with businesses across different regions and industries.\n\n' +
        'What type of project are you considering?',
      cta: nextStepFor({ stage, services: true }),
    }
  }

  // 🧠 BLEVAL
  if (
    intentName.includes('bleval') ||
    intentName.includes('meaning')
  ) {
    return {
      reply:
        'Bleval is derived from a refined blend of “Blue” and “Value”.\n\n' +
        '“Blue” represents trust, clarity, and strong digital foundations.\n' +
        '“Value” represents measurable business impact, performance, and long-term growth.\n\n' +
        'Together, Bleval represents modern digital systems designed to create meaningful business results.',
      cta: nextStepFor({ stage }),
    }
  }

  // 🏗 FOUNDED
  if (
    intentName.includes('founded') ||
    intentName.includes('start') ||
    intentName.includes('owner')
  ) {
    return {
      reply:
        'Bleval Inc was created with the goal of helping businesses modernize operations and improve digital presence through scalable technology, automation, and modern web systems.',
      cta: nextStepFor({ stage }),
    }
  }

  // 🏆 DIFFERENTIATOR
  if (
    intentName.includes('different') ||
    intentName.includes('choose')
  ) {
    return {
      reply:
        'Bleval Inc combines modern design, scalable development practices, and AI-powered systems to create digital solutions focused on real business outcomes.\n\n' +
        'We focus on performance, usability, automation, and long-term scalability rather than simply building websites.',
      cta: nextStepFor({ stage, highIntent: true }),
    }
  }

  // 📞 CONTACT
  if (
    intentName.includes('contact') ||
    intentName.includes('consultation')
  ) {
    return {
      reply:
        'You can contact Bleval Inc directly through our contact page or book a free consultation to discuss your goals and project requirements.\n\n' +
        'We’ll help guide you toward the right solution for your business.',
      cta: nextStepFor({ stage, highIntent: true }),
    }
  }

  // 🎯 PORTFOLIO
  if (
    intentName.includes('portfolio') ||
    intentName.includes('examples')
  ) {
    return {
      reply:
        'We’re continuously building and refining modern digital experiences focused on performance, scalability, and user experience.\n\n' +
        'If you’d like to discuss a specific type of project or solution, we’d be happy to help.',
      cta: nextStepFor({ stage, services: true }),
    }
  }

  // 💬 CASUAL
  if (
    intentName.includes('thanks') ||
    intentName.includes('cool') ||
    intentName.includes('awesome')
  ) {
    return {
      reply:
        'Glad to help.\n\n' +
        'Let us know if you’d like guidance on the best solution for your business.',
      cta: nextStepFor({ stage }),
    }
  }

  // 👋 GOODBYE
  if (
    intentName.includes('bye') ||
    intentName.includes('goodbye')
  ) {
    return {
      reply:
        'Thanks for chatting with Bleval Inc.\n\n' +
        'We look forward to helping you build smarter digital systems.',
      cta: nextStepFor({ stage }),
    }
  }

  // 🔁 FALLBACK
  return {
    reply:
      'That’s a great question.\n\n' +
      'Our team can help guide you toward the best solution based on your business goals and requirements.\n\n' +
      'Feel free to contact us or book a consultation and we’ll point you in the right direction.',
    cta: nextStepFor({ stage, highIntent: true }),
  }
}

export const fallbackResponse = buildReply(null, 'exploring')

export { buildReply }