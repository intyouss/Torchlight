// cache.ts - 缓存工具类
export class ApiCache {
    private static CACHE_PREFIX = 'api_cache_';
    private static DEFAULT_TTL = 3600000; // 默认缓存1小时

    // 获取缓存数据
    static get<T>(key: string): T | null {
        const item = localStorage.getItem(`${this.CACHE_PREFIX}${key}`);
        if (!item) return null;

        const parsed = JSON.parse(item);
        // 检查缓存是否过期
        if (Date.now() > parsed.expiry) {
            this.remove(key);
            return null;
        }

        return parsed.data as T;
    }

    // 设置缓存数据
    static set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
        const item = {
            data,
            expiry: Date.now() + ttl
        };
        localStorage.setItem(`${this.CACHE_PREFIX}${key}`, JSON.stringify(item));
    }

    // 移除缓存
    static remove(key: string): void {
        localStorage.removeItem(`${this.CACHE_PREFIX}${key}`);
    }

    // 清除所有缓存
    static clear(): void {
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.CACHE_PREFIX))
            .forEach(key => localStorage.removeItem(key));
    }
}