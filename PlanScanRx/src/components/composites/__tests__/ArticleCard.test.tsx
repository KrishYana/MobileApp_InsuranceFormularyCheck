import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { ArticleCard } from '../ArticleCard';
import type { Article } from '../../../types/domain';

// Mock useTheme
jest.mock('../../../theme/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      surface: '#E0E5EC',
      textPrimary: '#2D3748',
      textSecondary: '#718096',
      accent: '#6C63FF',
      shadowLight: '#FFFFFF',
      shadowDark: 'rgba(163,177,198,0.6)',
    },
    isDark: false,
    mode: 'light',
  }),
}));

// Mock NeuSurface to just render children
jest.mock('../../primitives', () => {
  const RN = require('react-native');
  const R = require('react');
  return {
    NeuSurface: ({ children }: any) => R.createElement(RN.View, null, children),
    NeuInset: ({ children }: any) => R.createElement(RN.View, null, children),
  };
});

jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined as any);

const baseArticle: Article = {
  articleId: 1,
  title: 'FDA Approves New Treatment for Type 2 Diabetes',
  summary: 'The FDA has approved a novel GLP-1 receptor agonist for the treatment of T2D.',
  sourceName: 'FDA',
  sourceUrl: 'https://fda.gov/article/123',
  publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  drugClasses: ['GLP-1 Agonists', 'Antidiabetics'],
  imageUrl: null,
};

describe('ArticleCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the article title', () => {
    const { getByText } = render(<ArticleCard article={baseArticle} />);
    expect(getByText('FDA Approves New Treatment for Type 2 Diabetes')).toBeTruthy();
  });

  it('renders the source name badge', () => {
    const { getByText } = render(<ArticleCard article={baseArticle} />);
    expect(getByText('FDA')).toBeTruthy();
  });

  it('renders the summary when present', () => {
    const { getByText } = render(<ArticleCard article={baseArticle} />);
    expect(getByText(/GLP-1 receptor agonist/)).toBeTruthy();
  });

  it('does not render summary when null', () => {
    const noSummary = { ...baseArticle, summary: null };
    const { queryByText } = render(<ArticleCard article={noSummary} />);
    expect(queryByText(/GLP-1 receptor agonist/)).toBeNull();
  });

  it('renders drug class chips', () => {
    const { getByText } = render(<ArticleCard article={baseArticle} />);
    expect(getByText('GLP-1 Agonists')).toBeTruthy();
    expect(getByText('Antidiabetics')).toBeTruthy();
  });

  it('does not render drug class chips when empty', () => {
    const noClasses = { ...baseArticle, drugClasses: [] };
    const { queryByText } = render(<ArticleCard article={noClasses} />);
    expect(queryByText('GLP-1 Agonists')).toBeNull();
  });

  it('limits drug class chips to 3', () => {
    const manyClasses = {
      ...baseArticle,
      drugClasses: ['Class A', 'Class B', 'Class C', 'Class D', 'Class E'],
    };
    const { queryByText } = render(<ArticleCard article={manyClasses} />);
    expect(queryByText('Class A')).toBeTruthy();
    expect(queryByText('Class B')).toBeTruthy();
    expect(queryByText('Class C')).toBeTruthy();
    expect(queryByText('Class D')).toBeNull();
  });

  it('opens the source URL when pressed', () => {
    const { getByText } = render(<ArticleCard article={baseArticle} />);
    const title = getByText('FDA Approves New Treatment for Type 2 Diabetes');
    // Find the pressable parent and press it
    fireEvent.press(title);
    expect(Linking.openURL).toHaveBeenCalledWith('https://fda.gov/article/123');
  });

  it('renders with different source names', () => {
    const pubmedArticle = { ...baseArticle, sourceName: 'PubMed' };
    const { getByText } = render(<ArticleCard article={pubmedArticle} />);
    expect(getByText('PubMed')).toBeTruthy();
  });

  it('renders with unknown source name (uses accent color fallback)', () => {
    const unknownSource = { ...baseArticle, sourceName: 'UnknownSource' };
    const { getByText } = render(<ArticleCard article={unknownSource} />);
    expect(getByText('UnknownSource')).toBeTruthy();
  });
});
