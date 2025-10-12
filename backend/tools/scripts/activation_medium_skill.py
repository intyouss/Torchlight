import json
import asyncio
from typing import List, Dict

import aiohttp
from bs4 import BeautifulSoup

from common import (
    BASE_URL, TIMEOUT, CONNECTOR_LIMIT,
    log_debug, log_error, fetch_html, batch_fetch
)


async def parse_skill_detail(session: aiohttp.ClientSession, en_name: str, cn_name: str) -> Dict:
    """异步解析单个辅助技能详情（优化解析效率）"""
    try:
        skill_url = BASE_URL + en_name
        html = await fetch_html(session, skill_url)
        if not html:
            return {}

        soup = BeautifulSoup(html, "lxml")
        soup_div = soup.select_one("div.card.ui_item.popupItem")  # CSS选择器提速
        if not soup_div:
            return {}

        # 解析标签（合并列表生成式）
        tags = [t.text for t in soup_div.select("span.border.p-1.mb-1.tag")]

        # 解析描述（直接定位并清理）
        desc_divs = soup_div.select("div.explicitMod")
        desc = ""
        if desc_divs:
            for i, explicitMod in enumerate(desc_divs):
                if i == 0:
                    desc += explicitMod.text.strip().replace("该技能只能安装在每个主动技能的第 1 个辅助技能栏位。", "")
                else:
                    desc += explicitMod.text.strip() + "。"

        # 解析图标（简化判断）
        icon_img = soup_div.find("img")
        icon = icon_img.get("src", "")

        # 解析魔力消耗倍率（合并循环逻辑）
        mana_cost_match = ""
        for d in soup_div.select("div.d-flex.justify-content-center"):
            di = d.find("div")
            if di and di.text == "魔力消耗倍率":
                next_div = di.find_next_sibling("div")
                mana_cost_match = next_div.text if next_div else ""
                break  # 找到后提前退出循环

        return {
            "id": en_name,
            "name": cn_name,
            "icon": icon,
            "mana_cost_match": mana_cost_match,
            "type": 'activation_medium',
            "tags": tags,
            "description": desc,
        }

    except Exception as e:
        log_error(f"解析技能 {cn_name} 详情失败: {e}")
        return {}


async def get_skill_list(session: aiohttp.ClientSession) -> List[Dict]:
    """获取辅助技能列表（优化选择器）"""
    html = await fetch_html(session, BASE_URL + "Activation_Medium_Skill")
    if not html:
        return []

    soup = BeautifulSoup(html, "lxml")
    # 直接用CSS选择器定位所有技能链接，减少中间步骤
    return [
        {"en_name": a["href"], "cn_name": a.text.strip()}
        for a in soup.select("div#触媒技能Tag div.flex-grow-1.mx-2.my-1 a")
        if a.has_attr("href")
    ]


async def main(concurrency: int = 30):  # 提高并发数
    connector = aiohttp.TCPConnector(limit=CONNECTOR_LIMIT)
    async with aiohttp.ClientSession(connector=connector, timeout=TIMEOUT) as session:
        log_debug("正在获取触媒技能列表...")
        skills_list = await get_skill_list(session)
        log_debug(f"找到 {len(skills_list)} 个触媒技能")

        log_debug("正在批量解析技能详情...")
        valid_skills = await batch_fetch(session, skills_list, parse_skill_detail, concurrency)
        return json.dumps(valid_skills, ensure_ascii=False)


if __name__ == "__main__":
    print(asyncio.run(main(30)))