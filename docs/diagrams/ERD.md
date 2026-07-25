El siguiente diagrama representa el modelo de datos final de PackFlow, normalizado hasta la tercera forma normal.

![Diagrama ERD en tercera forma normal](/images/packflow_erd_3nf.svg)

```bash
@startuml packflow_erd_3nf
title PackFlow - ERD final normalizado hasta la tercera forma normal
hide circle
skinparam linetype ortho
skinparam classAttributeIconSize 0

entity "business_accounts" as business_accounts {
    * business_account_id : UUID <<PK>>
    --
    * business_name : VARCHAR(150)
    * admin_email : VARCHAR(254) <<UNIQUE>>
    * password_hash : VARCHAR(255)
    * account_status : VARCHAR(20)
    * version : BIGINT
    * created_at : TIMESTAMPTZ
    * updated_at : TIMESTAMPTZ
}

entity "sessions" as sessions {
    * session_id : UUID <<PK, refresh token family>>
    --
    * business_account_id : UUID <<FK>>
    * last_seen_at : TIMESTAMPTZ
    revoked_at : TIMESTAMPTZ
    * created_at : TIMESTAMPTZ
}

entity "session_refresh_tokens" as session_refresh_tokens {
    * refresh_token_id : UUID <<PK>>
    --
    * session_id : UUID <<FK>>
    * token_hash : VARCHAR(255) <<UNIQUE>>
    * issued_at : TIMESTAMPTZ
    used_at : TIMESTAMPTZ
    revoked_at : TIMESTAMPTZ
    replaced_by_refresh_token_id : UUID <<FK nullable>>
    * created_at : TIMESTAMPTZ
}

entity "password_reset_tokens" as password_reset_tokens {
    * password_reset_token_id : UUID <<PK>>
    --
    * business_account_id : UUID <<FK>>
    * token_hash : VARCHAR(255) <<UNIQUE>>
    * expires_at : TIMESTAMPTZ
    used_at : TIMESTAMPTZ
    * created_at : TIMESTAMPTZ
}

entity "account_settings" as account_settings {
    * business_account_id : UUID <<PK, FK>>
    --
    * igv_rate : DECIMAL(5,4)
    * theme : VARCHAR(20)
    * font_size : VARCHAR(20)
    * version : BIGINT
    * updated_at : TIMESTAMPTZ
}

entity "categories" as categories {
    * category_id : UUID <<PK>>
    --
    * business_account_id : UUID <<FK, composite scope>>
    * category_name : VARCHAR(100) <<UNIQUE per account>>
    * created_at : TIMESTAMPTZ
}

entity "materials" as materials {
    * material_id : UUID <<PK>>
    --
    * business_account_id : UUID <<FK, composite scope>>
    * material_name : VARCHAR(100) <<UNIQUE per account>>
    * created_at : TIMESTAMPTZ
}

entity "products" as products {
    * product_id : UUID <<PK>>
    --
    * business_account_id : UUID <<FK, composite scope>>
    * category_id : UUID <<FK, composite scope>>
    * material_id : UUID <<FK, composite scope>>
    * product_name : VARCHAR(150) <<UNIQUE active identity>>
    * length_cm : DECIMAL(10,2) <<CHECK > 0 and <= 1000>>
    * width_cm : DECIMAL(10,2) <<CHECK > 0 and <= 1000>>
    * height_cm : DECIMAL(10,2) <<CHECK > 0 and <= 1000>>
    * is_active : BOOLEAN
    * version : BIGINT
    * created_at : TIMESTAMPTZ
    * updated_at : TIMESTAMPTZ
}

entity "product_stock" as product_stock {
    * product_id : UUID <<PK, FK>>
    --
    * current_stock : INTEGER <<CHECK >= 0>>
    * updated_at : TIMESTAMPTZ
}

entity "price_types" as price_types {
    * price_type_id : UUID <<PK>>
    --
    * type_code : VARCHAR(20) <<UNIQUE, global reference>>
    * type_name : VARCHAR(50)
    * minimum_quantity : INTEGER <<CHECK >= 1>>
    maximum_quantity : INTEGER <<CHECK >= minimum or NULL>>
}

entity "product_prices" as product_prices {
    * product_id : UUID <<PK, FK>>
    * price_type_id : UUID <<PK, FK>>
    --
    * price_amount : DECIMAL(12,2) <<CHECK >= 0>>
    * updated_at : TIMESTAMPTZ
}

entity "serigraphy_price_tiers" as serigraphy_price_tiers {
    * serigraphy_tier_id : UUID <<PK>>
    --
    * business_account_id : UUID <<FK, composite scope>>
    * minimum_quantity : INTEGER <<UNIQUE per account and minimum, CHECK >= 20>>
    maximum_quantity : INTEGER <<CHECK >= minimum or NULL>>
    * price_per_lot_color : DECIMAL(12,2) <<CHECK >= 0>>
    * created_at : TIMESTAMPTZ
    * updated_at : TIMESTAMPTZ
}

entity "idempotency_requests" as idempotency_requests {
    * idempotency_request_id : UUID <<PK>>
    --
    * business_account_id : UUID <<FK>>
    * idempotency_key : VARCHAR(100) <<UNIQUE per account>>
    * operation_type : VARCHAR(50)
    * request_hash : VARCHAR(128)
    * response_status : SMALLINT
    * response_body : JSONB
    * expires_at : TIMESTAMPTZ
    * created_at : TIMESTAMPTZ
}

entity "sales" as sales {
    * sale_id : UUID <<PK>>
    --
    * business_account_id : UUID <<FK>>
    * idempotency_request_id : UUID <<FK composite, UNIQUE>>
    * sale_status : VARCHAR(20) <<CHECK CONFIRMED>>
    * created_at : TIMESTAMPTZ
    * subtotal_before_discount : DECIMAL(12,2) <<CHECK >= 0>>
    discount_type : VARCHAR(20) <<CHECK PERCENTAGE/FIXED or NULL>>
    discount_value : DECIMAL(12,2) <<CHECK >= 0>>
    discount_amount : DECIMAL(12,2) <<CHECK >= 0>>
    * subtotal_after_discount : DECIMAL(12,2) <<CHECK >= 0>>
    * igv_rate_applied : DECIMAL(5,4)
    * igv_amount : DECIMAL(12,2) <<CHECK >= 0>>
    * total_amount : DECIMAL(12,2) <<CHECK >= 0>>
}

entity "sale_items" as sale_items {
    * sale_id : UUID <<PK, FK>>
    * line_number : INTEGER <<PK>>
    --
    * business_account_id : UUID <<FK, composite scope>>
    * product_id : UUID <<FK, composite scope>>
    * price_type_id : UUID <<FK>>
    * product_name_at_sale : VARCHAR(150)
    * category_name_at_sale : VARCHAR(100)
    * material_name_at_sale : VARCHAR(100)
    * length_cm_at_sale : DECIMAL(10,2)
    * width_cm_at_sale : DECIMAL(10,2)
    * height_cm_at_sale : DECIMAL(10,2)
    * quantity : INTEGER <<CHECK > 0>>
    * unit_price_applied : DECIMAL(12,2)
    * product_subtotal : DECIMAL(12,2)
}

entity "sale_item_serigraphy" as sale_item_serigraphy {
    * sale_id : UUID <<PK, FK>>
    * line_number : INTEGER <<PK, FK>>
    --
    * business_account_id : UUID <<FK, composite scope>>
    * colors : INTEGER <<CHECK 1..10>>
    * lots : INTEGER <<CHECK > 0>>
    * rate_applied : DECIMAL(12,2) <<CHECK >= 0>>
    * serigraphy_amount : DECIMAL(12,2) <<CHECK >= 0>>
}

entity "inventory_movements" as inventory_movements {
    * movement_id : UUID <<PK>>
    --
    * business_account_id : UUID <<FK>>
    * product_id : UUID <<FK, composite scope>>
    sale_id : UUID <<FK composite>>
    * idempotency_request_id : UUID <<FK composite>>
    * movement_type : VARCHAR(30)
    * quantity_delta : INTEGER <<CHECK <> 0>>
    * previous_stock : INTEGER <<CHECK >= 0>>
    * resulting_stock : INTEGER <<CHECK >= 0>>
    * reason : VARCHAR(255)
    * created_at : TIMESTAMPTZ
}

business_accounts ||--o{ sessions
sessions ||--o{ session_refresh_tokens
session_refresh_tokens ||--o| session_refresh_tokens
business_accounts ||--o{ password_reset_tokens
business_accounts ||--|| account_settings
business_accounts ||--o{ categories
business_accounts ||--o{ materials
business_accounts ||--o{ products
business_accounts ||--o{ serigraphy_price_tiers
business_accounts ||--o{ idempotency_requests
business_accounts ||--o{ sales
business_accounts ||--o{ inventory_movements
categories ||--o{ products
materials ||--o{ products
products ||--|| product_stock
products ||--o{ product_prices
price_types ||--o{ product_prices
products ||--o{ sale_items
price_types ||--o{ sale_items
sales ||--|{ sale_items
sale_items ||--o| sale_item_serigraphy
products ||--o{ inventory_movements
sales ||--o{ inventory_movements
idempotency_requests ||--o| sales
idempotency_requests ||--o{ inventory_movements

@enduml

```

