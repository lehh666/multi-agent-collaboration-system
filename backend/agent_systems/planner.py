from typing import List, Dict, Any
import json
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

PLANNER_INSTRUCTIONS = """
你是一个多智能体系统的任务规划专家。你的目标是将用户的复杂请求拆解为一系列有序的子任务，并分配给最合适的智能体。

可用的智能体及其专长：
1. mathematician (数学家): 数学分析、逻辑推理、算法、数据计算
2. artist (艺术家): 视觉设计、创意表达、配色、布局、SVG生成
3. engineer (工程师): 编程实现、代码架构、技术方案、前端/后端开发
4. merchant (商人): 经济分析、投资建议、商业决策、成本估算
5. athlete (运动员): 运动训练、健身计划、健康管理、体育知识
6. doctor (医生): 医学诊断、健康咨询、疾病预防、医疗建议

请分析用户的请求，返回一个 JSON 对象，包含以下字段：
- description: 任务的简要描述
- steps: 一个步骤列表，每个步骤包含：
  - agent: 执行该步骤的智能体 ID (必须是上述英文 ID 之一)
  - instruction: 给该智能体的具体指令
  - reason: 为什么选择这个智能体

示例输出格式：
{
  "description": "设计并开发一个健身追踪应用",
  "steps": [
    {
      "agent": "athlete",
      "instruction": "分析健身追踪应用的核心功能需求，制定专业的运动数据指标",
      "reason": "需要专业的运动知识来定义功能"
    },
    {
      "agent": "artist",
      "instruction": "根据运动指标设计应用的UI界面和交互流程",
      "reason": "负责视觉和交互设计"
    },
    {
      "agent": "engineer",
      "instruction": "根据设计稿实现前端代码和数据存储逻辑",
      "reason": "负责技术实现"
    }
  ]
}
"""

def plan_task(user_request: str) -> Dict[str, Any]:
    """
    使用 LLM 规划任务
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": PLANNER_INSTRUCTIONS},
                {"role": "user", "content": user_request}
            ],
            response_format={"type": "json_object"},
            temperature=0.7
        )
        
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"规划任务失败: {e}")
        # 降级处理：如果规划失败，默认分配给任务分配员（这里返回空步骤，由前端处理）
        return {
            "description": user_request,
            "steps": []
        }
