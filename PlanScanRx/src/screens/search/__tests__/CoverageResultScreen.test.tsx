import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CoverageResultScreen from '../CoverageResultScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockRoute = {
  params: { planId: 10, drugId: 20 },
  key: 'CoverageResult',
  name: 'CoverageResult' as const,
};

// Mock useTheme
jest.mock('../../../theme/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      surface: '#E0E5EC',
      textPrimary: '#2D3748',
      textSecondary: '#718096',
      textAccent: '#6C63FF',
      accent: '#6C63FF',
      statusCovered: '#38A169',
      statusCoveredBg: '#C6F6D5',
      statusNotCovered: '#E53E3E',
      statusNotCoveredBg: '#FED7D7',
      statusSpecialty: '#805AD5',
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
    NeuIconWell: ({ children }: any) => R.createElement(RN.View, null, children),
    AppIcon: ({ name }: any) => R.createElement(RN.Text, null, name),
    Button: ({ label, onPress }: any) =>
      R.createElement(RN.Pressable, { onPress, accessibilityRole: 'button' },
        R.createElement(RN.Text, null, label),
      ),
    EmptyState: ({ headline, description, ctaLabel, onCtaPress }: any) =>
      R.createElement(RN.View, null,
        R.createElement(RN.Text, null, headline),
        R.createElement(RN.Text, null, description),
        ctaLabel ? R.createElement(RN.Pressable, { onPress: onCtaPress },
          R.createElement(RN.Text, null, ctaLabel),
        ) : null,
      ),
    ErrorState: ({ title, description, onRetry }: any) =>
      R.createElement(RN.View, null,
        R.createElement(RN.Text, null, title),
        R.createElement(RN.Text, null, description),
        R.createElement(RN.Pressable, { onPress: onRetry, accessibilityRole: 'button' },
          R.createElement(RN.Text, null, 'Retry'),
        ),
      ),
    LoadingState: () => R.createElement(RN.Text, null, 'Loading...'),
  };
});

// Mock composites
jest.mock('../../../components/composites/StateSelectorBar', () => {
  const { Text } = require('react-native');
  return function MockStateSelectorBar() {
    return <Text>StateSelectorBar</Text>;
  };
});

jest.mock('../../../components/composites/RestrictionBadgeRow', () => ({
  RestrictionBadgeRow: () => {
    const { Text } = require('react-native');
    return <Text>RestrictionBadges</Text>;
  },
}));

jest.mock('../../../components/composites/TierDisplay', () => ({
  TierDisplay: ({ tierLevel, tierName }: any) => {
    const { Text } = require('react-native');
    return <Text>Tier {tierLevel}: {tierName}</Text>;
  },
}));

jest.mock('../../../components/composites/CostDisplay', () => ({
  CostDisplay: ({ copayAmount }: any) => {
    const { Text } = require('react-native');
    return <Text>Copay: ${copayAmount}</Text>;
  },
}));

// Variable to control hook return
let mockCoverageReturn: any;

jest.mock('../../../hooks/queries/useCoverage', () => ({
  useCoverage: () => mockCoverageReturn,
}));

