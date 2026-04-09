import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { InsurerCard } from '../InsurerCard';

// Mock useTheme
jest.mock('../../../theme/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      surface: '#E0E5EC',
      textPrimary: '#2D3748',
      textSecondary: '#718096',
      textAccent: '#6C63FF',
      textInverse: '#FFFFFF',
      accent: '#6C63FF',
      shadowLight: '#FFFFFF',
      shadowDark: 'rgba(163,177,198,0.6)',
    },
    isDark: false,
    mode: 'light',
  }),
}));

// Mock primitives
jest.mock('../../primitives', () => {
  const RN = require('react-native');
  const R = require('react');
  return {
    NeuSurface: ({ children }: any) => R.createElement(RN.View, null, children),
    NeuInset: ({ children }: any) => R.createElement(RN.View, null, children),
    AppIcon: ({ name }: any) => R.createElement(RN.Text, null, name),
  };
});

describe('InsurerCard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the insurer name', () => {
    const { getByText } = render(
      <InsurerCard name="Aetna" selected={false} onPress={mockOnPress} />,
    );
    expect(getByText('Aetna')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const { getByText } = render(
      <InsurerCard name="Cigna" selected={false} onPress={mockOnPress} />,
    );
    fireEvent.press(getByText('Cigna'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('shows check icon when selected', () => {
    const { getByText } = render(
      <InsurerCard name="Aetna" selected={true} onPress={mockOnPress} />,
    );
    expect(getByText('check')).toBeTruthy();
  });

  it('does not show check icon when not selected', () => {
    const { queryByText } = render(
      <InsurerCard name="Aetna" selected={false} onPress={mockOnPress} />,
    );
    expect(queryByText('check')).toBeNull();
  });

  it('has correct accessibility role', () => {
    const { getByRole } = render(
      <InsurerCard name="UHC" selected={false} onPress={mockOnPress} />,
    );
    expect(getByRole('checkbox')).toBeTruthy();
  });

  it('has correct accessibility label when not selected', () => {
    const { getByLabelText } = render(
      <InsurerCard name="Blue Cross" selected={false} onPress={mockOnPress} />,
    );
    expect(getByLabelText('Blue Cross')).toBeTruthy();
  });

  it('has correct accessibility label when selected', () => {
    const { getByLabelText } = render(
      <InsurerCard name="Blue Cross" selected={true} onPress={mockOnPress} />,
    );
    expect(getByLabelText('Blue Cross, selected')).toBeTruthy();
  });

  it('renders with disabled state', () => {
    const { getByRole } = render(
      <InsurerCard name="Aetna" selected={false} onPress={mockOnPress} disabled />,
    );
    const checkbox = getByRole('checkbox');
    expect(checkbox.props.accessibilityState.disabled).toBe(true);
  });

  it('does not call onPress when disabled', () => {
    const { getByText } = render(
      <InsurerCard name="Aetna" selected={false} onPress={mockOnPress} disabled />,
    );
    fireEvent.press(getByText('Aetna'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });
});
