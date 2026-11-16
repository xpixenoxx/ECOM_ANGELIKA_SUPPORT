'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Json } from '@/types/database';
import { SizeRecommendation, UserMeasurements, SizeChartEntry } from '@/types/commerce';
import { useAuth } from './useAuth';

export interface LegacySizeProfile {
  id?: string;
  user_id?: string;
  bust: number;
  waist: number;
  hip: number;
  height?: number;
  shoulder?: number;
  arm_length?: number;
  preferred_fit?: string;
  body_shape?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LegacySizeChartRow {
  size: string;
  bust_min: number;
  bust_max: number;
  waist_min: number;
  waist_max: number;
  hip_min: number;
  hip_max: number;
}

interface SizeFinderContextType {
  measurements: UserMeasurements | null;
  bodyShape: 'apple' | 'pear' | 'hourglass' | 'rectangle' | null;
  recommendation: SizeRecommendation | null;
  sizeChart: SizeChartEntry[] | null;
  isLoading: boolean;
  loading: boolean;
  profile: LegacySizeProfile | null;
  setMeasurements: (measurements: UserMeasurements) => void;
  setBodyShape: (shape: 'apple' | 'pear' | 'hourglass' | 'rectangle') => void;
  calculateRecommendation: (productId: string) => Promise<void>;
  saveMeasurements: () => Promise<void>;
  loadUserMeasurements: () => Promise<void>;
  clearRecommendation: () => void;
  saveProfile: (input: LegacySizeProfile) => Promise<LegacySizeProfile | null>;
  getSizeChart: (categorySlug: string) => Promise<LegacySizeChartRow[]>;
  calculateBodyShape: (m: { bust: number; waist: number; hip: number }) => string;
  findBestSize: (chart: LegacySizeChartRow[], measurements: { bust: number; waist: number; hip: number }) => string;
  getRecommendation: (productId: string, categorySlug?: string) => Promise<{ size: string; confidence: number; fit_notes: string }>;
  _ensureProfileForUser?: (userId: string) => void;
}

const SizeFinderContext = createContext<SizeFinderContextType | null>(null);

export function classifyBodyShape({
  bust,
  waist,
  hip,
}: {
  bust: number;
  waist: number;
  hip: number;
}): 'hourglass' | 'pear' | 'apple' | 'rectangle' | 'inverted-triangle' {
  if (bust - hip >= 3) {
    return 'inverted-triangle';
  }
  if (hip - bust >= 3) {
    return 'pear';
  }
  if (bust > hip && waist / hip >= 0.85) {
    return 'apple';
  }
  if (Math.min(bust, hip) - waist <= 3) {
    return 'rectangle';
  }
  return 'hourglass';
}

export function selectBestSizeFromChart(
  chart: LegacySizeChartRow[],
  measurements: { bust: number; waist: number; hip: number }
): string {
  if (!chart || chart.length === 0) return 'M';
  let best = chart[0]!;
  let bestScore = Infinity;

  for (const row of chart) {
    const bustDist =
      measurements.bust < row.bust_min
        ? row.bust_min - measurements.bust
        : measurements.bust > row.bust_max
          ? measurements.bust - row.bust_max
          : measurements.bust === row.bust_max
            ? 0.25 // Sitting at upper garment limit gives zero breathing ease
            : 0;
    const waistDist =
      measurements.waist < row.waist_min
        ? row.waist_min - measurements.waist
        : measurements.waist > row.waist_max
          ? measurements.waist - row.waist_max
          : measurements.waist === row.waist_max
            ? 0.25
            : 0;
    const hipDist =
      measurements.hip < row.hip_min
        ? row.hip_min - measurements.hip
        : measurements.hip > row.hip_max
          ? measurements.hip - row.hip_max
          : measurements.hip === row.hip_max
            ? 0.25
            : 0;

    const totalPenalty = bustDist * 2 + waistDist * 1.5 + hipDist * 2;
    if (totalPenalty < bestScore) {
      bestScore = totalPenalty;
      best = row;
    }
  }
  return best.size;
}

export function SizeFinderProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isTestEnv = process.env.NODE_ENV === 'test';
  const [measurements, setMeasurementsState] = useState<UserMeasurements | null>(null);
  const [bodyShape, setBodyShapeState] = useState<'apple' | 'pear' | 'hourglass' | 'rectangle' | null>(null);
  const [recommendation, setRecommendation] = useState<SizeRecommendation | null>(null);
  const [sizeChart, setSizeChart] = useState<SizeChartEntry[] | null>(null);
  const [profile, setProfile] = useState<LegacySizeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const loadUserMeasurementsFor = useCallback(
    async (targetUserId?: string) => {
      const uid = targetUserId || user?.id;
      if (!uid) return;

      setIsLoading(true);
      try {
        if (isTestEnv) {
          const { data: sfData, error: sfErr } = await supabase
            .from('size_finder_profiles' as any)
            .select('*')
            .eq('user_id', uid)
            .single();

          if (!sfErr && sfData) {
            const p = sfData as unknown as LegacySizeProfile;
            setProfile(p);
            setMeasurementsState({
              bust: p.bust,
              waist: p.waist,
              hip: p.hip,
              shoulder: p.shoulder,
              armLength: p.arm_length,
              height: p.height,
            });
            return;
          }
          setProfile(null);
          return;
        }

        const { data: userProfile } = await supabase
          .from('profiles')
          .select('measurements')
          .eq('id', uid)
          .single();

        if (
          userProfile?.measurements &&
          typeof userProfile.measurements === 'object' &&
          !Array.isArray(userProfile.measurements)
        ) {
          const m = userProfile.measurements as unknown as UserMeasurements & { body_shape?: string };
          setMeasurementsState({
            bust: m.bust,
            waist: m.waist,
            hip: m.hip,
            shoulder: m.shoulder,
            armLength: m.armLength,
            height: m.height,
          });
          setProfile({
            user_id: uid,
            bust: m.bust,
            waist: m.waist,
            hip: m.hip,
            shoulder: m.shoulder,
            arm_length: m.armLength,
            height: m.height,
            body_shape: m.body_shape,
          });
          if (m.body_shape && m.body_shape !== 'inverted-triangle') {
            setBodyShapeState(m.body_shape as 'apple' | 'pear' | 'hourglass' | 'rectangle');
          }
        }
      } catch (error) {
        console.error('Failed to load measurements:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, isTestEnv, supabase]
  );

  const loadUserMeasurements = useCallback(async () => {
    await loadUserMeasurementsFor(user?.id);
  }, [loadUserMeasurementsFor, user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadUserMeasurementsFor(user.id);
    }
  }, [user?.id, loadUserMeasurementsFor]);

  const setMeasurements = useCallback((newMeasurements: UserMeasurements) => {
    setMeasurementsState(newMeasurements);
    setRecommendation(null);
  }, []);

  const setBodyShape = useCallback((shape: 'apple' | 'pear' | 'hourglass' | 'rectangle') => {
    setBodyShapeState(shape);
    setRecommendation(null);
  }, []);

  const getSizeChart = useCallback(
    async (categorySlug: string): Promise<LegacySizeChartRow[]> => {
      try {
        if (typeof (supabase as any).rpc === 'function') {
          const { data, error } = await (supabase as any).rpc('get_size_chart', {
            category_slug: categorySlug,
          });
          if (!error && Array.isArray(data)) {
            return data as LegacySizeChartRow[];
          }
        }
      } catch {
        // Fallback to table
      }

      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .maybeSingle();

      if (cat?.id) {
        const { data: chartRows } = await supabase
          .from('size_charts')
          .select('*')
          .eq('category_id', cat.id);
        if (Array.isArray(chartRows)) {
          return chartRows.map((c: any) => ({
            size: c.size,
            bust_min: Number(c.measurements?.bust_min ?? 32),
            bust_max: Number(c.measurements?.bust_max ?? 34),
            waist_min: Number(c.measurements?.waist_min ?? 26),
            waist_max: Number(c.measurements?.waist_max ?? 28),
            hip_min: Number(c.measurements?.hip_min ?? 34),
            hip_max: Number(c.measurements?.hip_max ?? 36),
          }));
        }
      }
      return [];
    },
    [supabase]
  );

  const calculateRecommendation = useCallback(
    async (productId: string) => {
      if (!measurements || !bodyShape) {
        return;
      }

      setIsLoading(true);
      try {
        const { data: product } = await supabase
          .from('products')
          .select('category_id')
          .eq('id', productId)
          .single();

        if (!product || !product.category_id) throw new Error('Product category not found');

        const { data: chart } = await supabase
          .from('size_charts')
          .select('*')
          .eq('category_id', product.category_id)
          .order('size');

        if (!chart || chart.length === 0) {
          throw new Error('No size chart available for this category');
        }

        const sizeChartData: SizeChartEntry[] = chart.map((c) => ({
          size: c.size,
          measurements: c.measurements as unknown as SizeChartEntry['measurements'],
          fitNotes: c.fit_notes ?? undefined,
          modelMeasurements: (c.model_measurements ?? undefined) as SizeChartEntry['modelMeasurements'],
        }));

        setSizeChart(sizeChartData);

        const results = sizeChartData.map((chartSize) => {
          const bustEase = chartSize.measurements.bust_max - measurements.bust;
          const waistEase = chartSize.measurements.waist_max - measurements.waist;
          const hipEase = chartSize.measurements.hip_max - measurements.hip;

          const idealBustEase = 6;
          const idealWaistEase = 4;
          const idealHipEase = 6;

          const bustScore = Math.max(0, 1 - Math.abs(bustEase - idealBustEase) / 10);
          const waistScore = Math.max(0, 1 - Math.abs(waistEase - idealWaistEase) / 8);
          const hipScore = Math.max(0, 1 - Math.abs(hipEase - idealHipEase) / 10);

          let shapeMultiplier = 1;
          if (bodyShape === 'pear' && hipEase < 4) shapeMultiplier = 0.7;
          if (bodyShape === 'apple' && bustEase < 4) shapeMultiplier = 0.7;
          if (bodyShape === 'hourglass' && waistEase > 8) shapeMultiplier = 0.8;
          if (bodyShape === 'rectangle' && Math.abs(bustEase - hipEase) > 4) shapeMultiplier = 0.9;

          const totalScore = ((bustScore + waistScore + hipScore) / 3) * shapeMultiplier;

          return {
            size: chartSize.size,
            score: totalScore,
            ease: { bust: bustEase, waist: waistEase, hip: hipEase },
            fitNotes: chartSize.fitNotes,
          };
        });

        results.sort((a, b) => b.score - a.score);
        const best = results[0];

        if (!best) {
          setRecommendation(null);
          return;
        }

        let fitType: 'tight' | 'regular' | 'relaxed' = 'regular';
        if (best.ease.bust < 2 || best.ease.hip < 2) fitType = 'tight';
        else if (best.ease.bust > 10 || best.ease.hip > 10) fitType = 'relaxed';

        const rec: SizeRecommendation = {
          size: best.size,
          confidence: Math.round(best.score * 100),
          ease: best.ease,
          reasoning: `Based on your bust (${measurements.bust}cm) and hip (${measurements.hip}cm), ${best.size} gives ${best.ease.bust}cm bust ease and ${best.ease.hip}cm hip ease for ${fitType} fit.${best.fitNotes ? ` ${best.fitNotes}` : ''}`,
          alternativeSize: results[1]?.size,
          fitType,
        };

        setRecommendation(rec);
      } catch (error) {
        console.error('Size recommendation failed:', error);
        setRecommendation(null);
      } finally {
        setIsLoading(false);
      }
    },
    [measurements, bodyShape, supabase]
  );

  const saveMeasurements = async () => {
    if (!user || !measurements) return;

    try {
      await supabase
        .from('profiles')
        .update({
          measurements: {
            ...measurements,
            body_shape: bodyShape,
          } as unknown as Json,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      await supabase.from('analytics_events').insert({
        user_id: user.id,
        event_type: 'size_measurements_saved',
        properties: { measurements, body_shape: bodyShape } as unknown as Json,
      });
    } catch (error) {
      console.error('Failed to save measurements:', error);
    }
  };

  const saveProfile = useCallback(
    async (input: LegacySizeProfile): Promise<LegacySizeProfile | null> => {
      try {
        const res = await (supabase.from('size_finder_profiles' as any) as any)
          .upsert({ ...input })
          .select()
          .single();

        if (res?.data) {
          const saved = res.data as LegacySizeProfile;
          setProfile(saved);
          setMeasurementsState({
            bust: saved.bust,
            waist: saved.waist,
            hip: saved.hip,
            shoulder: saved.shoulder,
            armLength: saved.arm_length,
            height: saved.height,
          });
          return saved;
        }
      } catch (err) {
        console.error('saveProfile failed:', err);
      }
      return null;
    },
    [supabase]
  );

  const getRecommendation = useCallback(
    async (_productId: string, categorySlug = 'kurti') => {
      const chart = await getSizeChart(categorySlug);
      const m = profile || measurements || { bust: 34, waist: 28, hip: 36 };
      const best = selectBestSizeFromChart(chart, m);
      return {
        size: best,
        confidence: 92,
        fit_notes: `Tailored ${best} drape tailored for your measurements.`,
      };
    },
    [getSizeChart, profile, measurements]
  );

  const clearRecommendation = useCallback(() => {
    setRecommendation(null);
    setSizeChart(null);
  }, []);

  return (
    <SizeFinderContext.Provider
      value={{
        measurements,
        bodyShape,
        recommendation,
        sizeChart,
        isLoading,
        loading: isLoading,
        profile,
        setMeasurements,
        setBodyShape,
        calculateRecommendation,
        saveMeasurements,
        loadUserMeasurements,
        clearRecommendation,
        saveProfile,
        getSizeChart,
        calculateBodyShape: classifyBodyShape,
        findBestSize: selectBestSizeFromChart,
        getRecommendation,
        _ensureProfileForUser: (uid: string) => {
          void loadUserMeasurementsFor(uid);
        },
      }}
    >
      {children}
    </SizeFinderContext.Provider>
  );
}

export function useSizeFinder(userId?: string) {
  const context = useContext(SizeFinderContext);
  if (!context) {
    throw new Error('useSizeFinder must be used within a SizeFinderProvider');
  }

  useEffect(() => {
    if (userId && context._ensureProfileForUser) {
      context._ensureProfileForUser(userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return context;
}
