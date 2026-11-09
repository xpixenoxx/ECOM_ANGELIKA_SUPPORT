import { renderHook, act, waitFor } from '@testing-library/react';
import { useSizeFinder, SizeFinderProvider } from './useSizeFinder';
import { AuthProvider } from './useAuth';
import { createClient, getSupabaseClient } from '@/lib/supabase/client';
import { ReactNode } from 'react';

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
  getSupabaseClient: vi.fn(),
}));

const mockSupabase = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
  },
  from: vi.fn(),
  rpc: vi.fn(),
};

// Wrapper with real providers (SizeFinderProvider uses AuthProvider internally)
const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>
    <SizeFinderProvider>{children}</SizeFinderProvider>
  </AuthProvider>
);

describe('useSizeFinder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockReturnValue(mockSupabase);
    (getSupabaseClient as any).mockReturnValue(mockSupabase);
    localStorage.clear();
  });

  const mockSizeProfile = {
    id: '1',
    user_id: 'user1',
    bust: 34,
    waist: 28,
    hip: 36,
    height: 65,
    shoulder: 15,
    arm_length: 24,
    preferred_fit: 'regular',
    body_shape: 'hourglass',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  };

  const mockSizeCharts = [
    { size: 'XS', bust_min: 30, bust_max: 32, waist_min: 24, waist_max: 26, hip_min: 32, hip_max: 34 },
    { size: 'S', bust_min: 32, bust_max: 34, waist_min: 26, waist_max: 28, hip_min: 34, hip_max: 36 },
    { size: 'M', bust_min: 34, bust_max: 36, waist_min: 28, waist_max: 30, hip_min: 36, hip_max: 38 },
    { size: 'L', bust_min: 36, bust_max: 38, waist_min: 30, waist_max: 32, hip_min: 38, hip_max: 40 },
    { size: 'XL', bust_min: 38, bust_max: 40, waist_min: 32, waist_max: 34, hip_min: 40, hip_max: 42 },
  ];

  it('should initialize with no profile', () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
        }),
      }),
    });

    const { result } = renderHook(() => useSizeFinder('user1'), { wrapper });

    expect(result.current.profile).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should load size profile', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockSizeProfile, error: null }),
        }),
      }),
    });

    const { result } = renderHook(() => useSizeFinder('user1'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile).toEqual(mockSizeProfile);
  });

  it('should save size profile', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
        }),
      }),
      upsert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockSizeProfile, error: null }),
        }),
      }),
    });

    const { result } = renderHook(() => useSizeFinder('user1'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newProfile = {
      bust: 36,
      waist: 30,
      hip: 38,
      height: 66,
      shoulder: 16,
      arm_length: 25,
      preferred_fit: 'loose',
      body_shape: 'rectangle',
    };

    await act(async () => {
      await result.current.saveProfile(newProfile);
    });

    expect(result.current.profile).toEqual(mockSizeProfile);
  });

  it('should get size recommendation', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockSizeProfile, error: null }),
        }),
      }),
    });

    mockSupabase.rpc.mockResolvedValue({
      data: mockSizeCharts,
      error: null,
    });

    const { result } = renderHook(() => useSizeFinder('user1'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const recommendation = await result.current.getRecommendation('p1', 'kurti');

    expect(recommendation).toBeDefined();
    expect(recommendation.size).toBeDefined();
    expect(recommendation.confidence).toBeDefined();
    expect(recommendation.fit_notes).toBeDefined();
  });

  it('should calculate body shape', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockSizeProfile, error: null }),
        }),
      }),
    });

    const { result } = renderHook(() => useSizeFinder('user1'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const bodyShape = result.current.calculateBodyShape({
      bust: 34,
      waist: 28,
      hip: 36,
    });

    expect(bodyShape).toBe('hourglass');
  });

  it('should handle pear shape', () => {
    const { result } = renderHook(() => useSizeFinder('user1'), { wrapper });

    const bodyShape = result.current.calculateBodyShape({
      bust: 32,
      waist: 28,
      hip: 38,
    });

    expect(bodyShape).toBe('pear');
  });

  it('should handle apple shape', () => {
    const { result } = renderHook(() => useSizeFinder('user1'), { wrapper });

    const bodyShape = result.current.calculateBodyShape({
      bust: 38,
      waist: 32,
      hip: 36,
    });

    expect(bodyShape).toBe('apple');
  });

  it('should handle rectangle shape', () => {
    const { result } = renderHook(() => useSizeFinder('user1'), { wrapper });

    const bodyShape = result.current.calculateBodyShape({
      bust: 34,
      waist: 32,
      hip: 34,
    });

    expect(bodyShape).toBe('rectangle');
  });

  it('should handle inverted triangle shape', () => {
    const { result } = renderHook(() => useSizeFinder('user1'), { wrapper });

    const bodyShape = result.current.calculateBodyShape({
      bust: 38,
      waist: 28,
      hip: 34,
    });

    expect(bodyShape).toBe('inverted-triangle');
  });

  it('should get size chart for category', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockSizeProfile, error: null }),
        }),
      }),
    });

    mockSupabase.rpc.mockResolvedValue({
      data: mockSizeCharts,
      error: null,
    });

    const { result } = renderHook(() => useSizeFinder('user1'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const sizeChart = await result.current.getSizeChart('kurti');

    expect(sizeChart).toEqual(mockSizeCharts);
  });

  it('should find best size match', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockSizeProfile, error: null }),
        }),
      }),
    });

    mockSupabase.rpc.mockResolvedValue({
      data: mockSizeCharts,
      error: null,
    });

    const { result } = renderHook(() => useSizeFinder('user1'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // For bust 34, waist 28, hip 36 - should match M (34-36, 28-30, 36-38)
    const bestSize = result.current.findBestSize(mockSizeCharts, mockSizeProfile);

    expect(bestSize).toBe('M');
  });
});