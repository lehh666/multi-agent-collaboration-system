"""测试 OpenAI API Key 是否有效"""
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    print("❌ 未找到 OPENAI_API_KEY")
    exit(1)

print(f"✅ 找到 API Key: {api_key[:20]}...{api_key[-10:]}")

try:
    client = OpenAI(api_key=api_key)
    
    print("\n🔍 测试 API 连接...")
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": "Hi"}
        ],
        max_tokens=10
    )
    
    print("✅ API Key 有效！")
    print(f"📝 模型响应: {response.choices[0].message.content}")
    print(f"📊 使用的模型: {response.model}")
    print(f"💰 使用的 tokens: {response.usage.total_tokens}")
    
except Exception as e:
    print(f"❌ API Key 无效或发生错误: {e}")
    exit(1)
