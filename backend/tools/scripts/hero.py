import asyncio
import json
import re
import sys

import aiohttp
from bs4 import BeautifulSoup

URL = "https://tlidb.com/cn/"

async def get_hero_info(concurrency = 10):

    semaphore = asyncio.Semaphore(concurrency)

    async def fetch(url):
        async with semaphore:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    return await response.text()


    # 异步单个英雄
    async def process_hero(div):
        hero_en_name = div.find('a').get('href')
        hero_cn_name = div.find('a').text
        hero_desc = div.find('hr').next_sibling.strip()

        trait_html = await fetch(URL + hero_en_name)
        trait_soup = BeautifulSoup(trait_html, 'lxml')
        child_divs = trait_soup.find_all('div', attrs={'class': 'fw-bold'})

        trait_tasks = [process_trait(div) for div in child_divs]
        traits = await asyncio.gather(*trait_tasks)

        return {
                "id": hero_en_name,
                "name": hero_cn_name,
                "desc": hero_desc,
                "traits": traits,
            }

    # 异步单个特性
    async def process_trait(child_div):
        result_div = child_div.find_parent('div')
        name = child_div.text
        unlock_level = re.search(r'需求等级\s*(\d+)', result_div.text).group(1)
        desc = result_div.find_all('div')[1].get_text()
        return {
            "id": name,
            "name": name,
            "desc": desc,
            "unlock_level": unlock_level
        }

    main_html = await fetch(URL + "Hero")
    main_soup = BeautifulSoup(main_html, "lxml")
    hero_divs = main_soup.find_all('div', attrs={'class': 'flex-grow-1 mx-2 my-1'})

    tasks = [process_hero(div) for div in hero_divs]
    results = await asyncio.gather(*tasks)
    json_string = json.dumps(results, ensure_ascii=False)


    return json_string

def main():
    try:
        # 在同步函数中运行异步代码
        results = asyncio.run(get_hero_info(5))  # 降低并发数避免被封
        print(results)
        return 0
    except Exception as e:
        print(f"ERROR: {str(e)}", file=sys.stderr)
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
