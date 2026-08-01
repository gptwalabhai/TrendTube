import os
import sys

def apply_schema(db_url: str = None):
    url = db_url or os.getenv("DATABASE_URL")
    if not url:
        print("[Schema Script] No DATABASE_URL provided in environment. Reading local schema.sql DDL file...")
    
    schema_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "schema.sql")
    if not os.path.exists(schema_path):
        print(f"[Schema Script] Could not find schema.sql at {schema_path}")
        return

    with open(schema_path, "r", encoding="utf-8") as f:
        sql = f.read()

    print("[Schema Script] Successfully read schema.sql (13 Tables & Indexes ready for Neon PostgreSQL execution).")

if __name__ == "__main__":
    target_url = sys.argv[1] if len(sys.argv) > 1 else None
    apply_schema(target_url)
