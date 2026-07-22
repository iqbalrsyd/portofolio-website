-- =====================================================
-- Backend Performance Lab — Postgres bootstrap
-- Idempotent: safe to re-run via docker-entrypoint-initdb.d
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ---------- users ----------
CREATE TABLE IF NOT EXISTS users (
    id         BIGSERIAL PRIMARY KEY,
    email      VARCHAR(255) UNIQUE NOT NULL,
    name       VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- products ----------
CREATE TABLE IF NOT EXISTS products (
    id         BIGSERIAL PRIMARY KEY,
    sku        VARCHAR(64)  UNIQUE NOT NULL,
    name       VARCHAR(255) NOT NULL,
    price      NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    stock      INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- orders ----------
CREATE TABLE IF NOT EXISTS orders (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id)  ON DELETE RESTRICT,
    product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    qty         INTEGER NOT NULL CHECK (qty > 0),
    total       NUMERIC(12,2) NOT NULL,
    status      VARCHAR(32) NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stage 7 Experiment 6 will add / drop indexes.
-- Initial indexes are minimal on purpose.
CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);

-- ---------- seed (only when empty) ----------
INSERT INTO users (email, name)
SELECT 'user' || g || '@lab.local', 'User ' || g
FROM generate_series(1, 10) g
WHERE NOT EXISTS (SELECT 1 FROM users);

INSERT INTO products (sku, name, price, stock)
SELECT 'SKU-' || lpad(g::text, 4, '0'),
       'Product ' || g,
       (random() * 100 + 5)::numeric(12,2),
       (random() * 200 + 10)::int
FROM generate_series(1, 20) g
WHERE NOT EXISTS (SELECT 1 FROM products);
