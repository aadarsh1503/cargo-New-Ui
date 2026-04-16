import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config/apiConfig';

const BOT_GIF = 'https://media.tenor.com/n53f5g-plM0AAAAi/emo.gif';

const STATUS_LABEL_MAP = {
  submitted: 'Pending Review', admin_review: 'Under Review',
  forwarded_to_agent: 'Pending', agent_priced: 'Pending',
  sent_to_user: 'Quote Ready', user_approved: 'Confirmed',
  payment_requested: 'Payment Required', payment_proof_submitted: 'Proof Submitted',
  payment_completed: 'Paid', agent_payment_requested: 'Processing',
  agent_payment_sent: 'In Progress', in_progress: 'In Progress',
  completed: 'Delivered', cancelled: 'Cancelled',
};

const STATUS_COLOR = {
  'Quote Ready': 'bg-blue-100 text-blue-700',
  'Confirmed': 'bg-teal-100 text-teal-700',
  'Payment Required': 'bg-orange-100 text-orange-700',
  'Proof Submitted': 'bg-yellow-100 text-yellow-700',
  'Paid': 'bg-green-100 text-green-700',
  'Processing': 'bg-purple-100 text-purple-700',
  'In Progress': 'bg-emerald-100 text-emerald-700',
  'Delivered': 'bg-gray-100 text-gray-600',
  'Cancelled': 'bg-red-100 text-red-600',
};

const TypingDots = () => (
  <div className="flex items-center gap-1 px-3 py-2">
    {[0, 1, 2].map(i => (
      <span key={i} className="w-2 h-2 bg-[#243670] rounded-full animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }} />
    ))}
  </div>
);

// Render text with **bold** and [text](url) links
const renderText = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, li) => {
    // Split by bold or markdown link patterns
    const tokens = line.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);
    const rendered = tokens.map((p, i) => {
      if (!p) return null;
      if (p.startsWith('**') && p.endsWith('**')) {
        return <strong key={i}>{p.slice(2, -2)}</strong>;
      }
      const linkMatch = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const isInternal = linkMatch[2].startsWith('/');
        return isInternal
          ? <Link key={i} to={linkMatch[2]} className="text-[#243670] underline font-semibold">{linkMatch[1]}</Link>
          : <a key={i} href={linkMatch[2]} target="_blank" rel="noreferrer" className="text-[#243670] underline font-semibold">{linkMatch[1]}</a>;
      }
      return <span key={i}>{p}</span>;
    });
    return <span key={li}>{rendered}{li < lines.length - 1 && <br />}</span>;
  });
};

// Booking card component
const BookingCard = ({ booking }) => {
  const friendlyStatus = STATUS_LABEL_MAP[booking.status] || booking.status;
  const statusClass = STATUS_COLOR[friendlyStatus] || 'bg-gray-100 text-gray-600';
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 mb-2 shadow-sm">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-xs font-bold text-[#243670]">{booking.reference_id}</span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusClass}`}>{friendlyStatus}</span>
      </div>
      <p className="text-xs text-gray-700 font-medium">
        {booking.port_of_loading_city || '?'} → {booking.port_of_discharge_city || '?'}
      </p>
      {booking.commodity && <p className="text-xs text-gray-500 mt-0.5">{booking.commodity}</p>}
      {booking.final_price && (
        <p className="text-xs font-semibold text-emerald-600 mt-1">
          USD {parseFloat(booking.final_price).toLocaleString()}
        </p>
      )}
    </div>
  );
};

const Message = ({ msg }) => {
  const isBot = msg.role === 'assistant';
  return (
    <div className={`flex gap-2 ${isBot ? 'justify-start' : 'justify-end'} mb-3`}>
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-[#243670] flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
          <img src={BOT_GIF} alt="AI" className="w-full h-full object-cover rounded-full" />
        </div>
      )}
      <div className={`max-w-[85%] ${isBot ? '' : ''}`}>
        {/* Booking cards */}
        {msg.bookings && msg.bookings.length > 0 && (
          <div className="mb-2">
            {msg.bookings.map(b => <BookingCard key={b.reference_id} booking={b} />)}
          </div>
        )}
        {/* Text bubble */}
        {msg.content && (
          <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
            isBot ? 'bg-gray-100 text-gray-800 rounded-tl-sm' : 'bg-[#243670] text-white rounded-tr-sm'
          }`}>
            {isBot ? renderText(msg.content) : msg.content}
          </div>
        )}
      </div>
    </div>
  );
};

const SUGGESTED = [
  'What services do you offer?',
  'How do I get a freight quote?',
  'Track my booking',
  'What is FCL vs LCL?',
];

