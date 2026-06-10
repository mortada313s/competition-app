# Changelog

## [1.1.0] - 2026-06-10

### Changed
- Migrated database from JSON file to MySQL
- Server now uses mysql2 connection pool
- Agents deletion uses transactions for data integrity

### Added
- MySQL schema with foreign key constraints
- `.env.example` for environment configuration

## [1.0.0] - 2026-06-05

### Added
- Agent login system with name + secret code
- Unique QR code generation per participant
- Two-challenge competition flow with animated circular timer
- Prize system with configurable probability weights
- Admin dashboard with live stats (refreshes every 5s)
- Company branding (logo upload + welcome message)
- Protected admin routes
- One-time QR code usage enforcement
- Result management (delete single or all records)
- Admin account settings (change username + password)
- Dark space-themed UI with neon effects
