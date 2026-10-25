import { Component } from 'react';
import { EmptyState } from './EmptyState.jsx';

export class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err) { console.error('Render error:', err); }
  render() {
    if (this.state.err) return <EmptyState message="This panel could not be drawn." action={String(this.state.err.message || this.state.err)} />;
    return this.props.children;
  }
}
