const { useState, useEffect, useMemo } = React;

const API_BASE = "http://127.0.0.1:8000/api";

function App() {
    const [activeThreadId, setActiveThreadId] = useState(null);
    const [triggerRefresh, setTriggerRefresh] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);

    const refreshApp = () => setTriggerRefresh(prev => prev + 1);

    const handleDeleteThread = async (threadId) => {
        if (!confirm("Are you sure you want to delete this entire conversation?")) return;
        try {
            await fetch(`${API_BASE}/threads/${threadId}/`, { method: 'DELETE' });
            if (activeThreadId === threadId) setActiveThreadId(null);
            refreshApp();
        } catch (err) {
            console.error("Failed to delete thread", err);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
            {/* Mobile Backdrop */}
            {(isSidebarOpen || isAiSidebarOpen) && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden transition-opacity"
                    onClick={() => { setIsSidebarOpen(false); setIsAiSidebarOpen(false); }}
                ></div>
            )}

            {/* 1. Left Sidebar (Threads) */}
            <Sidebar
                activeThreadId={activeThreadId}
                onSelectThread={(id) => { setActiveThreadId(id); setIsSidebarOpen(false); }}
                triggerRefresh={triggerRefresh}
                onNewThread={refreshApp}
                isOpen={isSidebarOpen}
                onDeleteThread={handleDeleteThread}
            />

            {/* 2. Main Content (Feed) */}
            <main className="flex-1 flex flex-col min-w-0 bg-white relative z-10 md:shadow-2xl md:shadow-indigo-900/5 md:z-20 md:rounded-l-3xl overflow-hidden border-l border-slate-100">
                {/* Mobile Header */}
                <header className="h-16 border-b border-slate-100 flex items-center justify-between px-4 md:hidden shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-20">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg active:scale-95 transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-xs shadow-indigo-200 shadow-lg">F</div>
                        <span className="font-bold text-slate-700 tracking-tight">Forum AI</span>
                    </div>
                    <button onClick={() => setIsAiSidebarOpen(true)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg active:scale-95 transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
                    {activeThreadId ? (
                        <MainFeed
                            key={activeThreadId}
                            threadId={activeThreadId}
                            onPostDeleted={refreshApp}
                        />
                    ) : (
                        <EmptyState onNewThread={() => document.getElementById("create-thread-modal").showModal()} />
                    )}
                </div>
            </main>

            {/* 3. Right Sidebar (AI Insights) */}
            <AISidebar
                threadId={activeThreadId}
                triggerRefresh={triggerRefresh}
                isOpen={isAiSidebarOpen}
            />

            <CreateThreadModal onSuccess={refreshApp} />
        </div>
    );
}

