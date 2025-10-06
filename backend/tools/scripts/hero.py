import asyncio
import json
import re
import sys

import aiohttp
from bs4 import BeautifulSoup

URL = "https://tlidb.com/cn/"

def log_debug(message):
    """输出调试信息到stderr"""
    print("[DEBUG]" + message, file=sys.stderr)

def log_error(message):
    """输出错误信息到stderr"""
    print("[ERROR]" + message, file=sys.stderr)


# 异步单个英雄
async def process_hero(div, concurrency = 10):
    hero_en_name = div.find('a').get('href')
    hero_cn_name = div.find('a').text
    f_div = div.find_parent("div")
    hero_icon = f_div.find("img")["src"] if f_div.find("img").has_attr("src") else ""
    hero_desc = div.find('hr').next_sibling.strip()

    trait_html = await fetch(URL + hero_en_name, concurrency)
    trait_soup = BeautifulSoup(trait_html, 'lxml')
    child_divs = trait_soup.find_all('div', attrs={'class': 'fw-bold'})

    trait_tasks = [process_trait(div) for div in child_divs]
    traits = await asyncio.gather(*trait_tasks)

    return {
        "id": hero_en_name,
        "name": hero_cn_name,
        "desc": hero_desc,
        "icon": hero_icon,
        "traits": traits,
    }

# 异步单个特性
async def process_trait(child_div):
    result_div = child_div.find_parent('div')
    ff_div = result_div.find_parent('div')
    icon = ff_div.find("img")["src"] if ff_div.find("img").has_attr("src") else ""
    name = child_div.text
    unlock_level = re.search(r'需求等级\s*(\d+)', result_div.text).group(1)
    desc = result_div.find_all('div')[1].get_text()
    return {
        "id": name,
        "name": name,
        "icon": icon,
        "desc": desc,
        "unlock_level": unlock_level
    }

async def fetch(url,concurrency):
    async with asyncio.Semaphore(concurrency):
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                return await response.text()

async def get_hero_info(concurrency = 10):
    log_debug("正在获取英雄列表...")
    main_html = await fetch(URL + "Hero", concurrency)
    main_soup = BeautifulSoup(main_html, "lxml")
    hero_divs = main_soup.find_all('div', attrs={'class': 'flex-grow-1 mx-2 my-1'})

    tasks = [process_hero(div) for div in hero_divs]
    results = await asyncio.gather(*tasks)
    log_debug(f"已获取 {len(results)} 个英雄")
    json_string = json.dumps(results, ensure_ascii=False)

    return json_string

if __name__ == "__main__":
    print(asyncio.run(get_hero_info(20)))
