/**
 * Tests for useDebounce hook
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 450));
    expect(result.current).toBe('initial');
  });

  it('should not update immediately when value changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 450), {
      initialProps: { value: 'first' }
    });

    expect(result.current).toBe('first');

    rerender({ value: 'second' });
    expect(result.current).toBe('first'); // Still the initial value
  });

  it('should update after delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 450), {
      initialProps: { value: 'first' }
    });

    rerender({ value: 'second' });
    expect(result.current).toBe('first');

    act(() => {
      vi.advanceTimersByTime(450);
    });

    expect(result.current).toBe('second');
  });

  it('should use default delay of 450ms', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'first' }
    });

    rerender({ value: 'second' });

    act(() => {
      vi.advanceTimersByTime(449);
    });
    expect(result.current).toBe('first');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('second');
  });

  it('should handle custom delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 1000), {
      initialProps: { value: 'first' }
    });

    rerender({ value: 'second' });

    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(result.current).toBe('first');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('second');
  });

  it('should cancel pending update when value changes again', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'first' }
    });

    rerender({ value: 'second' });

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe('first');

    rerender({ value: 'third' });

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe('first');

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe('third');
  });

  it('should work with objects', () => {
    const obj1 = { value: 'first' };
    const obj2 = { value: 'second' };

    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
      initialProps: { value: obj1 }
    });

    expect(result.current).toEqual(obj1);

    rerender({ value: obj2 });
    expect(result.current).toEqual(obj1);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toEqual(obj2);
  });

  it('should work with numbers', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
      initialProps: { value: 1 }
    });

    expect(result.current).toBe(1);

    rerender({ value: 2 });
    expect(result.current).toBe(1);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe(2);
  });
});
