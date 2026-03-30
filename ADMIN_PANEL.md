# Super Admin Paneel

## Architectuur

Het admin paneel is een intern platform-beheer scherm dat **bovenop de bestaande multi-tenant structuur** gebouwd is. Het gebruikt dezelfde Replit Auth flow, maar voegt applicatie-niveau autorisatie toe via de `users` tabel.

```
Replit Auth (identity) → users tabel (rollen) → tenant_users (memberships)
```

## Replit Auth ↔ lokale database

| Gegeven | Bron |
|---|---|
| Wie is de gebruiker? | Replit OIDC (sub, email) |
| Is iemand super admin? | `users.is_super_admin` |
| Welke tenants heeft iemand? | `tenant_users` |
| Welke rol per tenant? | `tenant_users.role` |

Bij elke login wordt `syncUserOnLogin()` aangeroepen (`src/lib/admin.js`):
- Upsert in `users` op basis van `replit_sub`
- Naam, email en avatar bijwerken
- `is_super_admin = true` als email in `SUPER_ADMIN_EMAILS` staat
- Backfill `user_id` op bestaande `tenant_users` rijen

## Super admin bepaling

Super admins worden herkend via `users.is_super_admin`. Er zijn twee manieren om dit in te stellen:

### 1. Via env variable (bootstrap, aanbevolen)
Zet `SUPER_ADMIN_EMAILS=jouw@email.nl` als Replit secret. Bij de eerstvolgende login wordt `is_super_admin = true` gezet.

### 2. Via SQL (directe DB-toegang)
```sql
UPDATE users SET is_super_admin = true WHERE email = 'jouw@email.nl';
```

### Promotie/demotie via admin paneel
Een super admin kan andere gebruikers promoveren of degraderen via het paneel (maar niet zichzelf degraderen).

## Routes en pagina's

| Route | Type | Toegang |
|---|---|---|
| `/admin` | Pagina | Super admin |
| `/api/admin/tenants` | GET, POST | Super admin |
| `/api/admin/tenants/[id]` | GET, PUT, DELETE | Super admin |
| `/api/admin/users` | GET | Super admin |
| `/api/admin/users/[id]` | GET, PATCH | Super admin |
| `/api/admin/memberships` | GET, POST | Super admin |
| `/api/admin/memberships/[id]` | PATCH, DELETE | Super admin |

Alle admin routes roepen `requireSuperAdmin()` aan (`src/lib/admin.js`). Als de sessie geen super admin is, retourneert elke route HTTP 403.

## Tenants aanmaken

1. Ga naar `/admin` → tab "Tenants"
2. Klik "Nieuwe tenant"
3. Vul naam in (slug wordt auto-gegenereerd)
4. Kies status, billing plan en kleur
5. Klik "Opslaan"

Via API:
```http
POST /api/admin/tenants
{ "name": "Naam Verhuur", "slug": "naam-verhuur", "status": "active" }
```

## Gebruikers koppelen aan tenants

Gebruikers moeten **minimaal één keer ingelogd zijn** voordat ze in het paneel zichtbaar zijn (Replit Auth sync). Daarna:

1. Ga naar tab "Gebruikers"
2. Klik op een gebruiker
3. Klik "Tenant toevoegen"
4. Selecteer tenant en rol → "Koppelen"

### Beschikbare rollen
| Rol | Omschrijving |
|---|---|
| `member` | Standaard medewerker |
| `staff` | Medewerker met meer rechten |
| `tenant_admin` | Beheerder van de tenant |
| `viewer` | Alleen lezen |

## Security safeguards

- `requireSuperAdmin()` centraal afgedwongen op alle `/api/admin/*` routes
- `tenant_id` nooit uit user input — altijd uit sessie (super admin omzeilt dit via explicit ID params, maar alleen via beschermde routes)
- Zelf-demotie geblokkeerd (super admin kan zichzelf niet degraderen)
- Duplicate membership → `ON CONFLICT DO UPDATE` (geen dubbele records)
- Slug uniekheid gevalideerd bij create én update
- Rol-validatie server-side (`validRoles` whitelist)
- Admin pagina `/admin` stuurt niet-super-admins onmiddellijk door naar `/`

## Toekomstige uitbreidingen

| Feature | Aanpak |
|---|---|
| **Billing per tenant** | `tenants.billing_plan` + webhook van Stripe/RevenueCat |
| **Feature flags** | `tenants.features` JSONB al aanwezig; check via `tenant.features.invoicing === true` |
| **Audit logs** | Nieuwe `audit_logs` tabel met `actor_id`, `action`, `entity`, `before`, `after` |
| **Impersonation** | Tijdelijk `tenantId` in sessie overschrijven met een `impersonating` flag |
| **Usage limits** | `tenants.limits` JSONB + counter queries per tenant |