function Sidebar({ activeThreadId, onSelectThread, triggerRefresh, onNewThread, isOpen, onDeleteThread }) {
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetch(`${API_BASE}/threads/`)
            .then(res => res.json())
            .then(data => {
                setThreads(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, [triggerRefresh]);

    const filteredThreads = useMemo(() => {
        return threads.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [threads, searchTerm]);

    return (
        <aside className={`
            fixed md:static inset-y-0 left-0 z-40 w-80 bg-slate-50/50 flex flex-col h-full transition-transform duration-300 ease-in-out
            ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}>
            <div className="p-6 pb-2">
                <div className="flex items-center gap-3 mb-8 px-1">
                    <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">F</div>
                    <div>
                        <h1 className="text-base font-bold text-slate-800 leading-tight">Forum AI</h1>
                        <p className="text-[10px] text-indigo-500 font-bold tracking-widest uppercase">Dashboard</p>
                    </div>
                </div>

                <button
                    onClick={() => document.getElementById("create-thread-modal").showModal()}
                    className="w-full bg-white hover:bg-white text-slate-700 hover:text-indigo-600 font-semibold py-3 px-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md hover:shadow-indigo-100 flex items-center justify-center gap-3 group mb-6"
                >
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg leading-none group-hover:scale-110 transition-transform">+</span>
                    <span>New Discussion</span>
                </button>

                <div className="relative group focus-within:ring-2 focus-within:ring-indigo-100 rounded-xl transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none text-slate-700 placeholder:text-slate-400 transition-all"
                    />
                </div>
            </div>

            <div className="overflow-y-auto flex-1 px-4 pb-4 space-y-1 custom-scrollbar">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 py-3 mt-2">All Threads</div>
                {loading ? (
                    <div className="space-y-3 p-2">
                        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-200/50 rounded-xl animate-pulse"></div>)}
                    </div>
                ) : filteredThreads.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                        {searchTerm ? "No matches found." : "No conversations yet."}
                    </div>
                ) : (
                    filteredThreads.map(thread => (
                        <div
                            key={thread.id}
                            className={`group relative p-3.5 rounded-xl cursor-pointer transition-all duration-300 border-2 transform ${activeThreadId === thread.id
                                ? "bg-white border-indigo-300 shadow-xl shadow-indigo-200/60 z-10 scale-[1.02]"
                                : "bg-white/50 border-slate-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/30 hover:scale-[1.01] text-slate-600"
                                }`}
                            onClick={() => onSelectThread(thread.id)}
                        >
                            <div className="pr-6">
                                <h3 className={`font-semibold text-[13px] mb-1.5 leading-snug ${activeThreadId === thread.id ? "text-slate-800" : "text-slate-600"}`}>
                                    {thread.title}
                                </h3>
                                <p className={`text-[11px] line-clamp-1 leading-relaxed ${activeThreadId === thread.id ? "text-indigo-400/80" : "text-slate-400"}`}>
                                    {thread.preview}
                                </p>
                            </div>

                            <button
                                onClick={(e) => { e.stopPropagation(); onDeleteThread(thread.id); }}
                                className="absolute top-3.5 right-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-50 rounded-lg"
                                title="Delete Thread"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
}

function MainFeed({ threadId, onPostDeleted }) {
    const [thread, setThread] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tRes, pRes] = await Promise.all([
                fetch(`${API_BASE}/threads/${threadId}/`),
                fetch(`${API_BASE}/threads/${threadId}/posts/`)
            ]);
            const tData = await tRes.json();
            const pData = await pRes.json();
            setThread(tData);
            setPosts(pData);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [threadId]);

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        const content = e.target.content.value;
        const author = e.target.author.value || "Anonymous";

        await fetch(`${API_BASE}/threads/${threadId}/posts/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, author_name: author })
        });
        e.target.reset();

        const pRes = await fetch(`${API_BASE}/threads/${threadId}/posts/`);
        const pData = await pRes.json();
        setPosts(pData);
    };

    const handleDeletePost = async (postId) => {
        if (!confirm("Delete this reply?")) return;
        try {
            await fetch(`${API_BASE}/posts/${postId}/`, { method: 'DELETE' });
            setPosts(posts.filter(p => p.id !== postId));
            onPostDeleted && onPostDeleted();
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="h-full flex items-center justify-center text-slate-300 animate-pulse">Loading conversation...</div>;
    if (!thread) return null;

    return (
        <div className="max-w-4xl mx-auto w-full p-6 md:p-12 fade-in pb-32">
            {/* Header */}
            <div className="mb-10 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-4 border border-slate-200">
                    <span>Topic #{threadId}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight tracking-tight">{thread.title}</h1>
                <div className="flex items-center justify-center md:justify-start gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> {new Date(thread.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> {new Date(thread.created_at).toLocaleTimeString([], { timeStyle: 'short' })}</span>
                </div>
            </div>

            {/* Posts */}
            <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-8 before:w-px before:bg-gradient-to-b before:from-slate-200 before:to-transparent md:before:left-10">
                {posts.map(post => (
                    <PostItem key={post.id} post={post} onDelete={() => handleDeletePost(post.id)} />
                ))}
            </div>

            {/* Reply Area */}
            <div className="mt-16 sticky bottom-6 z-20">
                <div className="absolute inset-0 bg-white/50 backdrop-blur-xl rounded-3xl -m-6 z-0"></div>
                <div className="relative z-10 bg-white p-1 rounded-2xl border border-slate-200 shadow-xl shadow-indigo-900/5">
                    <ReplyForm onSubmit={handlePostSubmit} />
                </div>
            </div>
        </div>
    );
}

function PostItem({ post, onDelete }) {
    const isAnonymous = post.author_name === "Anonymous";

    return (
        <div className="group relative pl-20 md:pl-24 transition-all">
            {/* Avatar connector */}
            <div className="absolute left-6 md:left-8 top-8 w-4 h-px bg-slate-200"></div>

            {/* Avatar */}
            <div className="absolute left-0 top-0 w-16 md:w-20 flex flex-col items-center">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl border-4 border-white shadow-sm flex items-center justify-center text-sm font-bold transition-transform group-hover:scale-105 ${isAnonymous ? "bg-slate-100 text-slate-400" : "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-indigo-200"
                    }`}>
                    {post.author_name.charAt(0).toUpperCase()}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm group-hover:shadow-md group-hover:border-indigo-100 transition-all relative">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex flex-col">
                        <span className={`font-bold text-sm md:text-base ${isAnonymous ? 'text-slate-500' : 'text-indigo-900'}`}>
                            {post.author_name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">{new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {post.sentiment && (
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${post.sentiment === "Positive" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            post.sentiment === "Critical" ? "bg-rose-50 text-rose-600 border-rose-100" :
                                "bg-slate-50 text-slate-500 border-slate-100"
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${post.sentiment === "Positive" ? "bg-emerald-500" :
                                post.sentiment === "Critical" ? "bg-rose-500" :
                                    "bg-slate-400"
                                }`}></span>
                            {post.sentiment}
                        </div>
                    )}
                </div>

                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-[15px]">
                    {post.content}
                </div>

                {/* Delete Post Button */}
                <button
                    onClick={onDelete}
                    className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all p-2 hover:bg-slate-50 rounded-lg"
                    title="Delete Post"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        </div>
    )
}

