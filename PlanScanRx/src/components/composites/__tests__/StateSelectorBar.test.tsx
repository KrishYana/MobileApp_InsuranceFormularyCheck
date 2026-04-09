import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StateSelectorBar from '../StateSelectorBar';

// Mock theme
jest.mock('../../../theme/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      surface: '#E0E5EC',
      textPrimary: '#2D3748',
      textSecondary: '#718096',
      textAccent: '#6C63FF',
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
  const R = require('react');
  const RN = require('react-native');
  return {
    NeuSurface: ({ children }: any) => R.createElement(RN.View, null, children),
    NeuInset: ({ children }: any) => R.createElement(RN.View, null, children),
    SearchBar: ({ placeholder, value, onChangeText }: any) =>
      R.createElement(RN.TextInput, { placeholder, value, onChangeText, testID: 'search-bar' }),
    AppIcon: ({ name }: any) => R.createElement(RN.Text, null, name),
  };
});

// Track store state for mocking
let mockSelectedState: any = { code: 'CA', name: 'California' };
const mockSetSelectedState = jest.fn();
let mockHasHydrated = true;

jest.mock('../../../stores/appStore', () => ({
  useAppStore: Object.assign(
    (selector: any) => {
      const state = {
        selectedState: mockSelectedState,
        setSelectedState: mockSetSelectedState,
      };
      return selector(state);
    },
    {
      persist: {
        hasHydrated: () => mockHasHydrated,
      },
    },
  ),
}));

describe('StateSelectorBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelectedState = { code: 'CA', name: 'California' };
    mockHasHydrated = true;
  });

  it('renders the selected state name', () => {
    const { getByText } = render(<StateSelectorBar />);
    expect(getByText('California')).toBeTruthy();
  });

  it('shows "Select your state" when no state is selected', () => {
    mockSelectedState = null;
    const { getByText } = render(<StateSelectorBar />);
    expect(getByText('Select your state')).toBeTruthy();
  });

  it('has correct accessibility label with selected state', () => {
    const { getByLabelText } = render(<StateSelectorBar />);
    expect(getByLabelText('Selected state: California. Tap to change.')).toBeTruthy();
  });

  it('has correct accessibility label without selected state', () => {
    mockSelectedState = null;
    const { getByLabelText } = render(<StateSelectorBar />);
    expect(getByLabelText('Select your state')).toBeTruthy();
  });

  it('renders in compact mode', () => {
    const { getByText } = render(<StateSelectorBar compact />);
    expect(getByText('California')).toBeTruthy();
  });

  it('renders in non-compact mode by default', () => {
    const { getByText } = render(<StateSelectorBar />);
    expect(getByText('California')).toBeTruthy();
  });

  it('opens modal when pressed', () => {
    const { getByText } = render(<StateSelectorBar />);
    fireEvent.press(getByText('California'));
    // After pressing, the modal should show "Select Your State" title
    expect(getByText('Select Your State')).toBeTruthy();
  });
});
