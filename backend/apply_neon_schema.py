"""One-off script to apply schema.sql to the Neon database and verify tables."""
import psycopg2

DATABASE_URL = "postgresql://neondb_owner:npg_zN4pqjBgvr9h@ep-aged-fire-ayrf3p7m-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

with open("../schema.sql", "r", encoding="utf-8") as f:
    schema = f.read()



conn.autocommit = True
cur = conn.cursor()

print("Connected to Neon. Applying schema...")
cur.execute(schema)
print("Schema applied.")

cur.execute(
    """
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name;
    """
)
tables = [r[0] for r in cur.fetchall()]
print(f"\n{len(tables)} tables in 'public' schema:")
for t in tables:
    print(" -", t)

cur.close()
conn.close()
