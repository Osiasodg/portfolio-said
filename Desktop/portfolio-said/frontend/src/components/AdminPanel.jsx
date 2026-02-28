// Le panneau d'administration

import { useState, useEffect } from 'react';
import { getStats, getProjects, createProject, updateProject, deleteProject, uploadCV, login } from '../services/api';

const AdminPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('adminToken'));
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [projectForm, setProjectForm] = useState({
    title: '', description: '', technologies: '', githubUrl: '', liveUrl: ''
  });
  const [editingId, setEditingId] = useState(null);

  const loadData = async () => {
    try {
      const [statsRes, projectsRes] = await Promise.all([getStats(), getProjects()]);
      setStats(statsRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await login(loginForm.email, loginForm.password);
      localStorage.setItem('adminToken', res.data.token);
      setIsLoggedIn(true);
    } catch {
      alert('Identifiants incorrects');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...projectForm,
      technologies: projectForm.technologies.split(',').map(t => t.trim())
    };
    try {
      if (editingId) {
        await updateProject(editingId, data);
      } else {
        await createProject(data);
      }
      setProjectForm({ title: '', description: '', technologies: '', githubUrl: '', liveUrl: '' });
      setEditingId(null);
      loadData();
    } catch (err) {
      alert('Erreur : ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce projet ?')) {
      await deleteProject(id);
      loadData();
    }
  };

  const handleEdit = (project) => {
    setProjectForm({
      title: project.title,
      description: project.description,
      technologies: project.technologies.join(', '),
      githubUrl: project.githubUrl || '',
      liveUrl: project.liveUrl || ''
    });
    setEditingId(project._id);
    setActiveTab('projects');
  };

  const handleCVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('cv', file);
    try {
      await uploadCV(formData);
      alert('CV uploadé avec succès !');
    } catch {
      alert('Erreur lors de l\'upload du CV');
    }
  };

  // Page de connexion
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="bg-slate-800 p-8 rounded-xl w-full max-w-md">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">🔐 Admin</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg"
              value={loginForm.email}
              onChange={e => setLoginForm({...loginForm, email: e.target.value})}
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg"
              value={loginForm.password}
              onChange={e => setLoginForm({...loginForm, password: e.target.value})}
              required
            />
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">🎛️ Panneau Admin</h1>
          <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded-lg text-sm">Déconnexion</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700">
          {['stats', 'projects', 'cv'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-2 capitalize font-semibold transition-colors ${activeTab === tab ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400'}`}
            >
              {tab === 'stats' ? '📊 Statistiques' : tab === 'projects' ? '💻 Projets' : '📄 Mon CV'}
            </button>
          ))}
        </div>

        {/* STATS */}
        {activeTab === 'stats' && stats && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-800 p-6 rounded-xl text-center">
                <p className="text-4xl font-bold text-blue-400">{stats.totalVisitors}</p>
                <p className="text-slate-400 mt-2">Total visiteurs</p>
              </div>
              <div className="bg-slate-800 p-6 rounded-xl text-center">
                <p className="text-4xl font-bold text-green-400">{stats.todayVisitors}</p>
                <p className="text-slate-400 mt-2">Visites aujourd'hui</p>
              </div>
              <div className="bg-slate-800 p-6 rounded-xl text-center">
                <p className="text-4xl font-bold text-yellow-400">{stats.avgTimeSpent}s</p>
                <p className="text-slate-400 mt-2">Temps moyen sur le site</p>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">🕐 Derniers visiteurs</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="text-left py-2">Heure d'arrivée</th>
                      <th className="text-left py-2">Page</th>
                      <th className="text-left py-2">Temps passé</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentVisitors?.map(v => (
                      <tr key={v._id} className="border-b border-slate-700/50">
                        <td className="py-2">{new Date(v.arrivalTime).toLocaleString('fr-FR')}</td>
                        <td className="py-2">{v.page}</td>
                        <td className="py-2">{v.timeSpent > 0 ? `${v.timeSpent}s` : 'En cours...'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PROJETS */}
        {activeTab === 'projects' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Formulaire */}
            <div className="bg-slate-800 p-6 rounded-xl">
              <h3 className="font-semibold mb-4">{editingId ? '✏️ Modifier' : '➕ Ajouter'} un projet</h3>
              <form onSubmit={handleProjectSubmit} className="space-y-4">
                <input placeholder="Titre*" required className="w-full bg-slate-700 px-4 py-2 rounded-lg"
                  value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} />
                <textarea placeholder="Description*" required rows={3} className="w-full bg-slate-700 px-4 py-2 rounded-lg resize-none"
                  value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} />
                <input placeholder="Technologies (séparées par virgule)" className="w-full bg-slate-700 px-4 py-2 rounded-lg"
                  value={projectForm.technologies} onChange={e => setProjectForm({...projectForm, technologies: e.target.value})} />
                <input placeholder="URL GitHub" className="w-full bg-slate-700 px-4 py-2 rounded-lg"
                  value={projectForm.githubUrl} onChange={e => setProjectForm({...projectForm, githubUrl: e.target.value})} />
                <input placeholder="URL Live (optionnel)" className="w-full bg-slate-700 px-4 py-2 rounded-lg"
                  value={projectForm.liveUrl} onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})} />
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-blue-600 py-2 rounded-lg hover:bg-blue-700">
                    {editingId ? 'Mettre à jour' : 'Ajouter'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={() => { setEditingId(null); setProjectForm({title:'',description:'',technologies:'',githubUrl:'',liveUrl:''}); }}
                      className="bg-slate-600 px-4 py-2 rounded-lg">Annuler</button>
                  )}
                </div>
              </form>
            </div>

            {/* Liste des projets */}
            <div className="space-y-4">
              {projects.map(p => (
                <div key={p._id} className="bg-slate-800 p-4 rounded-xl flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{p.title}</h4>
                    <p className="text-slate-400 text-sm">{p.description.substring(0, 80)}...</p>
                    <div className="flex gap-1 mt-2">
                      {p.technologies.map(t => (
                        <span key={t} className="bg-slate-700 text-xs px-2 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4 shrink-0">
                    <button onClick={() => handleEdit(p)} className="text-blue-400 hover:text-blue-300 text-sm">✏️</button>
                    <button onClick={() => handleDelete(p._id)} className="text-red-400 hover:text-red-300 text-sm">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CV */}
        {activeTab === 'cv' && (
          <div className="max-w-md">
            <div className="bg-slate-800 p-6 rounded-xl">
              <h3 className="font-semibold mb-4">📄 Uploader mon CV (PDF)</h3>
              <p className="text-slate-400 text-sm mb-4">
                Le CV uploadé remplacera l'ancien. Il sera disponible au téléchargement sur ton portfolio.
              </p>
              <label className="block w-full border-2 border-dashed border-slate-500 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors">
                <div className="text-4xl mb-3">📁</div>
                <p className="text-slate-300 font-semibold">Cliquer pour uploader</p>
                <p className="text-slate-500 text-sm mt-1">PDF uniquement, 5MB max</p>
                <input type="file" accept=".pdf" className="hidden" onChange={handleCVUpload} />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;