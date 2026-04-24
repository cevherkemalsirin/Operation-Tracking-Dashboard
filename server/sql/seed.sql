-- Demo users inserted by scripts/seed.js after hashing passwords:
-- admin@nokia.com / admin1234
-- operator@nokia.com / operator1234
-- viewer@nokia.com / viewer1234

TRUNCATE TABLE tickets RESTART IDENTITY CASCADE;
TRUNCATE TABLE users RESTART IDENTITY CASCADE;
