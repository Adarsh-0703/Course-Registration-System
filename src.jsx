import React, { useEffect, useState } from 'react';

// Course Registration Single-File React Component
// - No backend / no DB. Uses localStorage for draft persistence.
// - Enforces credit rules: MIN_CREDITS = 16, MAX_CREDITS = 27
// - Course catalog included below (credits 1-4).
// - Features: add/remove courses, realtime credit counter, validation messages,
//   save draft / load draft, export selection as JSON.

const MIN_CREDITS = 16;
const MAX_CREDITS = 27;
const LOCALSTORE_KEY = 'course_reg_draft_v1';

const CATALOG = [
  // Core / Foundation
  { code: 'CS101', title: 'Programming I: C/C++', credits: 3, domain: 'Core' },
  { code: 'CS102', title: 'Data Structures', credits: 4, domain: 'Core' },
  { code: 'CS103', title: 'Discrete Mathematics', credits: 3, domain: 'Core' },
  { code: 'CS104', title: 'Digital Logic & Comp Org', credits: 3, domain: 'Core' },
  { code: 'CS105', title: 'Algorithms', credits: 4, domain: 'Core' },
  { code: 'CS106', title: 'Operating Systems', credits: 4, domain: 'Core' },
  { code: 'CS107', title: 'Computer Networks', credits: 3, domain: 'Core' },
  { code: 'CS108', title: 'Database Systems', credits: 4, domain: 'Core' },

  // Software Engineering & Dev
  { code: 'SE201', title: 'Software Engineering', credits: 3, domain: 'SE' },
  { code: 'SE202', title: 'Web Technologies', credits: 3, domain: 'SE' },
  { code: 'SE203', title: 'Mobile App Development', credits: 2, domain: 'SE' },
  { code: 'SE204', title: 'DevOps & CI/CD', credits: 2, domain: 'SE' },

  // Theory / Maths / Tools
  { code: 'TM301', title: 'Theory of Computation', credits: 3, domain: 'Theory' },
  { code: 'TM302', title: 'Linear Algebra & Numerical Methods', credits: 3, domain: 'Theory' },
  { code: 'TM303', title: 'Probability & Statistics', credits: 3, domain: 'Theory' },

  // Systems & Security
  { code: 'SYS401', title: 'Distributed Systems', credits: 3, domain: 'Systems' },
  { code: 'SYS402', title: 'Cloud Computing', credits: 3, domain: 'Systems' },
  { code: 'SEC403', title: 'Cybersecurity Fundamentals', credits: 3, domain: 'Security' },
  { code: 'SEC404', title: 'Cryptography', credits: 3, domain: 'Security' },

  // AI / ML / Data
  { code: 'AI501', title: 'Introduction to AI', credits: 3, domain: 'AI' },
  { code: 'AI502', title: 'Machine Learning', credits: 4, domain: 'AI' },
  { code: 'AI503', title: 'Deep Learning', credits: 4, domain: 'AI' },
  { code: 'DS504', title: 'Data Mining', credits: 3, domain: 'Data' },
  { code: 'DS505', title: 'Big Data Technologies', credits: 3, domain: 'Data' },

  // HCI / Multimedia / Electives
  { code: 'HM601', title: 'Human-Computer Interaction', credits: 2, domain: 'HCI' },
  { code: 'HM602', title: 'Computer Graphics', credits: 3, domain: 'HCI' },
  { code: 'HM603', title: 'Image Processing', credits: 3, domain: 'HCI' },
  { code: 'HM604', title: 'AR/VR Basics', credits: 2, domain: 'HCI' },

  // Interdisciplinary / Small-credit
  { code: 'IS701', title: 'Ethics in Computing', credits: 1, domain: 'Interdisciplinary' },
  { code: 'IS702', title: 'Entrepreneurship & Startups', credits: 1, domain: 'Interdisciplinary' },
  { code: 'IS703', title: 'Technical Communication', credits: 1, domain: 'Interdisciplinary' },
  { code: 'IS704', title: 'Internship / Project Lab', credits: 4, domain: 'Interdisciplinary' }
];

