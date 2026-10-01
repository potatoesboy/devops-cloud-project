import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const load = () => fetch('/api/tasks').then(r => r.json()).then(setTasks);
  useEffect(load, []);

  async function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch('/api/tasks', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({title}) });
    setTitle(''); load();
  }

  async function remove(id) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    load();
  }

  return <main>
    <h1>DevOps Cloud Demo</h1>
    <p>React + Express + PostgreSQL + Docker + GitHub Actions + AWS</p>
    <form onSubmit={addTask}><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Add a deployment task"/><button>Add</button></form>
    <ul>{tasks.map(t => <li key={t.id}><span>{t.title}</span><button onClick={()=>remove(t.id)}>Delete</button></li>)}</ul>
  </main>;
}
createRoot(document.getElementById('root')).render(<App/>);
