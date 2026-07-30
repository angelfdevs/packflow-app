# Matriz de trazabilidad

| Épico | Requisitos | API | Persistencia | Pruebas |
|---|---|---|---|---|
| Identity & Access | US-001 a US-006, RNF-001 a RNF-004 | `/auth/*`, `/users/*` | `users`, `business_memberships`, `sessions`, `invitations` | Unit, integration, E2E |
| Catalog & Pricing | US-008 a US-011 | `/groups`, `/attribute-definitions`, `/products`, `/products/{productId}/price-rules`, `/charge-definitions` | `product_groups`, `attribute_definitions`, `products`, `product_price_rules`, `charge_definitions`, `charge_tiers` | Unit, integration |
| Inventory & Supply | US-012 a US-017 | `/inventory/*`, `/suppliers`, `/supplies` | `product_stock`, `inventory_movements`, `suppliers`, `supply_receipts` | Integration, concurrency |
| Commercial Operations | US-018 a US-022 | `/commercial-operations/preview`, `/sales/*` | `sales`, `sale_items`, `sale_charges`, `inventory_movements` | Unit, integration, E2E |
| Dashboard & Reports | US-023 a US-024 | `/dashboard/*`, `/reports/*` | Consultas sobre datos transaccionales | Contract, integration |
| Realtime & Audit | US-025 a US-026 | SignalR, `/audit-events` | `outbox_messages`, `audit_events` | Security, integration |
| Settings & Account | US-007, US-027 y US-028 | `/account`, `/settings`, `/me/preferences`, `/auth/password/*` | `businesses`, `account_settings`, `user_preferences`, `users`, `sessions` | Security, integration |

La matriz debe actualizarse cada vez que se agregue, retire o divida una historia.
