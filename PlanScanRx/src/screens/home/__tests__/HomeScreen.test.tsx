import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
  }),
  useRoute: () => ({ params: {} }),
}));

// Mock theme
jest.mock('../../../theme/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      surface: '#E0E5EC',
      textPrimary: '#2D3748',
      textSecondary: '#718096',
      textAccent: '#6C63FF',
      accent: '#6C63FF',
      teal: '#38B2AC',
      shadowLight: '#FFFFFF',
      shadowDark: 'rgba(163,177,198,0.6)',
    },
    isDark: false,
    mode: 'light',
  }),
}));

// Mock safe area
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, right: 0, bottom: 34, left: 0 }),
}));

// Mock primitives
jest.mock('../../../components/primitives', () => {
  const R = require('react');
  const RN = require('react-native');
  return {
    NeuSurface: ({ children }: any) => R.createElement(RN.View, null, children),
    NeuInset: ({ children }: any) => R.createElement(RN.View, null, children),
    AppIcon: ({ name }: any) => R.createElement(RN.Text, null, name),
    ExpandableSection: ({ title, children }: any) =>
      R.createElement(RN.View, null,
        R.createElement(RN.Text, null, title),
        children,
      ),
  };
});

// Mock composites
jest.mock('../../../components/composites/StateSelectorBar', () => {
  const { Text } = require('react-native');
  return function MockStateSelectorBar() {
    return <Text>StateSelectorBar</Text>;
  };
});

jest.mock('../../../components/composites/ArticleCard', () => ({
  ArticleCard: ({ article }: any) => {
    const { Text } = require('react-native');
    return <Text>{article.title}</Text>;
  },
}));

// Mock useArticles hook
const mockArticles = [
  {
    articleId: 1,
    title: 'Test Article One',
    summary: 'Summary one',
    sourceName: 'FDA',
    sourceUrl: 'https://fda.gov/1',
    publishedAt: '2026-04-08T10:00:00Z',
    drugClasses: [],
    imageUrl: null,
  },
  {
    articleId: 2,
    title: 'Test Article Two',
    summary: null,
    sourceName: 'PubMed',
    sourceUrl: 'https://pubmed.com/2',
    publishedAt: '2026-04-07T10:00:00Z',
    drugClasses: ['Oncology'],
    imageUrl: null,
  },
];

jest.mock('../../../hooks/queries/useArticles', () => ({
  useArticles: () => ({ data: mockArticles, isLoading: false, isError: false }),
}));

// Mock appStore
jest.mock('../../../stores/appStore', () => ({
  useAppStore: (selector: any) =>
    selector({ selectedState: { code: 'CA', name: 'California' } }),
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the StateSelectorBar', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('StateSelectorBar')).toBeTruthy();
  });

  it('renders the New Formulary Lookup button', () => {
    const { getByLabelText } = render(<HomeScreen />);
    expect(getByLabelText('New Formulary Lookup')).toBeTruthy();
  });

  it('navigates to InsurerSelection on New Formulary Lookup press', () => {
    const { getByLabelText } = render(<HomeScreen />);
    fireEvent.press(getByLabelText('New Formulary Lookup'));
    expect(mockNavigate).toHaveBeenCalledWith('InsurerSelection');
  });

  it('renders the Settings button', () => {
    const { getByLabelText } = render(<HomeScreen />);
    expect(getByLabelText('Settings')).toBeTruthy();
  });

  it('navigates to SettingsTab on Settings press', () => {
    const { getByLabelText } = render(<HomeScreen />);
    fireEvent.press(getByLabelText('Settings'));
    expect(mockNavigate).toHaveBeenCalledWith('SettingsTab');
  });

  it('renders the View Insights button', () => {
    const { getByLabelText } = render(<HomeScreen />);
    expect(getByLabelText('View Insights')).toBeTruthy();
  });

  it('navigates to InsightsTab on Insights press', () => {
    const { getByLabelText } = render(<HomeScreen />);
    fireEvent.press(getByLabelText('View Insights'));
    expect(mockNavigate).toHaveBeenCalledWith('InsightsTab');
  });

  it('renders Discover section with article previews', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Discover')).toBeTruthy();
    expect(getByText('Test Article One')).toBeTruthy();
    expect(getByText('Test Article Two')).toBeTruthy();
  });

  it('renders See All link for Discover section', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('See All')).toBeTruthy();
  });

  it('navigates to DiscoverTab on See All press', () => {
    const { getByText } = render(<HomeScreen />);
    fireEvent.press(getByText('See All'));
    expect(mockNavigate).toHaveBeenCalledWith('DiscoverTab');
  });

  it('renders Saved Lookups expandable section', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Saved Lookups')).toBeTruthy();
  });
});
