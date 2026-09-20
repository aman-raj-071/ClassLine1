import React, { Component } from 'react';
import { RefreshCw } from 'lucide-react';

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

/** Keeps one failed dashboard component from leaving families on a blank page. */
export class AppErrorBoundary extends Component<Props, State> {
  private readonly content: React.ReactNode;
  state: State;

  constructor(props: Props) {
    super(props);
    this.content = props.children;
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.content;
    return <main className="flex min-h-screen items-center justify-center bg-[#f7f3ed] p-5"><section className="max-w-md rounded-2xl border border-[#d4cdc4] bg-[#fdfaf6] p-7 text-center shadow-sm"><h1 className="font-serif text-3xl text-[#1a1410]">ClassLine needs to refresh</h1><p className="mt-3 text-sm leading-relaxed text-[#5a4f45]">Your information has not been sent or changed. Refresh the page to continue.</p><button type="button" onClick={() => window.location.reload()} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1a1410] px-4 py-2.5 text-sm font-bold text-white"><RefreshCw className="h-4 w-4" />Refresh ClassLine</button></section></main>;
  }
}
