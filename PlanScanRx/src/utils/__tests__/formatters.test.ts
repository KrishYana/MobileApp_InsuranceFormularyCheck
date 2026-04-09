import { formatCurrency, formatPercentage, formatRelativeDate, truncate } from '../formatters';

describe('formatCurrency', () => {
  it('formats whole dollar amounts without .00', () => {
    expect(formatCurrency(50)).toBe('$50');
  });

  it('formats amounts with cents', () => {
    expect(formatCurrency(29.99)).toBe('$29.99');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('formats amounts with single decimal to two places', () => {
    expect(formatCurrency(10.5)).toBe('$10.50');
  });

  it('returns N/A for null', () => {
    expect(formatCurrency(null)).toBe('N/A');
  });

  it('returns N/A for undefined', () => {
    expect(formatCurrency(undefined)).toBe('N/A');
  });

  it('handles large amounts', () => {
    expect(formatCurrency(1000)).toBe('$1000');
  });

  it('handles very small amounts', () => {
    expect(formatCurrency(0.01)).toBe('$0.01');
  });
});

describe('formatPercentage', () => {
  it('formats integer percentages', () => {
    expect(formatPercentage(20)).toBe('20%');
  });

  it('formats zero', () => {
    expect(formatPercentage(0)).toBe('0%');
  });

  it('formats decimal percentages', () => {
    expect(formatPercentage(33.5)).toBe('33.5%');
  });

  it('returns N/A for null', () => {
    expect(formatPercentage(null)).toBe('N/A');
  });

  it('returns N/A for undefined', () => {
    expect(formatPercentage(undefined)).toBe('N/A');
  });

  it('handles 100%', () => {
    expect(formatPercentage(100)).toBe('100%');
  });
});

describe('formatRelativeDate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-08T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns "Just now" for dates less than a minute ago', () => {
    const recent = new Date('2026-04-08T11:59:30Z');
    expect(formatRelativeDate(recent)).toBe('Just now');
  });

  it('returns minutes ago for dates less than an hour ago', () => {
    const thirtyMinsAgo = new Date('2026-04-08T11:30:00Z');
    expect(formatRelativeDate(thirtyMinsAgo)).toBe('30m ago');
  });

  it('returns hours ago for dates less than 24 hours ago', () => {
    const threeHoursAgo = new Date('2026-04-08T09:00:00Z');
    expect(formatRelativeDate(threeHoursAgo)).toBe('3h ago');
  });

  it('returns days ago for dates less than 7 days ago', () => {
    const twoDaysAgo = new Date('2026-04-06T12:00:00Z');
    expect(formatRelativeDate(twoDaysAgo)).toBe('2d ago');
  });

  it('returns formatted date for dates older than 7 days', () => {
    const twoWeeksAgo = new Date('2026-03-25T12:00:00Z');
    const result = formatRelativeDate(twoWeeksAgo);
    expect(result).toContain('Mar');
    expect(result).toContain('25');
  });

  it('accepts string dates', () => {
    expect(formatRelativeDate('2026-04-08T11:30:00Z')).toBe('30m ago');
  });

  it('handles exact minute boundary', () => {
    const exactlyOneMinAgo = new Date('2026-04-08T11:59:00Z');
    expect(formatRelativeDate(exactlyOneMinAgo)).toBe('1m ago');
  });
});

describe('truncate', () => {
  it('returns the string unchanged if within max length', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('returns the string unchanged if equal to max length', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('truncates and adds ellipsis when exceeding max length', () => {
    expect(truncate('hello world', 5)).toBe('hell\u2026');
  });

  it('handles empty string', () => {
    expect(truncate('', 5)).toBe('');
  });

  it('handles single character max length', () => {
    expect(truncate('hello', 1)).toBe('\u2026');
  });

  it('handles long strings', () => {
    const long = 'a'.repeat(200);
    const result = truncate(long, 50);
    expect(result.length).toBe(50);
    expect(result.endsWith('\u2026')).toBe(true);
  });
});
