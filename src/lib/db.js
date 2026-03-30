import { Pool } from 'pg';

let pool;

export function getDb() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export async function initDb() {
  const db = getDb();

  await db.query(`
    CREATE TABLE IF NOT EXISTS tenants (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'active',
      primary_color TEXT DEFAULT '#e8b84b',
      bg_color TEXT DEFAULT '#0a0a14',
      logo_url TEXT,
      features JSONB DEFAULT '{}',
      billing_plan TEXT DEFAULT 'free',
      custom_domain TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await db.query(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS bg_color TEXT DEFAULT '#0a0a14'`);
  await db.query(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS bg_image_url TEXT`);
  await db.query(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS contract_terms TEXT`);
  await db.query(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS contract_bullets TEXT`);
  await db.query(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS bedrijf_adres TEXT DEFAULT ''`);
  await db.query(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS bedrijf_telefoon TEXT DEFAULT ''`);
  await db.query(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS bedrijf_email TEXT DEFAULT ''`);
  await db.query(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS bedrijf_website TEXT DEFAULT ''`);

  await db.query(`
    INSERT INTO tenants (name, slug, primary_color)
    VALUES ('JB Autoverhuur', 'jb-autoverhuur', '#e8b84b')
    ON CONFLICT (slug) DO NOTHING
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS tenant_users (
      id SERIAL PRIMARY KEY,
      tenant_id INT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      user_sub TEXT NOT NULL,
      user_email TEXT,
      role TEXT NOT NULL DEFAULT 'member',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(tenant_id, user_sub)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS cars (
      id SERIAL PRIMARY KEY,
      tenant_id INT NOT NULL DEFAULT 1 REFERENCES tenants(id),
      autogegevens TEXT NOT NULL,
      kenteken TEXT NOT NULL,
      kleur TEXT NOT NULL,
      brandstof TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await db.query(`ALTER TABLE cars ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES tenants(id)`);
  await db.query(`UPDATE cars SET tenant_id = 1 WHERE tenant_id IS NULL`);

  await db.query(`
    CREATE TABLE IF NOT EXISTS reservations (
      id SERIAL PRIMARY KEY,
      tenant_id INT NOT NULL DEFAULT 1 REFERENCES tenants(id),
      car_id INT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
      customer_name TEXT,
      first_name TEXT,
      last_name TEXT,
      phone TEXT DEFAULT '',
      price_per_day NUMERIC(10,2) DEFAULT 0,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await db.query(`ALTER TABLE reservations ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES tenants(id)`);
  await db.query(`UPDATE reservations SET tenant_id = 1 WHERE tenant_id IS NULL`);

  await db.query(`
    CREATE TABLE IF NOT EXISTS intake_submissions (
      id SERIAL PRIMARY KEY,
      tenant_id INT NOT NULL DEFAULT 1 REFERENCES tenants(id),
      token UUID DEFAULT gen_random_uuid() UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending',
      data JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await db.query(`ALTER TABLE intake_submissions ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES tenants(id)`);
  await db.query(`UPDATE intake_submissions SET tenant_id = 1 WHERE tenant_id IS NULL`);

  await db.query(`CREATE INDEX IF NOT EXISTS idx_cars_tenant ON cars(tenant_id)`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_reservations_tenant ON reservations(tenant_id)`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_intake_tenant ON intake_submissions(tenant_id)`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_tenant_users_sub ON tenant_users(user_sub)`);
}
