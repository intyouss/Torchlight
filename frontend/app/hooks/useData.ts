// hooks/useData.ts
import { useState, useEffect } from 'react';
import { Hero, Skill, CharacterStats, EquipmentStats, DamageResult } from '../type';
import { apiService } from '../lib/api';

export const useData = () => {
    const [heroes, setHeroes] = useState<Hero[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [defaultStats, setDefaultStats] = useState<CharacterStats | null>(null);
    const [defaultEquipment, setDefaultEquipment] = useState<EquipmentStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                setError(null);

                // 直接使用固定数据
                const heroesData = await apiService.getHeroes();
                const skillsData = await apiService.getSkills();
                const statsData = await apiService.getDefaultStats();
                const equipmentData = await apiService.getDefaultEquipment();

                setHeroes(heroesData);
                setSkills(skillsData);
                setDefaultStats(statsData);
                setDefaultEquipment(equipmentData);
            } catch (err) {
                setError(err instanceof Error ? err.message : '数据加载失败');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    return {
        heroes,
        skills,
        defaultStats,
        defaultEquipment,
        loading,
        error,
    };
};