'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SizeRecommendation, UserMeasurements, SizeChartEntry } from '@/types/commerce';
import { useAuth } from './useAuth';

interface SizeFinderContextType {
  measurements: UserMeasurements | null;
  bodyShape: 'apple' | 'pear' | 'hourglass' | 'rectangle' | null;
  recommendation: SizeRecommendation | null;
  sizeChart: SizeChartEntry[] | null;
  isLoading: boolean;
  setMeasurements: (measurements: UserMeasurements) => void;
  setBodyShape: (shape: 'apple' | 'pear' | 'hourglass' | 'rectangle') => void;
  calculateRecommendation: (productId: string) => Promise<void>;
  saveMeasurements: () => Promise<void>;
  loadUserMeasurements: () => Promise<void>;
  clearRecommendation: () => void;
}

const SizeFinderContext = createContext<SizeFinderContextType | null>(null);

export function SizeFinderProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [measurements, setMeasurementsState] = useState<UserMeasurements | null>(null);
  const [bodyShape, setBodyShapeState] = useState<'apple' | 'pear' | 'hourglass' | 'rectangle' | null>(null);
  const [recommendation, setRecommendation] = useState<SizeRecommendation | null>(null);
  const [sizeChart, setSizeChart] = useState<SizeChartEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  // Load user's saved measurements on mount
  useEffect(() => {
    loadUserMeasurements();
  }, [user]);

  const loadUserMeasurements = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('measurements')
        .eq('id', user.id)
        .single();

      if (profile?.measurements) {
        const m = profile.measurements as UserMeasurements & { body_shape?: string };
        setMeasurementsState({
          bust: m.bust,
          waist: m.waist,
          hip: m.hip,
          shoulder: m.shoulder,
          armLength: m.armLength,
          height: m.height,
        });
        if (m.body_shape) {
          setBodyShapeState(m.body_shape as 'apple' | 'pear' | 'hourglass' | 'rectangle');
        }
      }
    } catch (error) {
      console.error('Failed to load measurements:', error);
    }
  };

  const setMeasurements = useCallback((newMeasurements: UserMeasurements) => {
    setMeasurementsState(newMeasurements);
    setRecommendation(null); // Clear old recommendation
  }, []);

  const setBodyShape = useCallback((shape: 'apple' | 'pear' | 'hourglass' | 'rectangle') => {
    setBodyShapeState(shape);
    setRecommendation(null);
  }, []);

  const calculateRecommendation = useCallback(async (productId: string) => {
    if (!measurements || !bodyShape) {
      return;
    }

    setIsLoading(true);
    try {
      // Get product category
      const { data: product } = await supabase
        .from('products')
        .select('category_id')
        .eq('id', productId)
        .single();

      if (!product) throw new Error('Product not found');

      // Get size chart for category
      const { data: chart } = await supabase
        .from('size_charts')
        .select('*')
        .eq('category_id', product.category_id)
        .order('size');

      if (!chart || chart.length === 0) {
        throw new Error('No size chart available for this category');
      }

      const sizeChartData: SizeChartEntry[] = chart.map(c => ({
        size: c.size,
        measurements: c.measurements as SizeChartEntry['measurements'],
        fitNotes: c.fit_notes,
        modelMeasurements: c.model_measurements as SizeChartEntry['modelMeasurements'],
      }));

      setSizeChart(sizeChartData);

      // Calculate best fit
      const results = sizeChartData.map(chartSize => {
        const bustEase = chartSize.measurements.bust_max - measurements.bust;
        const waistEase = chartSize.measurements.waist_max - measurements.waist;
        const hipEase = chartSize.measurements.hip_max - measurements.hip;

        // Ideal ease ranges (cm)
        const idealBustEase = 6; // 4-8cm for comfort
        const idealWaistEase = 4; // 2-6cm for comfort
        const idealHipEase = 6; // 4-8cm for comfort

        // Score each dimension (0-1)
        const bustScore = Math.max(0, 1 - Math.abs(bustEase - idealBustEase) / 10);
        const waistScore = Math.max(0, 1 - Math.abs(waistEase - idealWaistEase) / 8);
        const hipScore = Math.max(0, 1 - Math.abs(hipEase - idealHipEase) / 10);

        // Body shape adjustments
        let shapeMultiplier = 1;
        if (bodyShape === 'pear' && hipEase < 4) shapeMultiplier = 0.7;
        if (bodyShape === 'apple' && bustEase < 4) shapeMultiplier = 0.7;
        if (bodyShape === 'hourglass' && waistEase > 8) shapeMultiplier = 0.8;
        if (bodyShape === 'rectangle' && Math.abs(bustEase - hipEase) > 4) shapeMultiplier = 0.9;

        const totalScore = (bustScore + waistScore + hipScore) / 3 * shapeMultiplier;

        return {
          size: chartSize.size,
          score: totalScore,
          ease: { bust: bustEase, waist: waistEase, hip: hipEase },
          fitNotes: chartSize.fitNotes,
        };
      });

      // Sort by score descending
      results.sort((a, b) => b.score - a.score);
      const best = results[0];

      if (!best) {
        setRecommendation(null);
        return;
      }

      // Determine fit type
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
  }, [measurements, bodyShape]);

  const saveMeasurements = async () => {
    if (!user || !measurements) return;

    try {
      await supabase.from('profiles').update({
        measurements: {
          ...measurements,
          body_shape: bodyShape,
        },
        updated_at: new Date().toISOString(),
      }).eq('id', user.id);

      // Track event
      await supabase.from('analytics_events').insert({
        user_id: user.id,
        event_type: 'size_measurements_saved',
        properties: { measurements, body_shape: bodyShape },
      });
    } catch (error) {
      console.error('Failed to save measurements:', error);
    }
  };

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
        setMeasurements,
        setBodyShape,
        calculateRecommendation,
        saveMeasurements,
        loadUserMeasurements,
        clearRecommendation,
      }}
    >
      {children}
    </SizeFinderContext.Provider>
  );
}

export function useSizeFinder() {
  const context = useContext(SizeFinderContext);
  if (!context) {
    throw new Error('useSizeFinder must be used within a SizeFinderProvider');
  }
  return context;
}