"""Hello World 示例：验证 openai-agents-python 环境配置"""
import os
import sys
from dotenv import load_dotenv
from agents import Agent, Runner

# 设置输出编码
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# 加载环境变量
load_dotenv()

# 检查 API Key
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("警告: 未找到 OPENAI_API_KEY 环境变量")
    print("请在 .env 文件中设置 OPENAI_API_KEY=your_key_here")
else:
    print("[OK] 找到 OPENAI_API_KEY")

# 创建简单 Agent
agent = Agent(
    name="Assistant",
    instructions="You are a helpful assistant. Reply concisely."
)

# 运行测试
if api_key:
    print("\n运行 Agent 测试...")
    try:
        result = Runner.run_sync(agent, "Write a haiku about recursion in programming.")
        print("\n" + "="*50)
        print("Agent 响应:")
        print("="*50)
        print(result.final_output)
        print("="*50)
        print("\n[SUCCESS] 环境配置成功！")
    except Exception as e:
        print(f"\n[ERROR] 运行失败: {e}")
        print("请检查 OPENAI_API_KEY 是否正确")
else:
    print("\n跳过 Agent 测试（需要 API Key）")
