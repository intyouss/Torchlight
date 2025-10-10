import asyncio
import json
import re
from typing import Dict

import aiohttp
from bs4 import BeautifulSoup

from common import (
    BASE_URL, TIMEOUT, CONNECTOR_LIMIT,
    log_debug, fetch_html
)


async def process_trait(child_div) -> Dict:
    """解析单个英雄特性（简化层级查找）"""
    result_div = child_div.find_parent('div')
    ff_div = result_div.find_parent('div')
    icon_img = ff_div.find("img")
    icon = icon_img.get("src", "") if icon_img else ""

    name = child_div.text.strip()
    # 提取解锁等级（优化正则匹配）
    unlock_level_match = re.search(r'需求等级\s*(\d+)', result_div.text)
    unlock_level = unlock_level_match.group(1) if unlock_level_match else ""
    # 提取描述（直接索引定位）
    desc_divs = result_div.find_all('div')
    desc = desc_divs[1].text.strip() if len(desc_divs) > 1 else ""

    return {
        "id": name,
        "name": name,
        "icon": icon,
        "desc": desc,
        "unlock_level": unlock_level
    }


async def process_hero(session: aiohttp.ClientSession, div) -> Dict:
    """处理单个英雄（复用session，减少连接创建）"""
    a_tag = div.find('a')
    if not a_tag:
        return {}

    hero_en_name = a_tag.get('href', "")
    hero_cn_name = a_tag.text.strip()
    f_div = div.find_parent("div")
    icon_img = f_div.find("img") if f_div else None
    hero_icon = icon_img.get("src", "") if icon_img else ""
    # 提取描述（处理空值）
    hr_tag = div.find('hr')
    hero_desc = hr_tag.next_sibling.strip() if hr_tag and hr_tag.next_sibling else ""

    # 获取特性页面（复用全局session）
    trait_html = await fetch_html(session, BASE_URL + hero_en_name)
    if not trait_html:
        return {}

    trait_soup = BeautifulSoup(trait_html, 'lxml')
    child_divs = trait_soup.find_all('div', class_='fw-bold')
    # 并发解析特性（使用semaphore控制）
    traits = await asyncio.gather(*[process_trait(div) for div in child_divs])

    return {
        "id": hero_en_name,
        "name": hero_cn_name,
        "desc": hero_desc,
        "icon": hero_icon,
        "traits": [t for t in traits if t],  # 过滤空值
    }


async def get_hero_info(concurrency: int = 30):
    """主函数：获取所有英雄信息（优化并发控制）"""
    connector = aiohttp.TCPConnector(limit=CONNECTOR_LIMIT)
    async with aiohttp.ClientSession(connector=connector, timeout=TIMEOUT) as session:
        log_debug("正在获取英雄列表...")
        main_html = await fetch_html(session, BASE_URL + "Hero")
        if not main_html:
            return "[]"

        main_soup = BeautifulSoup(main_html, "lxml")
        hero_divs = main_soup.select("div.flex-grow-1.mx-2.my-1")  # CSS选择器提速

        # 限制并发数量（复用公共逻辑）
        semaphore = asyncio.Semaphore(concurrency)
        async def bounded_task(div):
            async with semaphore:
                return await process_hero(session, div)

        tasks = [bounded_task(div) for div in hero_divs]
        results = await asyncio.gather(*tasks)
        valid_heroes = [h for h in results if h]  # 过滤空结果

        log_debug(f"已获取 {len(valid_heroes)} 个英雄")
        return json.dumps(valid_heroes, ensure_ascii=False)


if __name__ == "__main__":
    print(asyncio.run(get_hero_info(30)))