describe('CoverageResultScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state', () => {
    mockCoverageReturn = {
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: jest.fn(),
    };

    const { getByText } = render(
      <CoverageResultScreen navigation={{ navigate: mockNavigate } as any} route={mockRoute as any} />,
    );
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('shows error state', () => {
    mockCoverageReturn = {
      data: undefined,
      isLoading: false,
      isError: true,
      error: { displayMessage: 'Unable to retrieve coverage info' },
      refetch: jest.fn(),
    };

    const { getByText } = render(
      <CoverageResultScreen navigation={{ navigate: mockNavigate } as any} route={mockRoute as any} />,
    );
    expect(getByText('Unable to retrieve coverage info')).toBeTruthy();
    expect(getByText('Check your connection and try again.')).toBeTruthy();
  });

  it('shows retry button on error', () => {
    const mockRefetch = jest.fn();
    mockCoverageReturn = {
      data: undefined,
      isLoading: false,
      isError: true,
      error: { displayMessage: 'Server error' },
      refetch: mockRefetch,
    };

    const { getByText } = render(
      <CoverageResultScreen navigation={{ navigate: mockNavigate } as any} route={mockRoute as any} />,
    );
    fireEvent.press(getByText('Retry'));
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('shows not found state when no entry', () => {
    mockCoverageReturn = {
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    };

    const { getByText } = render(
      <CoverageResultScreen navigation={{ navigate: mockNavigate } as any} route={mockRoute as any} />,
    );
    expect(getByText('Not Found on Formulary')).toBeTruthy();
  });

  it('shows covered result', () => {
    mockCoverageReturn = {
      data: {
        entryId: 1,
        planId: 10,
        drugId: 20,
        isCovered: true,
        tierLevel: 2,
        tierName: 'Preferred Brand',
        priorAuthRequired: false,
        stepTherapy: false,
        quantityLimit: false,
        quantityLimitDetail: null,
        specialtyDrug: false,
        copayAmount: 25,
        coinsurancePct: null,
        copayMailOrder: 20,
        sourceType: 'CMS',
        sourceDate: '2026-03-01',
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    };

    const { getByText } = render(
      <CoverageResultScreen navigation={{ navigate: mockNavigate } as any} route={mockRoute as any} />,
    );
    expect(getByText('COVERED')).toBeTruthy();
  });

  it('shows not-covered result with alternatives prompt', () => {
    mockCoverageReturn = {
      data: {
        entryId: 2,
        planId: 10,
        drugId: 20,
        isCovered: false,
        tierLevel: null,
        tierName: null,
        priorAuthRequired: false,
        stepTherapy: false,
        quantityLimit: false,
        quantityLimitDetail: null,
        specialtyDrug: false,
        copayAmount: null,
        coinsurancePct: null,
        copayMailOrder: null,
        sourceType: 'CMS',
        sourceDate: '2026-03-01',
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    };

    const { getByText } = render(
      <CoverageResultScreen navigation={{ navigate: mockNavigate } as any} route={mockRoute as any} />,
    );
    expect(getByText('NOT COVERED')).toBeTruthy();
    expect(getByText('View Covered Alternatives')).toBeTruthy();
  });

  it('shows covered-restricted status with restriction badges', () => {
    mockCoverageReturn = {
      data: {
        entryId: 3,
        planId: 10,
        drugId: 20,
        isCovered: true,
        tierLevel: 3,
        tierName: 'Non-Preferred',
        priorAuthRequired: true,
        stepTherapy: true,
        quantityLimit: false,
        quantityLimitDetail: null,
        specialtyDrug: false,
        copayAmount: 50,
        coinsurancePct: null,
        copayMailOrder: null,
        sourceType: 'CMS',
        sourceDate: '2026-03-01',
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    };

    const { getByText } = render(
      <CoverageResultScreen navigation={{ navigate: mockNavigate } as any} route={mockRoute as any} />,
    );
    expect(getByText(/COVERED.*Restrictions Apply/)).toBeTruthy();
    expect(getByText('RestrictionBadges')).toBeTruthy();
    expect(getByText('View Prior Auth Details')).toBeTruthy();
    expect(getByText('View Step Therapy Details')).toBeTruthy();
  });

  it('shows specialty drug info when applicable', () => {
    mockCoverageReturn = {
      data: {
        entryId: 4,
        planId: 10,
        drugId: 20,
        isCovered: true,
        tierLevel: 5,
        tierName: 'Specialty',
        priorAuthRequired: false,
        stepTherapy: false,
        quantityLimit: false,
        quantityLimitDetail: null,
        specialtyDrug: true,
        copayAmount: null,
        coinsurancePct: 30,
        copayMailOrder: null,
        sourceType: 'CMS',
        sourceDate: '2026-03-01',
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    };

    const { getByText } = render(
      <CoverageResultScreen navigation={{ navigate: mockNavigate } as any} route={mockRoute as any} />,
    );
    expect(getByText('Specialty Medication')).toBeTruthy();
  });

  it('navigates to DrugAlternatives on View Alternatives press', () => {
    mockCoverageReturn = {
      data: {
        entryId: 1,
        planId: 10,
        drugId: 20,
        isCovered: true,
        tierLevel: 2,
        tierName: 'Preferred Brand',
        priorAuthRequired: false,
        stepTherapy: false,
        quantityLimit: false,
        quantityLimitDetail: null,
        specialtyDrug: false,
        copayAmount: 25,
        coinsurancePct: null,
        copayMailOrder: 20,
        sourceType: 'CMS',
        sourceDate: '2026-03-01',
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    };

    const { getByText } = render(
      <CoverageResultScreen navigation={{ navigate: mockNavigate } as any} route={mockRoute as any} />,
    );
    fireEvent.press(getByText('View Alternatives'));
    expect(mockNavigate).toHaveBeenCalledWith('DrugAlternatives', {
      drugId: 20,
      planId: 10,
      drugName: 'Drug #20',
    });
  });
});