export default function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the GVS Cargo AI assistant 👋\n\nI can help with freight services, quotes, and tracking your bookings. What can I help you with today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).slice(2));

  // Auth state — persists for the lifetime of the chat widget
  const [verified, setVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [awaitingEmail, setAwaitingEmail] = useState(false);
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpInput, setOtpInput] = useState('');

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const addMessage = (role, content, extra = {}) => {
    setMessages(prev => [...prev, { role, content, ...extra }]);
  };

  const handleLogout = () => {
    setVerified(false);
    setVerifiedEmail('');
    addMessage('assistant', 'You have been signed out. Your booking data is no longer accessible in this session.');
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userText = text.trim();
    setInput('');
    addMessage('user', userText);
    setLoading(true);

    // Only trigger email flow if NOT already verified
    const bookingKeywords = /booking|shipment|status|track|order|reference|gvs-|my order|my shipment/i;
    if (bookingKeywords.test(userText) && !verified && !awaitingEmail && !awaitingOtp) {
      setAwaitingEmail(true);
      setLoading(false);
      addMessage('assistant', 'To look up your bookings, I need to verify your identity.\n\nPlease enter the **email address** you used when submitting your freight request:');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          messages: [...messages, { role: 'user', content: userText }].map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      addMessage('assistant', data.reply || 'Sorry, something went wrong.');
    } catch {
      addMessage('assistant', 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!pendingEmail.trim() || loading) return;
    const email = pendingEmail.trim();
    addMessage('user', email);
    setLoading(true);
    setAwaitingEmail(false);
    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, action: 'send_otp', email }),
      });
      const data = await res.json();
      addMessage('assistant', data.reply);
      if (data.awaitOtp) {
        setAwaitingOtp(true);
        setPendingEmail(email); // keep email for OTP submit
      }
    } catch {
      addMessage('assistant', 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otpInput.trim() || loading) return;
    const code = otpInput.trim();
    addMessage('user', code);
    setLoading(true);
    setAwaitingOtp(false);
    setOtpInput('');
    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, action: 'verify_otp', email: pendingEmail, otp: code }),
      });
      const data = await res.json();
      if (data.verified) {
        setVerified(true);
        setVerifiedEmail(pendingEmail);
        setPendingEmail('');
        // Show booking cards + text reply
        addMessage('assistant', data.bookings && data.bookings.length
          ? 'Here are your bookings. Would you like details on any specific one?'
          : data.reply,
          { bookings: data.bookings || [] }
        );
      } else {
        addMessage('assistant', data.reply);
        if (data.otpFailed) setAwaitingOtp(true);
      }
    } catch {
      addMessage('assistant', 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-16 left-3 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-3 w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ height: '540px' }}>

          {/* Header */}
          <div className="bg-[#243670] px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-base"><img src={BOT_GIF} alt="AI" className="w-full h-full object-cover right-1 relative rounded-full" /></div>
              <div>
                <p className="text-white font-semibold text-sm">GVS Cargo AI</p>
                <p className="text-white/60 text-xs">
                  {verified ? `Signed in as ${verifiedEmail}` : 'Ask me anything'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {verified && (
                <button onClick={handleLogout}
                  className="text-white/70 hover:text-white text-xs border border-white/30 rounded-full px-2 py-0.5">
                  Sign out
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white text-xl leading-none">×</button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            {messages.map((m, i) => <Message key={i} msg={m} />)}
            {loading && (
              <div className="flex gap-2 justify-start mb-3">
                <div className="w-7 h-7 rounded-full bg-[#243670] flex items-center justify-center text-sm flex-shrink-0"><img src={BOT_GIF} alt="AI" className="w-full h-full  relative object-cover rounded-full" /></div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm"><TypingDots /></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested prompts */}
          {messages.length === 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
              {SUGGESTED.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="text-xs bg-blue-50 text-[#243670] border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-100 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Email input */}
          {awaitingEmail && (
            <div className="px-3 pb-3 flex-shrink-0 border-t border-gray-100 pt-2 space-y-2">
              <input type="email" value={pendingEmail}
                onChange={e => setPendingEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()}
                placeholder="your@email.com"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#243670]"
                autoFocus />
              <button onClick={handleEmailSubmit} disabled={loading || !pendingEmail.trim()}
                className="w-full bg-[#243670] text-white rounded-xl py-2 text-sm font-semibold hover:bg-blue-900 disabled:opacity-50">
                Send Verification Code
              </button>
            </div>
          )}

          {/* OTP input */}
          {awaitingOtp && (
            <div className="px-3 pb-3 flex-shrink-0 border-t border-gray-100 pt-2 space-y-2">
              <input type="text" maxLength={6} value={otpInput}
                onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && handleOtpSubmit()}
                placeholder="Enter 6-digit code"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-center tracking-widest font-bold focus:outline-none focus:border-[#243670]"
                autoFocus />
              <button onClick={handleOtpSubmit} disabled={loading || otpInput.length < 6}
                className="w-full bg-[#243670] text-white rounded-xl py-2 text-sm font-semibold hover:bg-blue-900 disabled:opacity-50">
                Verify
              </button>
            </div>
          )}

          {/* Normal input */}
          {!awaitingEmail && !awaitingOtp && (
            <div className="px-3 pb-3 pt-2 border-t border-gray-100 flex gap-2 flex-shrink-0">
              <input ref={inputRef} type="text" value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                placeholder="Type a message..."
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#243670]" />
              <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
                className="bg-[#243670] text-white rounded-xl px-3 py-2 hover:bg-blue-900 disabled:opacity-40 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button onClick={() => setOpen(o => !o)}
        className="bg-[#243670] text-white rounded-full shadow-lg flex items-center gap-2 px-4 py-1 hover:bg-blue-900 transition-all duration-300">
        {open
          ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          : <><img src={BOT_GIF} alt="AI" className="w-8 h-8 rounded-full object-cover" /><span className="text-sm font-semibold">GVS Cargo AI</span></>
        }
      </button>
    </div>
  );
}
