-- Existing databases were created before PROCESSING and PACKED were part of
-- the fulfilment workflow. Hibernate does not replace existing PostgreSQL
-- CHECK constraints when a Java enum gains a value, so update them explicitly.

DO $$
BEGIN
    -- Fresh databases have no tables yet when Flyway runs; Hibernate creates
    -- them later with the current enum values, so only alter existing tables.
    IF to_regclass('public.orders') IS NOT NULL THEN
        ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
        ALTER TABLE orders
            ADD CONSTRAINT orders_status_check
            CHECK (status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED'));
    END IF;

    IF to_regclass('public.order_status_history') IS NOT NULL THEN
        ALTER TABLE order_status_history DROP CONSTRAINT IF EXISTS order_status_history_status_check;
        ALTER TABLE order_status_history
            ADD CONSTRAINT order_status_history_status_check
            CHECK (status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED'));

        ALTER TABLE order_status_history DROP CONSTRAINT IF EXISTS order_status_history_previous_status_check;
        ALTER TABLE order_status_history
            ADD CONSTRAINT order_status_history_previous_status_check
            CHECK (previous_status IS NULL OR previous_status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED'));
    END IF;
END $$;
