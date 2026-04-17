-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- CLIENTS (multi-tenant registry)
-- ============================================================
CREATE TABLE clients (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  domain      TEXT UNIQUE NOT NULL,
  config      JSONB NOT NULL DEFAULT '{}',
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

INSERT INTO clients (id, name, domain, config) VALUES (
  'bleval',
  'Bleval Inc',
  'bleval.inc',
  '{
    "email": {"from": "hello@bleval.inc", "agency_notify": "team@bleval.inc"},
    "features": ["contact","blog","chatbot","quotes","bookings","leads","payments"]
  }'
);

-- ============================================================
-- CONTACTS
-- ============================================================
CREATE TABLE contacts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id   TEXT REFERENCES clients(id),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  message     TEXT,
  source      TEXT DEFAULT 'contact_form',
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON contacts(client_id, created_at DESC);

-- ============================================================
-- LEADS
-- ============================================================
CREATE TABLE leads (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id     TEXT REFERENCES clients(id),
  contact_id    UUID REFERENCES contacts(id),
  email         TEXT NOT NULL,
  name          TEXT,
  source        TEXT,
  status        TEXT DEFAULT 'new',  -- new | nurturing | qualified | lost | converted
  tags          TEXT[] DEFAULT '{}',
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON leads(client_id, status);
CREATE INDEX ON leads(email);

-- ============================================================
-- EMAIL SEQUENCES
-- ============================================================
CREATE TABLE sequences (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id   TEXT REFERENCES clients(id),
  name        TEXT NOT NULL,
  trigger     TEXT NOT NULL,  -- 'contact_form' | 'quote_sent' | 'booking_confirmed'
  active      BOOLEAN DEFAULT true
);

CREATE TABLE sequence_steps (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sequence_id   UUID REFERENCES sequences(id) ON DELETE CASCADE,
  step_order    INT NOT NULL,
  delay_hours   INT NOT NULL DEFAULT 0,
  subject       TEXT NOT NULL,
  body_html     TEXT NOT NULL
);

CREATE TABLE sequence_enrollments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id         UUID REFERENCES leads(id),
  sequence_id     UUID REFERENCES sequences(id),
  current_step    INT DEFAULT 0,
  status          TEXT DEFAULT 'active',  -- active | completed | unsubscribed
  enrolled_at     TIMESTAMPTZ DEFAULT now(),
  next_send_at    TIMESTAMPTZ
);
CREATE INDEX ON sequence_enrollments(next_send_at) WHERE status = 'active';

-- ============================================================
-- BLOG CACHE
-- ============================================================
CREATE TABLE blog_posts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id     TEXT REFERENCES clients(id),
  external_id   TEXT,
  slug          TEXT NOT NULL,
  title         TEXT NOT NULL,
  excerpt       TEXT,
  content       TEXT,
  author        TEXT,
  cover_image   TEXT,
  tags          TEXT[] DEFAULT '{}',
  published_at  TIMESTAMPTZ,
  fetched_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, slug)
);
CREATE INDEX ON blog_posts(client_id, published_at DESC);

-- ============================================================
-- CHATBOT — knowledge base + conversations
-- ============================================================
CREATE TABLE knowledge_chunks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id   TEXT REFERENCES clients(id),
  source      TEXT,
  content     TEXT NOT NULL,
  embedding   vector(1536),
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE TABLE chat_sessions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id   TEXT REFERENCES clients(id),
  session_key TEXT UNIQUE NOT NULL,
  messages    JSONB DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- QUOTES
-- ============================================================
CREATE TABLE quotes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id     TEXT REFERENCES clients(id),
  quote_number  TEXT UNIQUE NOT NULL,
  contact_name  TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  line_items    JSONB NOT NULL DEFAULT '[]',
  subtotal      NUMERIC(10,2) DEFAULT 0,
  tax_rate      NUMERIC(5,4) DEFAULT 0,
  total         NUMERIC(10,2) DEFAULT 0,
  currency      TEXT DEFAULT 'ZAR',
  status        TEXT DEFAULT 'draft', -- draft | sent | viewed | accepted | declined | invoiced
  valid_until   DATE,
  notes         TEXT,
  pdf_url       TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON quotes(client_id, status);

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE booking_services (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id   TEXT REFERENCES clients(id),
  name        TEXT NOT NULL,
  duration_min INT NOT NULL DEFAULT 60,
  price       NUMERIC(10,2),
  description TEXT
);

CREATE TABLE bookings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id       TEXT REFERENCES clients(id),
  service_id      UUID REFERENCES booking_services(id),
  contact_name    TEXT NOT NULL,
  contact_email   TEXT NOT NULL,
  contact_phone   TEXT,
  start_time      TIMESTAMPTZ NOT NULL,
  end_time        TIMESTAMPTZ NOT NULL,
  status          TEXT DEFAULT 'pending', -- pending | confirmed | cancelled | completed
  notes           TEXT,
  meeting_link    TEXT,
  calendar_event_id TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON bookings(client_id, start_time);
CREATE INDEX ON bookings(contact_email);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE payments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id           TEXT REFERENCES clients(id),
  stripe_payment_id   TEXT UNIQUE,
  stripe_invoice_id   TEXT,
  related_type        TEXT,  -- 'quote' | 'booking'
  related_id          UUID,
  amount              NUMERIC(10,2) NOT NULL,
  currency            TEXT DEFAULT 'ZAR',
  status              TEXT DEFAULT 'pending', -- pending | paid | failed | refunded
  paid_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON payments(client_id, status); 