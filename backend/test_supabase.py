import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

print(f"URL: {supabase_url}")
print(f"Key: {supabase_key[:10]}..." if supabase_key else "Key: None")

if not supabase_url or not supabase_key:
    print("❌ 缺少 Supabase 配置")
    exit(1)

try:
    supabase = create_client(supabase_url, supabase_key)
    # 尝试查询（即使表为空或不存在，连接本身应该成功，或者抛出特定错误）
    # 查询一个不存在的表通常会返回错误，但能证明连接通了
    # 我们查询 world_states 表
    response = supabase.table("world_states").select("count", count="exact").execute()
    print("✅ Supabase 连接成功！")
    print(f"查询结果: {response}")
except Exception as e:
    print(f"❌ 连接失败: {e}")