export default function CourseRegistrationApp() {
  const [catalog] = useState(CATALOG);
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState(null);

  // New: modal state for popup when validation fails
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState('');

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCALSTORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSelectedCodes(parsed);
      }
    } catch (e) {
      // ignore malformed
    }
  }, []);

  useEffect(() => {
    // Clear ephemeral messages after 4s
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  function getCourse(code) {
    return catalog.find(c => c.code === code);
  }

  function totalCredits() {
    return selectedCodes.reduce((sum, code) => {
      const c = getCourse(code);
      return sum + (c ? c.credits : 0);
    }, 0);
  }

  function toggleCourse(code) {
    setSelectedCodes(prev => {
      if (prev.includes(code)) return prev.filter(c => c !== code);
      return [...prev, code];
    });
  }

  function saveDraft() {
    localStorage.setItem(LOCALSTORE_KEY, JSON.stringify(selectedCodes));
    setMessage({ type: 'success', text: 'Draft saved to localStorage.' });
  }

  function clearDraft() {
    localStorage.removeItem(LOCALSTORE_KEY);
    setSelectedCodes([]);
    setMessage({ type: 'info', text: 'Draft cleared.' });
  }

  function exportSelection() {
    const payload = selectedCodes.map(code => getCourse(code));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'course_selection.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function submitSelection() {
    const credits = totalCredits();
    const errors = [];
    if (credits < MIN_CREDITS) errors.push(`Add ${MIN_CREDITS - credits} more credit(s) to reach minimum ${MIN_CREDITS}.`);
    if (credits > MAX_CREDITS) errors.push(`Remove ${credits - MAX_CREDITS} credit(s) to be at most ${MAX_CREDITS}.`);

    if (errors.length) {
      // Instead of only showing inline message, show a popup modal for credit requirement failures
      const text = errors.join(' ');
      setModalText(text);
      setShowModal(true);
      return;
    }

    // Since no backend, we simulate a successful submit and then lock the draft.
    setMessage({ type: 'success', text: `Submitted successfully (${credits} credits). Draft locked.` });
    // lock by saving under a different key and clearing editable draft
    localStorage.setItem(LOCALSTORE_KEY + '_submitted', JSON.stringify({ ts: Date.now(), selection: selectedCodes }));
  }

  const credits = totalCredits();
  const disabledSubmit = credits < MIN_CREDITS || credits > MAX_CREDITS;

  // Filtering and searching
  const visible = catalog.filter(c => (filter === 'All' || c.domain === filter) &&
    (c.code.toLowerCase().includes(search.toLowerCase()) || c.title.toLowerCase().includes(search.toLowerCase()))
  );

  const domains = ['All', ...Array.from(new Set(catalog.map(c => c.domain)))];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Course Registration Portal (Client-only)</h1>
          <div className="text-sm text-gray-600">Credits: <strong>{credits}</strong> &nbsp;|&nbsp; Min {MIN_CREDITS} — Max {MAX_CREDITS}</div>
        </header>

        {message && (
          <div className={`mb-4 p-3 rounded ${message.type === 'error' ? 'bg-red-100 text-red-800' : message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
            {message.text}
          </div>
        )}

        {/* Modal popup for validation errors (e.g., total credits not met) */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowModal(false)}></div>
            <div className="bg-white rounded shadow-lg z-50 max-w-lg w-full p-6">
              <h2 className="text-lg font-semibold mb-2">Validation Error</h2>
              <p className="mb-4">{modalText}</p>
              <div className="flex justify-end">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded bg-indigo-600 text-white">OK</button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-3 bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-3">Controls</h2>
            <div className="mb-2">
              <label className="block text-xs text-gray-600">Filter by domain</label>
              <select className="w-full mt-1 p-2 border rounded" value={filter} onChange={e => setFilter(e.target.value)}>
                {domains.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-600">Search courses</label>
              <input className="w-full mt-1 p-2 border rounded" value={search} onChange={e => setSearch(e.target.value)} placeholder="search code or title" />
            </div>

            <div className="mt-4">
              <button className="w-full mb-2 px-3 py-2 rounded bg-indigo-600 text-white" onClick={saveDraft}>Save Draft</button>
              <button className="w-full mb-2 px-3 py-2 rounded bg-yellow-500 text-white" onClick={exportSelection}>Export JSON</button>
              <button className="w-full mb-2 px-3 py-2 rounded bg-green-600 text-white" onClick={submitSelection} disabled={disabledSubmit}>
                Submit Selection
              </button>
              <button className="w-full mb-2 px-3 py-2 rounded bg-gray-200" onClick={clearDraft}>Clear Draft</button>
            </div>

            <div className="mt-4 text-sm text-gray-700">
              <strong>Selected ({selectedCodes.length})</strong>
              <ul className="mt-2 space-y-1">
                {selectedCodes.map(code => {
                  const c = getCourse(code);
                  return (
                    <li key={code} className="flex items-center justify-between">
                      <span>{c.code} — {c.title} <span className="text-xs text-gray-500">({c.credits})</span></span>
                      <button className="text-xs text-red-600" onClick={() => toggleCourse(code)}>Remove</button>
                    </li>
                  );
                })}
                {selectedCodes.length === 0 && <li className="text-gray-500">No courses selected</li>}
              </ul>
            </div>

          </aside>

          <main className="col-span-9">
            <section className="mb-4">
              <h2 className="text-lg font-semibold">Catalog</h2>
              <p className="text-sm text-gray-500">Click a course to add/remove it. Course credits shown on the right.</p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visible.map(course => {
                const isSelected = selectedCodes.includes(course.code);
                return (
                  <article key={course.code} className={`p-4 rounded border ${isSelected ? 'border-indigo-400 bg-indigo-50' : 'bg-white'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm text-gray-600">{course.code} · {course.domain}</div>
                        <h3 className="font-medium">{course.title}</h3>
                        <div className="text-xs text-gray-500 mt-1">Credits: {course.credits}</div>
                      </div>
                      <div className="flex flex-col items-end">
                        <button onClick={() => toggleCourse(course.code)} className={`px-3 py-1 rounded text-sm mb-2 ${isSelected ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'}`}>
                          {isSelected ? 'Remove' : 'Add'}
                        </button>
                        <div className="text-xs text-gray-500">{isSelected ? 'Selected' : 'Available'}</div>
                      </div>
                    </div>
                  </article>
                );
              })}

              {visible.length === 0 && (
                <div className="col-span-full p-6 bg-white rounded shadow text-gray-600">No courses matched your filter.</div>
              )}
            </section>

            <section className="mt-6 p-4 bg-white rounded shadow">
              <h3 className="font-semibold mb-2">Validation</h3>
              <div className="text-sm">
                <p>Total credits: <strong>{credits}</strong></p>
                {credits < MIN_CREDITS && <p className="text-red-600">Under minimum: add {MIN_CREDITS - credits} credit(s).</p>}
                {credits > MAX_CREDITS && <p className="text-red-600">Over maximum: remove {credits - MAX_CREDITS} credit(s).</p>}
                {credits >= MIN_CREDITS && credits <= MAX_CREDITS && <p className="text-green-700">Good — within allowed range.</p>}
              </div>
            </section>

          </main>
        </div>

        <footer className="mt-8 text-sm text-gray-500">This is a client-only demo app (no backend). Use "Save Draft" to persist selection locally. Export optional JSON for sharing.</footer>
      </div>
    </div>
  );
}
