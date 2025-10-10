import json
import re
import asyncio
from typing import List, Dict

import aiohttp
from bs4 import BeautifulSoup

from common import (
    BASE_URL, TIMEOUT, CONNECTOR_LIMIT,
    log_debug, log_error, fetch_html, batch_fetch
)


async def parse_skill_detail(session: aiohttp.ClientSession, en_name: str, cn_name: str) -> Dict:
    """异步解析单个被动技能详情（优化属性解析）"""
    try:
        skill_url = BASE_URL + en_name
        html = await fetch_html(session, skill_url)
        if not html:
            return {}

        soup = BeautifulSoup(html, "lxml")
        soup_div = soup.select_one("div.card.ui_item.popupItem")
        if not soup_div:
            return {}

        # 解析标签和基础信息（复用选择器）
        tags = [t.text for t in soup_div.select("span.border.p-1.mb-1.tag")]
        desc_div = soup_div.select_one("div.explicitMod")
        desc = desc_div.text.strip() if desc_div else ""
        icon_img = soup_div.find("img")
        icon = icon_img.get("src", "")

        # 解析技能属性（用字典映射减少条件判断）
        attr_map = {
            "魔力封印": "magic_seal",
            "主属性：": "main_attribute",
            "伤害倍率": "damage_match",
            "施法速度": "casting_speed"
        }
        attrs = {key: "" for key in attr_map.values()}

        for d in soup_div.select("div.d-flex.justify-content-center"):
            di = d.find("div")
            if not di:
                continue
            text = di.text
            next_div = di.find_next_sibling("div")
            if not next_div or text not in attr_map:
                continue

            attr_key = attr_map[text]
            if text == "施法速度":
                # 提取数值（简化正则）
                match = re.search(r"\d+\.?\d*", next_div.text)
                attrs[attr_key] = match.group() if match else ""
            else:
                attrs[attr_key] = next_div.text.strip()

        return {
            "id": en_name,
            "name": cn_name,
            "icon": icon,
            "type": 'passive',
            "tags": tags,
            "description": desc,** attrs
        }

    except Exception as e:
        log_error(f"解析技能 {cn_name} 详情失败: {e}")
        return {}


async def get_skill_list(session: aiohttp.ClientSession) -> List[Dict]:
    """获取被动技能列表（优化选择器）"""
    html = await fetch_html(session, BASE_URL + "Passive_Skill")
    if not html:
        return []

    soup = BeautifulSoup(html, "lxml")
    return [
        {"en_name": a["href"], "cn_name": a.text.strip()}
        for a in soup.select("div#被动技能Tag div.flex-grow-1.mx-2.my-1 a")
        if a.has_attr("href")
    ]


async def main(concurrency: int = 30):
    connector = aiohttp.TCPConnector(limit=CONNECTOR_LIMIT)
    async with aiohttp.ClientSession(connector=connector, timeout=TIMEOUT) as session:
        log_debug("正在获取被动技能列表...")
        skills_list = await get_skill_list(session)
        log_debug(f"找到 {len(skills_list)} 个被动技能")

        log_debug("正在批量解析技能详情...")
        valid_skills = await batch_fetch(session, skills_list, parse_skill_detail, concurrency)
        return json.dumps(valid_skills, ensure_ascii=False)


if __name__ == "__main__":
    print(asyncio.run(main(30)))