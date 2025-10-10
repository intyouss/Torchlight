// useData.ts - 修改hook以分别获取不同类型的技能
import { useState, useEffect } from 'react';
import { Hero, Skill, CharacterStats, EquipmentStats } from '../type';
import { apiService } from '../lib/api';

interface UseDataReturn {
    heroes: Hero[];
    activeSkills: Skill[];
    passiveSkills: Skill[];
    supportSkills: Skill[];
    defaultStats: CharacterStats | null;
    defaultEquipment: EquipmentStats | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export const useData = (): UseDataReturn => {
    const [heroes, setHeroes] = useState<Hero[]>([]);
    const [activeSkills, setActiveSkills] = useState<Skill[]>([]);
    const [passiveSkills, setPassiveSkills] = useState<Skill[]>([]);
    const [supportSkills, setSupportSkills] = useState<Skill[]>([]);
    const [defaultStats, setDefaultStats] = useState<CharacterStats | null>(null);
    const [defaultEquipment, setDefaultEquipment] = useState<EquipmentStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async (forceRefresh: boolean = false) => {
        try {
            setLoading(true);
            setError(null);

            // 并行请求，但使用带缓存的API方法
            const [
                heroesData,
                activeSkillsData,
                passiveSkillsData,
                supportSkillsData,
                statsData,
                equipmentData
            ] = await Promise.all([
                apiService.getHeroes(forceRefresh),
                apiService.getActiveSkills(forceRefresh),
                apiService.getPassiveSkills(forceRefresh),
                apiService.getSupportSkills(forceRefresh),
                apiService.getDefaultStats(),
                apiService.getDefaultEquipment()
            ]);
            setHeroes(heroesData);
            setActiveSkills(activeSkillsData);
            setPassiveSkills(passiveSkillsData);
            setSupportSkills(supportSkillsData);
            setDefaultStats(statsData);
            setDefaultEquipment(equipmentData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '数据加载失败';
            setError(errorMessage);
            console.error('数据加载错误:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 修改refresh方法，支持强制刷新
    const refresh = async () => {
        await fetchData(true);
    };

    return {
        heroes,
        activeSkills,
        passiveSkills,
        supportSkills,
        defaultStats,
        defaultEquipment,
        loading,
        error,
        refresh
    };
};

// 自定义hook用于管理配置
export const useConfig = () => {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const loadConfig = async () => {
        setLoading(true);
        try {
            const savedConfig = await apiService.loadConfig();
            setConfig(savedConfig);
            return savedConfig;
        } catch (error) {
            console.error('加载配置失败:', error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const saveConfig = async (newConfig: any) => {
        setLoading(true);
        try {
            await apiService.saveConfig(newConfig);
            setConfig(newConfig);
            return true;
        } catch (error) {
            console.error('保存配置失败:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        config,
        loading,
        loadConfig,
        saveConfig
    };
};

// 自定义hook用于伤害计算
export const useDamageCalculation = () => {
    const [calculating, setCalculating] = useState(false);
    const [lastResult, setLastResult] = useState<any>(null);

    const calculateDamage = async (params: {
        heroId: string;
        skillId: string;
        skillLevel: number;
        stats: CharacterStats;
        equipment: EquipmentStats;
        selectedTraits?: string[];
    }) => {
        setCalculating(true);
        try {
            const result = await apiService.calculateDamage(params);
            setLastResult(result);
            return result;
        } catch (error) {
            console.error('伤害计算失败:', error);
            throw error;
        } finally {
            setCalculating(false);
        }
    };

    return {
        calculating,
        lastResult,
        calculateDamage
    };
};