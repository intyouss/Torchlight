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
        // 检查数据是否有效，不缓存空数据
        if (!this.isValidData(data)) {
            console.warn(`数据无效，不缓存 key: ${key}`, data);
            this.remove(key); // 移除可能存在的旧缓存
            return;
        }

        try {
            const item = {
                data,
                expiry: Date.now() + ttl
            };
            localStorage.setItem(`${this.CACHE_PREFIX}${key}`, JSON.stringify(item));
        } catch (error) {
            console.error('设置缓存失败:', error);
        }
    }
    // 数据有效性检查
    private static isValidData<T>(data: T): boolean {
        if (data === null || data === undefined) {
            return false;
        }

        // 检查数组是否为空
        if (Array.isArray(data) && data.length === 0) {
            return false;
        }

        // 检查对象是否为空
        if (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0) {
            return false;
        }

        // 检查字符串是否为空
        return !(typeof data === 'string' && data.trim() === '');
    }

    // 移除缓存
    static remove(key: string): void {
        try {
            localStorage.removeItem(`${this.CACHE_PREFIX}${key}`);
        } catch (error) {
            console.error('移除缓存失败:', error);
        }
    }

    // 清除所有缓存
    static clear(): void {
        try {
            Object.keys(localStorage)
                .filter(key => key.startsWith(this.CACHE_PREFIX))
                .forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.error('清除缓存失败:', error);
        }
    }
}