function AISidebar({ threadId, triggerRefresh, isOpen }) {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);

    // Derived state for parsed data
    const { topics, summaryText } = useMemo(() => {
        if (!summary) return { topics: [], summaryText: "" };

        let text = summary;
        let extractedTopics = [];

        // Simple Parse Logic based on "Key topics: ..., ..., .... \n\nSummary: ..."
        // Or "Key topics discussed: ..., .... The overall sentiment is ..."

        const topicMatch = text.match(/Key topics(?: discussed)?:(.*?)(?:\.|The|\n)/i);
        if (topicMatch && topicMatch[1]) {
            extractedTopics = topicMatch[1].split(',').map(t => t.trim()).filter(t => t);
            // Remove the topic sentence from display if we strictly want just summary, 
            // but usually keeping the full flow is fine. Let's try to clean it up for the "Summary" block.
            // Actually, showing the full logic is fine, but badges are cool.
        }

        return { topics: extractedTopics, summaryText: text };
    }, [summary]);

    // Fetch summary when thread changes
    useEffect(() => {
        if (!threadId) { setSummary(null); return; }
        fetch(`${API_BASE}/threads/${threadId}/`)
            .then(res => res.json())
            .then(data => setSummary(data.summary))
            .catch(err => console.error(err));
    }, [threadId, triggerRefresh]);

    const handleSummarize = async () => {
        setLoading(true);
        console.log(`DEBUG: Clicking Summarize for thread ${threadId}`); // Log click
        try {
            const url = `${API_BASE}/threads/${threadId}/summarize/`;
            console.log(`DEBUG: Fetching ${url}`); // Log URL
            const res = await fetch(url, { method: 'POST' });
            console.log(`DEBUG: Response status: ${res.status}`); // Log Status

            const data = await res.json();
            setSummary(data.summary);
        } catch (err) {
            console.error("DEBUG: Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!threadId) return (
        <aside className={`fixed md:static inset-y-0 right-0 z-40 w-80 bg-slate-50 border-l border-slate-200 hidden md:flex flex-col items-center justify-center text-center p-8`}>
            <div className="w-32 h-32 bg-indigo-50/50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <span className="text-4xl opacity-20">✨</span>
            </div>
            <h3 className="text-slate-900 font-bold mb-2">AI Insights</h3>
            <p className="text-slate-400 text-sm">Select a conversation to unlock intelligent summaries.</p>
        </aside>
    );

    return (
        <aside className={`
            fixed md:static inset-y-0 right-0 z-40 w-80 bg-slate-50 lg:w-96 border-l border-slate-200 flex flex-col h-full transform transition-transform duration-300 ease-in-out
            ${isOpen ? "translate-x-0 shadow-2xl" : "translate-x-full md:translate-x-0"}
        `}>
            <div className="p-6 border-b border-slate-200">
                <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50 w-fit px-3 py-1.5 rounded-lg border border-indigo-100 mb-2">
                    <span className="text-base animate-pulse">✨</span>
                    <h2 className="font-bold text-xs tracking-widest uppercase">AI Analysis</h2>
                </div>
                <p className="text-xs text-slate-500 font-medium">Real-time intelligence engine</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {summary ? (
                    <div className="fade-in space-y-6">
                        {/* Topic Badges */}
                        {topics.length > 0 && (
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Detected Topics</h4>
                                <div className="flex flex-wrap gap-2">
                                    {topics.map((topic, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded-lg text-xs font-semibold text-slate-700 hover:border-indigo-300 transition-colors cursor-default">
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Main Summary Card */}
                        <div className="bg-white p-6 rounded-2xl border-2 border-indigo-200 hover:border-indigo-500 shadow-xl shadow-indigo-100/50 hover:shadow-2xl hover:shadow-indigo-500/20 relative overflow-hidden group transition-all duration-300 transform hover:-translate-y-1">
                            {/* Decorative BG */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-transparent rounded-full -mr-16 -mt-16 blur-xl pointer-events-none group-hover:from-indigo-200 transition-colors"></div>

                            <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span> TL;DR Summary
                            </h4>
                            <p className="text-slate-800 text-[14px] leading-relaxed relative z-10 font-medium">
                                {summary === "No content to summarize."
                                    ? <span className="italic text-slate-400 font-normal">Not enough context yet. Add more contributions to the discussion.</span>
                                    : summaryText}
                            </p>
                        </div>

                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 shadow-sm">
                            <div className="flex gap-3 mb-2">
                                <span className="text-xl">💡</span>
                                <p className="text-xs text-indigo-900 font-bold mt-0.5 uppercase tracking-wide">AI Insight</p>
                            </div>
                            <p className="text-xs text-indigo-800/80 leading-relaxed font-medium">
                                This summary works fully offline using your local CPU. No data is sent to the cloud.
                            </p>
                        </div>

                        <button
                            onClick={handleSummarize}
                            disabled={loading}
                            className="w-full py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Analyzing...
                                </>
                            ) : "Refresh Analysis ↻"}
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-100 border border-slate-50 text-3xl relative">
                            🤖
                            <div className="absolute top-0 right-0 -mr-2 -mt-2 w-4 h-4 bg-red-400 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 mb-1">Waiting for content</h3>
                            <p className="text-xs text-slate-400 max-w-[200px] mx-auto leading-relaxed">The AI is ready to read and summarize this thread for you.</p>
                        </div>
                        <button
                            onClick={handleSummarize}
                            disabled={loading}
                            className="px-6 py-2.5 bg-white border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 rounded-xl text-xs font-bold shadow-sm transition-all"
                        >
                            {loading ? "Generating..." : "Generate Summary"}
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}

function ReplyForm({ onSubmit }) {
    const [isAnonymous, setIsAnonymous] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e);
        setIsAnonymous(false);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-0 md:gap-4 p-2">
            <div className="flex-1">
                <textarea
                    name="content"
                    required
                    rows="2"
                    className="w-full bg-transparent p-3 outline-none text-sm text-slate-700 placeholder:text-slate-400 resize-none"
                    placeholder="Type your reply here..."
                ></textarea>
            </div>

            <div className="flex md:flex-col items-center justify-between gap-3 p-2 md:border-l md:border-slate-100 md:pl-4">
                <label className="flex items-center gap-2 cursor-pointer group" title="Toggle Anonymous">
                    <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition cursor-pointer"
                    />
                    <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isAnonymous ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                        {isAnonymous ? "Anon" : "Public"}
                    </span>
                </label>

                <div className={`transition-all duration-300 overflow-hidden ${isAnonymous ? 'w-0 opacity-0 md:h-0' : 'w-24 opacity-100 md:h-auto'}`}>
                    <input
                        name="author"
                        disabled={isAnonymous}
                        className="w-full text-xs text-slate-600 placeholder:text-slate-300 bg-slate-50 px-2 py-1.5 rounded-lg border border-transparent focus:bg-white focus:border-indigo-100 outline-none transition"
                        placeholder="Your Name"
                    />
                </div>
                {isAnonymous && <input type="hidden" name="author" value="Anonymous" />}

                <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-200 transform active:scale-95 transition flex items-center justify-center"
                    title="Send Reply"
                >
                    <svg className="w-5 h-5 translate-x-0.5 -translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
            </div>
        </form>
    );
}

function EmptyState({ onNewThread }) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50/30">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-indigo-200 rounded-full blur-2xl opacity-20"></div>
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-100 relative z-10 border border-white">
                    <span className="text-4xl">🚀</span>
                </div>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Welcome to Forum AI</h2>
            <p className="text-sm text-slate-500 max-w-xs mb-8 leading-relaxed">Select a conversation from the left sidebar to start reading, or begin a new topic to generate insights.</p>
            <button onClick={onNewThread} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-0.5">
                Start New Thread
            </button>
        </div>
    );
}

function CreateThreadModal({ onSuccess }) {
    const handleSubmit = async (e) => {
        e.preventDefault();
        const title = e.target.title.value;
        const firstPost = e.target.firstPost.value;
        const author = e.target.author.value || "Anonymous";

        const tRes = await fetch(`${API_BASE}/threads/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });
        const tData = await tRes.json();

        await fetch(`${API_BASE}/threads/${tData.id}/posts/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: firstPost, author_name: author })
        });

        document.getElementById("create-thread-modal").close();
        onSuccess();
    };

    return (
        <dialog id="create-thread-modal" className="modal p-0 rounded-3xl shadow-2xl backdrop:bg-slate-900/40">
            <div className="bg-white w-[500px] max-w-full overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">New Discussion</h3>
                        <p className="text-xs text-slate-500">Launch a new topic for the community</p>
                    </div>
                    <button onClick={() => document.getElementById("create-thread-modal").close()} className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-400 transition">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Topic Title</label>
                        <input name="title" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition font-medium text-slate-800" placeholder="e.g. The Future of AI in Education" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">First Post</label>
                        <textarea name="firstPost" required rows="4" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition text-slate-700" placeholder="Elaborate on your idea..." />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Your Name</label>
                        <input name="author" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition font-medium text-slate-800" placeholder="Optional (defaults to Anonymous)" />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition shadow-xl shadow-indigo-200 transform active:scale-95 mt-2">Create Discussion</button>
                </form>
            </div>
        </dialog>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
