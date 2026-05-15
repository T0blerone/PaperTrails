"use client";

import { useEffect, useMemo, useState } from "react";

export default function PaperTrailsApp({
  initialUser,
  initialPeople,
  initialNotes,
  initialDevices,
  maxLength
}) {
  const [user, setUser] = useState(initialUser);
  const [people, setPeople] = useState(initialPeople);
  const [notes, setNotes] = useState(initialNotes);
  const [devices, setDevices] = useState(initialDevices);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);

  const remaining = maxLength - body.length;
  const sortedNotes = useMemo(() => notes || [], [notes]);
  const recipient = people[0] || null;
  const canSend = Boolean(mounted && !busy && body.trim() && remaining >= 0 && recipient);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function refresh() {
    const response = await fetch("/api/notes/recent", { cache: "no-store" });
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    setUser(data.user);
    setPeople(data.people);
    setNotes(data.notes);
    setDevices(data.devices);
  }

  async function handleLogin(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const response = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password })
    });

    const data = await response.json().catch(() => ({}));
    setBusy(false);

    if (!response.ok) {
      setError(data.error || "Could not log in.");
      return;
    }

    setUser(data.user);
    setName("");
    setPassword("");
    await refresh();
  }

  async function handleLogout() {
    await fetch("/api/session", { method: "DELETE" });
    setUser(null);
    setNotes([]);
    setPeople([]);
    setBody("");
  }

  async function handleSend(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const response = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body })
    });

    const data = await response.json().catch(() => ({}));
    setBusy(false);

    if (!response.ok) {
      setError(data.error || "Could not send the note.");
      return;
    }

    setBody("");
    await refresh();
  }

  return (
    <main className="shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Paper Trails</p>
          <h1>Send a small note to the printer.</h1>
        </div>
        {user ? (
          <button className="ghostButton" onClick={handleLogout}>
            Sign out
          </button>
        ) : null}
      </section>

      {user ? (
        <div className="workspace">
          <section className="composerPanel">
            <div className="panelHeader">
              <div>
                <p className="eyebrow">Signed in as {user.name}</p>
                <h2>New note</h2>
              </div>
              <span className={remaining < 0 ? "count danger" : "count"}>
                {remaining}
              </span>
            </div>

            <form onSubmit={handleSend} className="composer">
              <div className="recipientLine">
                <span>To</span>
                <strong>{recipient ? recipient.name : "No recipient configured"}</strong>
              </div>

              <label>
                Message
                <textarea
                  value={body}
                  maxLength={maxLength + 1}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Write something short enough to fit on a receipt..."
                />
              </label>

              {error ? <p className="error">{error}</p> : null}

              <button
                className="primaryButton"
                disabled={!canSend}
                suppressHydrationWarning
              >
                {busy ? "Sending..." : "Send note"}
              </button>
            </form>
          </section>

          <section className="sidePanel">
            <div className="panelHeader">
              <div>
                <p className="eyebrow">Recent</p>
                <h2>Notes</h2>
              </div>
              <button className="ghostButton" onClick={refresh}>
                Refresh
              </button>
            </div>

            <div className="timeline">
              {sortedNotes.length ? (
                sortedNotes.map((note) => (
                  <article className="noteCard" key={note.id}>
                    <div className="noteMeta">
                      <span>{note.sender?.name} to {note.recipient?.name}</span>
                      <Status status={note.status} />
                    </div>
                    <p>{note.body}</p>
                    <time>{formatDate(note.createdAt)}</time>
                  </article>
                ))
              ) : (
                <p className="empty">No notes yet.</p>
              )}
            </div>

            <div className="devices">
              <p className="eyebrow">Printers</p>
              {devices.map((device) => (
                <div className="deviceRow" key={device.id}>
                  <span>{device.label}</span>
                  <small>{device.lastSeenAt ? formatDate(device.lastSeenAt) : "not seen yet"}</small>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <section className="loginPanel">
          <form onSubmit={handleLogin} className="loginForm">
            <label>
              Name
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            {error ? <p className="error">{error}</p> : null}
            <button className="primaryButton" disabled={busy || !name || !password}>
              {busy ? "Checking..." : "Sign in"}
            </button>
          </form>
        </section>
      )}
    </main>
  );
}

function Status({ status }) {
  return <span className={`status ${status}`}>{status}</span>;
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}
