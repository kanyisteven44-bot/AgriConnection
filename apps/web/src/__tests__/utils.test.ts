import { describe, it, expect } from 'vitest';
import {
  cn,
  formatCurrency,
  formatDate,
  formatTime,
  isValidEmail,
  isValidPhone,
  getInitials,
  truncate,
  calculateDistance,
} from '../lib/utils';

describe('Utility Functions', () => {
  describe('cn (className merger)', () => {
    it('merges class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('handles conditional classes', () => {
      expect(cn('base', true && 'included', false && 'excluded')).toBe('base included');
    });

    it('handles undefined values', () => {
      expect(cn('base', undefined, 'end')).toBe('base end');
    });
  });

  describe('formatCurrency', () => {
    it('formats numbers as Kenyan Shillings', () => {
      expect(formatCurrency(1000)).toBe('KSh 1,000');
    });

    it('handles large numbers', () => {
      expect(formatCurrency(1000000)).toBe('KSh 1,000,000');
    });

    it('handles zero', () => {
      expect(formatCurrency(0)).toBe('KSh 0');
    });
  });

  describe('formatDate', () => {
    it('returns relative time for recent dates', () => {
      const date = new Date();
      const result = formatDate(date);
      expect(['Just now', '1m ago']).toContain(result);
    });

    it('returns date string for older dates', () => {
      const date = new Date('2020-01-15');
      const result = formatDate(date);
      expect(result).not.toBe('Just now');
    });
  });

  describe('formatTime', () => {
    it('formats time from date strings', () => {
      const date = '2024-01-15T14:30:00Z';
      const result = formatTime(date);
      expect(result).toMatch(/:/);
    });
  });

  describe('isValidEmail', () => {
    it('validates correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.ke')).toBe(true);
    });

    it('rejects invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('validates Kenyan phone numbers starting with 0', () => {
      expect(isValidPhone('0712345678')).toBe(true);
      expect(isValidPhone('0112345678')).toBe(true);
    });

    it('validates Kenyan phone numbers with country code', () => {
      expect(isValidPhone('+254712345678')).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      expect(isValidPhone('12345')).toBe(false);
      expect(isValidPhone('invalid')).toBe(false);
    });
  });

  describe('getInitials', () => {
    it('returns initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('Mary Jane Watson')).toBe('MJ');
    });

    it('handles single name', () => {
      expect(getInitials('Madonna')).toBe('M');
    });

    it('handles empty string', () => {
      expect(getInitials('')).toBe('');
    });
  });

  describe('truncate', () => {
    it('truncates long strings', () => {
      expect(truncate('Hello World', 5)).toBe('Hello...');
    });

    it('returns short strings unchanged', () => {
      expect(truncate('Short', 10)).toBe('Short');
    });
  });

  describe('calculateDistance', () => {
    it('calculates distance between two points', () => {
      const distance = calculateDistance(-1.2864, 36.8172, -1.2921, 36.8219);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(20);
    });

    it('returns 0 for same coordinates', () => {
      const distance = calculateDistance(-1.2864, 36.8172, -1.2864, 36.8172);
      expect(distance).toBe(0);
    });
  });
});
