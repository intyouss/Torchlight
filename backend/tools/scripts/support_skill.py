import json
import asyncio
import sys
from yarl import URL

import aiohttp
from bs4 import BeautifulSoup
from typing import List, Dict

MAIN_URL = "https://tlidb.com/cn/"

def log_debug(message):
    """输出调试信息到stderr"""
    print("[DEBUG]" + message, file=sys.stderr)

def log_error(message):
    """输出错误信息到stderr"""
    print("[ERROR]" + message, file=sys.stderr)

async def fetch_html(session: aiohttp.ClientSession, url: str) -> str:
    """异步获取HTML内容"""
    try:
        url = URL(url, encoded=True)
        async with session.get(url) as response:
            return await response.text()
    except Exception as e:
        log_error(f"获取 {url} 失败: {e}")
        return ""


async def parse_skill_detail(session: aiohttp.ClientSession, en_name: str, cn_name: str) -> Dict:
    """异步解析单个技能详情"""
    try:
        # 获取技能详情页
        skill_url = MAIN_URL + en_name
        html = await fetch_html(session, skill_url)

        if not html:
            return {}

        soup = BeautifulSoup(html, "lxml")
        soup_div = soup.find("div", attrs={"class": "card ui_item popupItem"})
        if not soup_div:
            return {}

        # 解析标签
        tag_spans = soup_div.find_all("span", attrs={"class": "border p-1 mb-1 tag"})
        tags = [tag_span.get_text() for tag_span in tag_spans]

        # 解析描述
        desc_div = soup_div.find("div", attrs={"class": "explicitMod"})
        for small in desc_div.find_all("small", attrs={"class": "description"}):
            small.decompose()
        desc = desc_div.text if desc_div else ""

        # 解析图标
        icon_img = soup_div.find("img")
        icon = icon_img["src"] if icon_img.has_attr("src") else ""

        # 初始化属性
        mana_cost_match = ""

        # 解析技能属性
        all_div = soup_div.find_all("div", attrs={"class": "d-flex justify-content-center"})
        for d in all_div:
            di = d.find("div")
            if not di:
                continue

            text = di.get_text()
            next_div = di.find_next_sibling('div')
            if not next_div:
                continue

            if text == "魔力消耗倍率":
                mana_cost_match = next_div.get_text()

        result = {
            "id": en_name,
            "name": cn_name,
            "icon": icon,
            "mana_cost_match": mana_cost_match,
            "type": 'support',
            "tags": tags,
            "description": desc,
        }

        return result

    except Exception as e:
        log_error(f"解析技能 {cn_name} 详情失败: {e}")
        return {}


async def get_skill_list(session: aiohttp.ClientSession) -> List[Dict]:
    """获取技能列表"""
    html = await fetch_html(session, MAIN_URL + "Support_Skill")
    if not html:
        return []

    soup = BeautifulSoup(html, "lxml")
    active_div = soup.find("div", attrs={"id": "辅助技能Tag"})
    skill_divs = active_div.find_all("div", attrs={"class": "flex-grow-1 mx-2 my-1"})

    skills_list = []
    for div in skill_divs:
        try:
            a_tag = div.find("a")
            if a_tag:
                en_name = a_tag["href"]
                cn_name = a_tag.get_text()
                skills_list.append({"en_name": en_name, "cn_name": cn_name})
        except Exception as e:
            log_error(f"解析技能链接失败: {e}")
            continue
    return skills_list


async def get_active_skills(concurrency: int = 10):
    """主函数：异步获取所有主动技能"""
    connector = aiohttp.TCPConnector(limit=concurrency)
    timeout = aiohttp.ClientTimeout(total=30)

    async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
        # 第一步：获取所有技能名称
        log_debug("正在获取技能列表...")
        skills_list = await get_skill_list(session)
        log_debug(f"找到 {len(skills_list)} 个辅助技能")

        # 第二步：异步获取所有技能详情
        log_debug("正在异步获取技能详情...")
        tasks = []
        for skill_info in skills_list:
            task = parse_skill_detail(session, skill_info["en_name"], skill_info["cn_name"])
            tasks.append(task)

        # 限制并发数量
        semaphore = asyncio.Semaphore(concurrency)

        async def bounded_task(ts):
            async with semaphore:
                return await ts

        bounded_tasks = [bounded_task(task) for task in tasks]
        sks = await asyncio.gather(*bounded_tasks, return_exceptions=True)

        # 过滤有效结果
        valid_skills = [skill for skill in sks if skill and not isinstance(skill, Exception)]
        failed_count = len(sks) - len(valid_skills)

        log_debug(f"成功获取 {len(valid_skills)} 个技能详情")
        if failed_count > 0:
            log_debug(f"失败 {failed_count} 个技能")

        return json.dumps(valid_skills, ensure_ascii=False)


if __name__ == "__main__":
    print(asyncio.run(get_active_skills(20)))