import React from 'react';
import { View } from 'react-native';
import { ErrorState } from './ErrorState';
import { errorLogger } from '../../errors/errorLogger';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ScreenErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    errorLogger.log(error, { componentStack: info.componentStack ?? undefined });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1 }}>
          <ErrorState
            variant="fullscreen"
            title="Something went wrong"
            description="An unexpected error occurred. Please try again."
            onRetry={this.handleRetry}
          />
        </View>
      );
    }

    return this.props.children;
  }
}
