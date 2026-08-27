-- Up Migration
-- Credit packages (2026-08-20): academy-defined bundles of session credits
-- with a money price — the first real dollars↔credits link. Staff define
-- packages (Finance > Packages); recording a payment against a package
-- credits the student's wallet with credits + bonus_credits in the same
-- transaction (paymentRoutes). Rows are soft-retired via is_active so old
-- payments keep their package reference.
CREATE TABLE credit_packages (
  package_id    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          TEXT NOT NULL,
  credits       INT NOT NULL CHECK (credits > 0),
  bonus_credits INT NOT NULL DEFAULT 0 CHECK (bonus_credits >= 0),
  price         NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    INT NOT NULL DEFAULT 0,
  created_by    INT REFERENCES users(user_id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Payments can record which package they bought.
ALTER TABLE payments
  ADD COLUMN package_id INT REFERENCES credit_packages(package_id);

-- Down Migration
ALTER TABLE payments DROP COLUMN package_id;
DROP TABLE credit_packages;
