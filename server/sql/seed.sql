-- Demo users and tickets are inserted by scripts/seed.js.
-- Run from the server folder:
-- npm run seed
--
-- Main demo users:
-- admin@nokia.com / admin1234
-- cevher@nokia.com / cevher1234
-- vlad@nokia.com / vlad1234
-- viewer@example.com / viewer1234

TRUNCATE TABLE tickets RESTART IDENTITY CASCADE;
TRUNCATE TABLE users RESTART IDENTITY CASCADE;
