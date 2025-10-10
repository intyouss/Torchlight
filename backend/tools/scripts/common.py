import asyncio
import sys
from yarl import URL
from typing import List, Dict

import aiohttp

BASE_URL = "https://tlidb.com/cn/"
TIMEOUT = aiohttp.ClientTimeout(total=15)  # 缩短超时时间
CONNECTOR_LIMIT = 50  # 增大连接池


def log_debug(message: str):
    print(f"[DEBUG]{message}", file=sys.stderr)


def log_error(message: str):
    print(f"[ERROR]{message}", file=sys.stderr)


async def fetch_html(session: aiohttp.ClientSession, url: str) -> str:
    try:
        url = URL(url, encoded=True) if url.startswith("http") else URL(BASE_URL + url, encoded=True)
        async with session.get(url) as response:
            response.raise_for_status()  # 抛出HTTP错误状态码
            return await response.text()
    except Exception as e:
        log_error(f"获取 {url} 失败: {e}")
        return ""


async def batch_fetch(session: aiohttp.ClientSession, items: List[Dict], parser, concurrency: int):
    """通用批量抓取函数"""
    semaphore = asyncio.Semaphore(concurrency)

    async def bounded_task(item):
        async with semaphore:
            return await parser(session, item["en_name"], item["cn_name"])

    tasks = [bounded_task(item) for item in items]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    valid = [r for r in results if r and not isinstance(r, Exception)]
    log_debug(f"成功解析 {len(valid)}/{len(items)} 条数据")
    return valid