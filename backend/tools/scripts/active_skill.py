import asyncio
import json
import re
from typing import List, Dict

import aiohttp
from bs4 import BeautifulSoup

from common import (
    TIMEOUT, CONNECTOR_LIMIT,
    log_debug, log_error, fetch_html, batch_fetch
)


async def parse_skill_detail(session: aiohttp.ClientSession, en_name: str, cn_name: str) -> Dict:
    try:
        html = await fetch_html(session, en_name)
        if not html:
            return {}

        soup = BeautifulSoup(html, "lxml")
        soup_div = soup.find("div", class_="card ui_item popupItem")
        if not soup_div:
            return {}

        # 解析标签（使用CSS选择器加速）
        tags = [t.text for t in soup_div.select("span.border.p-1.mb-1.tag")]

        # 解析描述
        desc_div = soup_div.find("div", class_="explicitMod")
        desc = desc_div.text.strip() if desc_div else ""

        # 解析图标
        icon_img = soup_div.find("img")
        icon = icon_img.get("src", "")

        # 解析属性（合并循环逻辑）
        attrs = {}
        for d in soup_div.find_all("div", class_="d-flex justify-content-center"):
            di = d.find("div")
            if not di:
                continue
            key = di.text.strip()
            val_div = di.find_next_sibling("div")
            if not val_div:
                continue
            val = val_div.text.strip()

            if key == "魔力消耗":
                attrs["mana_cost"] = val
            elif key == "主属性：":
                attrs["main_attribute"] = val
            elif key == "伤害倍率":
                attrs["damage_match"] = val
            elif key == "冷却时间":
                attrs["cooldown"] = re.search(r"\d+\.?\d*", val).group() if val else ""
            elif key == "施法速度":
                attrs["casting_speed"] = re.search(r"\d+\.?\d*", val).group() if val else ""

        # 解析武器限制
        weapon_restriction = soup_div.find("div", {"data-block": "weapon_restrict_description"})
        weapon_restrictions = []
        if weapon_restriction:
            weapon_restrictions = weapon_restriction.text.replace("限定", "").split("、")

        return {
            "id": en_name,
            "name": cn_name,
            "icon": icon,
            "type": "active",
            "tags": tags,
            "description": desc,
            "weapon_restrictions": weapon_restrictions,
            **attrs
        }

    except Exception as e:
        log_error(f"解析 {cn_name} 失败: {e}")
        return {}


async def get_skill_list(session: aiohttp.ClientSession) -> List[Dict]:
    html = await fetch_html(session, "Active_Skill")
    if not html:
        return []

    soup = BeautifulSoup(html, "lxml")
    return [
        {"en_name": a["href"], "cn_name": a.text.strip()}
        for div in soup.select("div#主动技能Tag div.flex-grow-1.mx-2.my-1")
        if (a := div.find("a"))
    ]


async def main(concurrency: int = 30):  # 提高并发数
    connector = aiohttp.TCPConnector(limit=CONNECTOR_LIMIT)
    async with aiohttp.ClientSession(connector=connector, timeout=TIMEOUT) as session:
        log_debug("获取技能列表...")
        skills_list = await get_skill_list(session)
        log_debug(f"找到 {len(skills_list)} 个主动技能")

        log_debug("批量解析技能详情...")
        valid_skills = await batch_fetch(session, skills_list, parse_skill_detail, concurrency)
        return json.dumps(valid_skills, ensure_ascii=False)


if __name__ == "__main__":
    print(asyncio.run(main(30)))  # 增大并发数