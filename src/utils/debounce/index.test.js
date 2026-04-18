import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from './index';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should execute the callback after the specified delay', () => {
    const callback = vi.fn();
    const debouncedFunction = debounce(callback, 500);

    debouncedFunction();
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(250);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(250);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should debounce multiple calls and only execute once', () => {
    const callback = vi.fn();
    const debouncedFunction = debounce(callback, 500);

    debouncedFunction();
    vi.advanceTimersByTime(200);
    debouncedFunction();
    vi.advanceTimersByTime(200);
    debouncedFunction();

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to the callback', () => {
    const callback = vi.fn();
    const debouncedFunction = debounce(callback, 500);

    debouncedFunction('arg1', 'arg2');
    vi.advanceTimersByTime(500);

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should use default delay of 250ms if not provided', () => {
    const callback = vi.fn();
    const debouncedFunction = debounce(callback);

    debouncedFunction();
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(250);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
