-- MySQL schema for United-Hatzalah Gift
-- Targets Clever Cloud MySQL (MySQL 8.0+)
-- Notes:
-- - Does not create the database itself; only tables, indexes, and constraints
-- - Uses utf8mb4 for full Unicode support
-- - Wraps DDL in a transaction where possible

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- Ensure strict mode
SET sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

START TRANSACTION;

-- Create a dedicated schema if you want to namespace objects (optional)
-- CREATE SCHEMA IF NOT EXISTS `uh_gift` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE `uh_gift`;

-- -----------------------------
-- Core reference tables
-- -----------------------------

CREATE TABLE IF NOT EXISTS `categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_categories_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `brands` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_brands_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `catalogs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `pdf_url` VARCHAR(2048) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_catalogs_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------
-- Products and mapping to catalogs
-- -----------------------------

CREATE TABLE IF NOT EXISTS `products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `category_id` BIGINT UNSIGNED NULL,
  `brand_id` BIGINT UNSIGNED NULL,
  `unit_price_incl_vat` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `delivery_time_days` INT UNSIGNED NULL,
  `last_ordered_by_name` VARCHAR(255) NULL,
  `image_url` VARCHAR(2048) NULL,
  PRIMARY KEY (`id`),
  KEY `ix_products_category_id` (`category_id`),
  KEY `ix_products_brand_id` (`brand_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `fk_products_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------
-- Survey model (per product): structured questions with selectable answers
-- -----------------------------

-- Master list of questions (reusable across products)
CREATE TABLE IF NOT EXISTS `questions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `question_text` VARCHAR(500) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Options for each question (no free text)
CREATE TABLE IF NOT EXISTS `question_options` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `question_id` BIGINT UNSIGNED NOT NULL,
  `option_text` VARCHAR(255) NOT NULL,
  `option_value` VARCHAR(64) NULL,
  PRIMARY KEY (`id`),
  KEY `ix_question_options_question_id` (`question_id`),
  CONSTRAINT `fk_question_options_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assign questions to products (defines the per-product survey)
CREATE TABLE IF NOT EXISTS `product_questions` (
  `product_id` BIGINT UNSIGNED NOT NULL,
  `question_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`product_id`, `question_id`),
  KEY `ix_product_questions_question_id` (`question_id`),
  CONSTRAINT `fk_product_questions_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_product_questions_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Responses per product survey (includes rating 1..5)
CREATE TABLE IF NOT EXISTS `product_survey_responses` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `rating` TINYINT UNSIGNED NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_psr_product_id` (`product_id`),
  CONSTRAINT `chk_psr_rating_range` CHECK (`rating` IS NULL OR (`rating` >= 1 AND `rating` <= 5)),
  CONSTRAINT `fk_psr_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Selected options by respondent (supports single or multiple choice)
CREATE TABLE IF NOT EXISTS `response_answers` (
  `response_id` BIGINT UNSIGNED NOT NULL,
  `question_id` BIGINT UNSIGNED NOT NULL,
  `option_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`response_id`, `question_id`, `option_id`),
  KEY `ix_ra_question_id` (`question_id`),
  KEY `ix_ra_option_id` (`option_id`),
  CONSTRAINT `fk_ra_response` FOREIGN KEY (`response_id`) REFERENCES `product_survey_responses` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_ra_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_ra_option` FOREIGN KEY (`option_id`) REFERENCES `question_options` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Helpful composite indexes for reporting (use DROP IF EXISTS to allow re-runs)
DROP INDEX IF EXISTS `ix_products_category_brand` ON `products`;
CREATE INDEX `ix_products_category_brand` ON `products` (`category_id`, `brand_id`);

DROP INDEX IF EXISTS `ix_question_options_display_order` ON `question_options`;
CREATE INDEX `ix_question_options_display_order` ON `question_options` (`question_id`, `display_order`);

DROP INDEX IF EXISTS `ix_product_questions_display_order` ON `product_questions`;
CREATE INDEX `ix_product_questions_display_order` ON `product_questions` (`product_id`, `display_order`);

COMMIT;

-- ---------------------------------------
-- Example insertion (commented-out)
-- ---------------------------------------
-- INSERT INTO categories (name) VALUES ('אמבולנס'), ('ציוד רפואי');
-- INSERT INTO brands (name) VALUES ('מותג A'), ('מותג B');
-- INSERT INTO catalogs (name) VALUES ('קטלוג ראשי');
-- INSERT INTO products (item_number, name, category_id, brand_id, unit_price_incl_vat, delivery_time_days, last_ordered_by_name)
-- VALUES ('SKU-001', 'דפיברילטור', 1, 1, 1299.90, 7, 'ישראל ישראלי');
-- INSERT INTO product_catalogs (product_id, catalog_id) VALUES (1, 1);
-- -- Define a question and options
-- INSERT INTO questions (question_text, is_required, allows_multiple) VALUES ('האם המוצר ענה על הציפיות?', 1, 0);
-- INSERT INTO question_options (question_id, option_text, display_order) VALUES (1, 'כן', 1), (1, 'לא', 2);
-- INSERT INTO product_questions (product_id, question_id, display_order) VALUES (1, 1, 1);
-- -- Record a response with rating 5
-- INSERT INTO product_survey_responses (product_id, rating) VALUES (1, 5);
-- INSERT INTO response_answers (response_id, question_id, option_id) VALUES (1, 1, 1);


