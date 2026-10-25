import { Component } from 'react';
import { EmptyState } from './EmptyState';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error) {
    console.error('Panel error:', error);
  }
  render() {
    if (this.state.error) {
      return <EmptyState message="This panel could not be displayed." action={String(this.state.error && this.state.error.message || '')} icon={'\u26A0\uFE0F'} />;
    }
    return this.props.children;
  }
}
