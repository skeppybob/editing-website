import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Check, Clock3, Film, LoaderCircle, Menu, Play, Plus, Sparkles, X } from 'lucide-react';
import { supabase } from './lib/supabase';

type RequestFormat = 'Video' | 'Short' | 'Reel' | 'Other';
type RequestStatus = 'New' | 'In progress' | 'Complete';
type EditRequest = {
  id: string;
  title: string;
  format: RequestFormat;
  notes: string;
  status: RequestStatus;
  created_at: string;
};

const formats: RequestFormat[] = ['Video', 'Short', 'Reel', 'Other'];

function App() {
  const [requests, setRequests] = useState<EditRequest[]>([]);
  const [title, setTitle] = useState('');
  const [format, setFormat] = useState<RequestFormat>('Short');
  const [notes, setNotes] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const newCount = useMemo(() => requests.filter((request) => request.status === 'New').length, [requests]);

  useEffect(() => {
    void loadRequests();
  }, []);

  async function loadRequests(): Promise<void> {
    setIsLoading(true);
    const { data, error: requestError } = await supabase
      .from('video_edit_requests')
      .select('id, title, format, notes, status, created_at')
      .order('created_at', { ascending: false });

    if (requestError) {
      setError('Requests are temporarily unavailable. Try refreshing the page.');
    } else {
      setRequests((data ?? []) as EditRequest[]);
    }
    setIsLoading(false);
  }

  async function submitRequest(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setIsSubmitting(true);
    setError('');
    const { data, error: requestError } = await supabase
      .from('video_edit_requests')
      .insert({ title: trimmedTitle, format, notes: notes.trim() })
      .select('id, title, format, notes, status, created_at')
      .maybeSingle();

    if (requestError || !data) {
      setError('That request could not be saved. Please try again.');
    } else {
      setRequests((current) => [data as EditRequest, ...current]);
      setTitle('');
      setNotes('');
      setFormat('Short');
      setIsFormOpen(false);
      setMessage('Request added to the edit queue.');
      window.setTimeout(() => setMessage(''), 3500);
    }
    setIsSubmitting(false);
  }

  async function updateStatus(id: string, status: RequestStatus): Promise<void> {
    const { error: requestError } = await supabase.from('video_edit_requests').update({ status }).eq('id', id);
    if (requestError) {
      setError('The request status could not be updated.');
      return;
    }
    setRequests((current) => current.map((request) => request.id === id ? { ...request, status } : request));
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Cutroom home"><span className="brand-mark"><Film size={16} strokeWidth={2.5} /></span>cutroom</a>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#requests">Requests <span className="nav-count">{newCount}</span></a>
        </nav>
        <button className="menu-button" aria-label="Open menu"><Menu size={20} /></button>
        <button className="button button-dark button-small" onClick={() => setIsFormOpen(true)}>Start a request <ArrowUpRight size={15} /></button>
      </header>

      <main id="top">
        <section className="hero section-wrap">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> accepting new edits</div>
            <h1>Your idea,<br /><em>cut better.</em></h1>
            <p className="hero-description">Tell me what you want to make. I’ll turn the raw footage into something people want to watch twice.</p>
            <div className="hero-actions">
              <button className="button button-dark" onClick={() => setIsFormOpen(true)}>Request an edit <ArrowUpRight size={16} /></button>
              <a className="text-link" href="#how-it-works">See how it works <span>↓</span></a>
            </div>
            <div className="trust-line"><div className="avatar-stack"><span>JD</span><span>MK</span><span>AR</span></div><span>Trusted by creators<br /><strong>making things happen.</strong></span></div>
          </div>
          <div className="hero-visual">
            <div className="film-card film-card-main">
              <div className="film-card-top"><span>01 / 04</span><span className="live-dot">● now playing</span></div>
              <div className="play-orb"><Play size={21} fill="currentColor" /></div>
              <div className="film-caption"><span>the work in progress</span><strong>your next favorite cut</strong></div>
            </div>
            <div className="film-card film-card-small"><div className="mini-lines"><i /><i /><i /></div><span>raw → ready</span></div>
            <div className="visual-sticker"><Sparkles size={14} /> made with intention</div>
          </div>
        </section>

        <section className="ticker"><div className="ticker-inner"><span>short form</span><b>✦</b><span>storytelling</span><b>✦</b><span>clean cuts</span><b>✦</b><span>good energy</span><b>✦</b><span>short form</span><b>✦</b><span>storytelling</span></div></section>

        <section className="process section-wrap" id="how-it-works">
          <div className="section-heading"><div><div className="eyebrow">the easy part</div><h2>From rough idea<br />to <em>ready to post.</em></h2></div><p>Good edits start with a clear idea. Give me the headline and I’ll take it from there.</p></div>
          <div className="process-grid">
            <article className="process-card"><span className="step-number">01</span><div className="step-icon"><Plus size={22} /></div><h3>Drop a title</h3><p>Start with the one-line idea you can’t stop thinking about.</p></article>
            <article className="process-card active"><span className="step-number">02</span><div className="step-icon"><Film size={22} /></div><h3>I shape the story</h3><p>You send the footage. I find the rhythm, pace, and moments that matter.</p></article>
            <article className="process-card"><span className="step-number">03</span><div className="step-icon"><Check size={22} /></div><h3>You hit publish</h3><p>A finished cut, ready for your audience and the next idea.</p></article>
          </div>
        </section>

        <section className="requests section-wrap" id="requests">
          <div className="section-heading requests-heading"><div><div className="eyebrow">the edit queue</div><h2>What’s next<br /><em>on the timeline.</em></h2></div><button className="button button-outline" onClick={() => setIsFormOpen(true)}>Add a request <Plus size={16} /></button></div>
          {message && <div className="success-message"><Check size={16} /> {message}</div>}
          {error && <div className="error-message">{error}</div>}
          {isLoading ? <div className="empty-state"><LoaderCircle className="spin" size={24} /> Loading the queue...</div> : requests.length === 0 ? <div className="empty-state"><Clock3 size={24} /><div><strong>The queue is clear.</strong><span>Be the first to put an idea on the timeline.</span></div><button className="button button-dark button-small" onClick={() => setIsFormOpen(true)}>Add yours <ArrowUpRight size={15} /></button></div> : <div className="request-list">{requests.map((request, index) => <RequestRow key={request.id} request={request} index={index} onStatusChange={updateStatus} />)}</div>}
        </section>
      </main>

      <footer className="footer section-wrap"><a className="brand" href="#top"><span className="brand-mark"><Film size={16} strokeWidth={2.5} /></span>cutroom</a><span>good edits take time. great ones take intention.</span><span>© 2025 cutroom</span></footer>

      {isFormOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsFormOpen(false); }}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="request-title"><button className="close-button" onClick={() => setIsFormOpen(false)} aria-label="Close"><X size={20} /></button><div className="eyebrow">new edit request</div><h2 id="request-title">What are we <em>making?</em></h2><p className="modal-intro">A great title is enough to get started. Add a little more context if you have it.</p><form onSubmit={submitRequest}><label htmlFor="title">Project title <span>required</span></label><input id="title" maxLength={120} autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. A day in the life of a ceramicist" required /><label>Format</label><div className="format-options">{formats.map((option) => <button type="button" key={option} className={format === option ? 'format-option selected' : 'format-option'} onClick={() => setFormat(option)}>{option}</button>)}</div><label htmlFor="notes">Anything else? <span>optional</span></label><textarea id="notes" maxLength={1000} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="The mood, a deadline, a link to inspiration..." rows={4} /><button className="button button-dark submit-button" disabled={isSubmitting}>{isSubmitting ? <><LoaderCircle className="spin" size={16} /> Saving...</> : <>Add to the queue <ArrowUpRight size={16} /></>}</button></form></div></div>}
    </div>
  );
}

function RequestRow({ request, index, onStatusChange }: { request: EditRequest; index: number; onStatusChange: (id: string, status: RequestStatus) => Promise<void> }) {
  const statusClass = request.status.toLowerCase().replace(' ', '-');
  return <article className="request-row"><span className="request-index">{String(index + 1).padStart(2, '0')}</span><div className="request-info"><div className="request-title-line"><h3>{request.title}</h3><span className={`status status-${statusClass}`}>{request.status}</span></div><div className="request-meta"><span>{request.format}</span><span>•</span><span>{new Date(request.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>{request.notes && <><span>•</span><span className="notes-preview">{request.notes}</span></>}</div></div><select aria-label={`Change status for ${request.title}`} value={request.status} onChange={(event) => void onStatusChange(request.id, event.target.value as RequestStatus)}><option>New</option><option>In progress</option><option>Complete</option></select></article>;
}

export default App;
