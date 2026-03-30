# Multi-Tenant Architectuur

## Overzicht

De app ondersteunt meerdere tenants (klanten/bedrijven) in één gedeelde deployment op Replit. Elke tenant heeft zijn eigen dataisolatie — een tenant kan nooit data van een andere tenant zien of aanpassen.

## Tenant-resolutie

**Strategie: session-based tenant-selectie**

Na inloggen:
1. De server zoekt op welke tenant(s) de gebruiker bij hoort (`tenant_users`)
2. Als er precies één tenant is → automatisch geselecteerd, opgeslagen in de sessie
3. Als er meerdere zijn → gebruiker gaat naar `/tenant-select` om te kiezen
4. Als er geen zijn → foutmelding met contactadvies

De actieve `tenant_id` wordt opgeslagen in de server-side iron-session. Alle API-routes lezen de `tenant_id` uitsluitend uit de sessie — nooit uit user input.

## Datamodel

```sql
tenants
  id             SERIAL PRIMARY KEY
  name           TEXT NOT NULL
  slug           TEXT NOT NULL UNIQUE
  status         TEXT DEFAULT 'active'
  primary_color  TEXT DEFAULT '#e8b84b'
  logo_url       TEXT
  features       JSONB DEFAULT '{}'
  billing_plan   TEXT DEFAULT 'free'
  custom_domain  TEXT
  created_at     TIMESTAMPTZ
  updated_at     TIMESTAMPTZ

tenant_users
  id          SERIAL PRIMARY KEY
  tenant_id   INT REFERENCES tenants(id)
  user_sub    TEXT NOT NULL          -- Replit OIDC sub
  user_email  TEXT
  role        TEXT DEFAULT 'member'  -- 'admin' | 'member'
  UNIQUE(tenant_id, user_sub)

cars            → tenant_id FK
reservations    → tenant_id FK
intake_submissions → tenant_id FK
```

## Beveiliging

- `tenant_id` komt **altijd** uit de sessie, nooit uit request body of URL params
- Elke `WHERE id=$1` query heeft ook `AND tenant_id=$2` — cross-tenant lekkage is onmogelijk
- Bij cars-reserveringen: ook de FK (`car_id`) wordt gecontroleerd op matching `tenant_id`
- Intake tokens zijn publiek (UUID = credential), maar de staff-leesoperatie verifieert tenant ownership
- Auto-provisioning (eerste inlog → tenant 1) werkt alleen als er exact 1 tenant bestaat

## Nieuwe tenant aanmaken

```sql
-- 1. Tenant aanmaken
INSERT INTO tenants (name, slug, primary_color)
VALUES ('Naam Autoverhuur', 'naam-autoverhuur', '#3b82f6')
RETURNING id;

-- 2. Gebruiker koppelen (Replit OIDC sub ophalen uit sessie-logs of via /api/auth/user)
INSERT INTO tenant_users (tenant_id, user_sub, user_email, role)
VALUES (<tenant_id>, '<replit_sub>', 'medewerker@email.nl', 'member');
```

Na inloggen ziet de gebruiker de tenant-selectiepagina als ze bij meerdere tenants horen.

## Tenant-configuratie

Per tenant stelbaar via de `tenants` tabel:
- `primary_color` — merkkleur (toekomstige UI branding)
- `logo_url` — logo URL
- `features` — JSONB feature flags (bijv. `{"invoicing": true, "api_access": false}`)
- `billing_plan` — abonnementsniveau (`free`, `pro`, `enterprise`)
- `custom_domain` — toekomstig voor custom domain routing

## Toekomstige uitbreidingen

**Custom domains per klant**
- Voeg `custom_domain` toe aan `tenants` (al aanwezig)
- Implementeer middleware die `request.headers.host` matcht aan `custom_domain`
- Sla resolved `tenant_id` op in de sessie na domeinresolutie

**Feature flags per klant**
- Gebruik het `features` JSONB veld in `tenants`
- Lees via `/api/tenant` en check in frontend/backend voor feature-gates

**Enterprise dedicated deployment**
- Fork de codebase, gebruik een aparte `DATABASE_URL` per klant
- Of gebruik PostgreSQL row-level security (RLS) als extra laag

## Lokale tests voor tenant-isolatie

```bash
# Check of een auto nooit van tenant kruist
SELECT c.tenant_id, r.tenant_id FROM cars c JOIN reservations r ON r.car_id = c.id WHERE c.tenant_id != r.tenant_id;
# → moet 0 rijen opleveren

# Controleer tenant_users per sub
SELECT tu.*, t.name FROM tenant_users tu JOIN tenants t ON t.id = tu.tenant_id WHERE tu.user_sub = '<sub>';
```
