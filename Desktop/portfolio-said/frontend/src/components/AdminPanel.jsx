// AdminPanel.jsx — Version complète avec recadrage photo et gestion CV
import { useState, useEffect, useRef } from 'react';
import api, {
  getStats, getProjects, createProject, updateProject, deleteProject, login,
  getProfile, updateProfile, updateSkills, updateExperiences, updateFormations, updateContacts
} from '../services/api';
import { FaEnvelope, FaPhone, FaLinkedin, FaGithub, FaGlobe } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';


const getIcon = (label) => {
  const l = label?.toLowerCase();
  if (l?.includes('email') || l?.includes('mail')) return <FaEnvelope size={20} />;
  if (l?.includes('téléphone') || l?.includes('phone') || l?.includes('tel')) return <FaPhone size={20} />;
  if (l?.includes('linkedin')) return <FaLinkedin size={20} />;
  if (l?.includes('github')) return <FaGithub size={20} />;
  return <FaGlobe size={20} />;
};

// ===================== COMPOSANT RECADRAGE PHOTO =====================
const PhotoCropper = ({ imageSrc, onCropDone, onCancel }) => {
  const canvasRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const imgRef = useRef(new Image());
  const SIZE = 300;

  useEffect(() => {
    const img = imgRef.current;
    img.onload = () => {
      const ratio = Math.max(SIZE / img.width, SIZE / img.height);
      setScale(ratio);
      setPosition({ x: (SIZE - img.width * ratio) / 2, y: (SIZE - img.height * ratio) / 2 });
      draw(img, { x: (SIZE - img.width * ratio) / 2, y: (SIZE - img.height * ratio) / 2 }, ratio);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const draw = (img, pos, sc) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, SIZE, SIZE);
    // Fond sombre
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, SIZE, SIZE);
    // Image
    ctx.drawImage(img, pos.x, pos.y, img.width * sc, img.height * sc);
    // Cercle de recadrage
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Bordure
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.stroke();
  };

  const handleMouseDown = (e) => {
    setDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const newPos = { x: e.clientX - startPos.x, y: e.clientY - startPos.y };
    setPosition(newPos);
    draw(imgRef.current, newPos, scale);
  };

  const handleMouseUp = () => setDragging(false);

  const handleScale = (val) => {
    const newScale = parseFloat(val);
    setScale(newScale);
    draw(imgRef.current, position, newScale);
  };

  const handleApply = () => {
    const canvas = canvasRef.current;
    canvas.toBlob(blob => onCropDone(blob), 'image/jpeg', 0.92);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-white font-bold text-lg mb-4 text-center">📸 Recadrer la photo</h3>
        <p className="text-slate-400 text-xs text-center mb-4">Glisse l'image pour la positionner · Utilise le curseur pour zoomer</p>

        <div className="flex justify-center mb-4">
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            className="rounded-full cursor-grab active:cursor-grabbing border-2 border-blue-400"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        <div className="mb-6">
          <label className="text-slate-400 text-xs block mb-2 text-center">🔍 Zoom</label>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.05"
            value={scale}
            onChange={e => handleScale(e.target.value)}
            className="w-full accent-blue-500"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-2 rounded-lg font-semibold">
            Annuler
          </button>
          <button onClick={handleApply}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold">
            ✅ Appliquer
          </button>
        </div>
      </div>
    </div>
  );
};

// ===================== ADMIN PANEL PRINCIPAL =====================
const AdminPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('adminToken'));
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [activeTab, setActiveTab] = useState('stats');

  // States données
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: '', title: '', description: '' });
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [formations, setFormations] = useState([]);
  const [contacts, setContacts] = useState([]);

  // States photo
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState(null);

  // States projets
  const [projectForm, setProjectForm] = useState({ title: '', description: '', technologies: '', githubUrl: '', liveUrl: '' });
  const [editingProjectId, setEditingProjectId] = useState(null);

  // States compétences
  const [newSkillCat, setNewSkillCat] = useState('');
  const [newSkillItems, setNewSkillItems] = useState('');

  // States expériences
  const [expForm, setExpForm] = useState({ title: '', company: '', location: '', period: '', description: '', tech: '' });
  const [editingExpIdx, setEditingExpIdx] = useState(null);

  // States formations
  const [formForm, setFormForm] = useState({ title: '', school: '', location: '', period: '', description: '' });
  const [editingFormIdx, setEditingFormIdx] = useState(null);

  // States contacts
  const [contactForm, setContactForm] = useState({ label: '', value: '', icon: '', url: '' });
  const [editingContactIdx, setEditingContactIdx] = useState(null);

  // States CV
  const [cvInfo, setCvInfo] = useState(null);
  const [cvNewName, setCvNewName] = useState('');
  const [cvRenaming, setCvRenaming] = useState(false);

  // ===== CHARGEMENT =====
  const loadData = async () => {
    try {
      const [statsRes, projectsRes, profileRes] = await Promise.all([
        getStats(), getProjects(), getProfile()
      ]);
      setStats(statsRes.data);
      setProjects(projectsRes.data);
      const p = profileRes.data;
      setProfile(p);
      setProfileForm({ name: p.name || '', title: p.title || '', description: p.description || '' });
      setSkills(p.skills || []);
      setExperiences(p.experiences || []);
      setFormations(p.formations || []);
      setContacts(p.contacts || []);
      setCvInfo(p.cv || null);
    } catch (err) {
      console.error('Erreur chargement:', err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) loadData();
  }, [isLoggedIn]);

  // ===== AUTH =====
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

  // ===== PHOTO =====
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRawImageSrc(ev.target.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropDone = async (blob) => {
    setShowCropper(false);
    const url = URL.createObjectURL(blob);
    setPhotoPreview(url);

    const formData = new FormData();
    formData.append('photo', blob, 'photo.jpg');
    try {
      const res = await api.post('/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(prev => ({ ...prev, photoUrl: res.data.photoUrl }));
      alert('Photo mise à jour !');
    } catch (err) {
      alert('Erreur upload photo : ' + (err.response?.data?.message || err.message));
    }
  };

  const handlePhotoDelete = async () => {
    if (!window.confirm('Supprimer la photo de profil ?')) return;
    try {
      await api.delete('/profile/photo');
      setProfile(prev => ({ ...prev, photoUrl: '' }));
      setPhotoPreview(null);
      alert('Photo supprimée');
    } catch {
      alert('Erreur suppression photo');
    }
  };

  // ===== PROFIL =====
  const handleProfileSave = async () => {
    try {
      await updateProfile(profileForm);
      alert('Profil mis à jour !');
      loadData();
    } catch (err) {
      alert('Erreur : ' + err.message);
    }
  };

  // ===== CV =====
  const handleCVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('cv', file);
    try {
      const res = await api.post('/profile/cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCvInfo(res.data.cv);
      alert(' CV uploadé avec succès !');
    } catch (err) {
      alert('Erreur upload CV : ' + (err.response?.data?.message || err.message));
    }
    e.target.value = '';
  };

  const handleCVDelete = async () => {
    if (!window.confirm('Supprimer le CV ?')) return;
    try {
      await api.delete('/profile/cv');
      setCvInfo(null);
      alert('CV supprimé');
    } catch {
      alert('Erreur suppression CV');
    }
  };

  const handleCVRename = async () => {
    if (!cvNewName.trim()) return;
    try {
      const res = await api.put('/profile/cv/rename', { name: cvNewName.endsWith('.pdf') ? cvNewName : cvNewName + '.pdf' });
      setCvInfo(res.data.cv);
      setCvRenaming(false);
      setCvNewName('');
      alert(' CV renommé !');
    } catch {
      alert('Erreur renommage CV');
    }
  };

  // ===== PROJETS =====
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    const data = { ...projectForm, technologies: projectForm.technologies.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      if (editingProjectId) {
        await updateProject(editingProjectId, data);
      } else {
        await createProject(data);
      }
      setProjectForm({ title: '', description: '', technologies: '', githubUrl: '', liveUrl: '' });
      setEditingProjectId(null);
      loadData();
    } catch (err) {
      alert('Erreur : ' + err.message);
    }
  };

  // ===== COMPÉTENCES =====
  const handleAddSkill = () => {
    if (!newSkillCat.trim()) return;
    setSkills([...skills, { category: newSkillCat, items: newSkillItems.split(',').map(s => s.trim()).filter(Boolean) }]);
    setNewSkillCat('');
    setNewSkillItems('');
  };

  const handleSaveSkills = async () => {
    try { await updateSkills(skills); alert(' Compétences sauvegardées !'); }
    catch { alert('Erreur sauvegarde'); }
  };

  // ===== EXPÉRIENCES =====
  const handleExpSubmit = () => {
    if (!expForm.title) return;
    const entry = { ...expForm, tech: expForm.tech.split(',').map(t => t.trim()).filter(Boolean) };
    let updated;
    if (editingExpIdx !== null) {
      updated = experiences.map((e, i) => i === editingExpIdx ? entry : e);
      setEditingExpIdx(null);
    } else {
      updated = [...experiences, entry];
    }
    setExperiences(updated);
    setExpForm({ title: '', company: '', location: '', period: '', description: '', tech: '' });
  };

  const handleSaveExperiences = async () => {
    try { await updateExperiences(experiences); alert(' Expériences sauvegardées !'); }
    catch { alert('Erreur sauvegarde'); }
  };

  // ===== FORMATIONS =====
  const handleFormSubmit = () => {
    if (!formForm.title) return;
    let updated;
    if (editingFormIdx !== null) {
      updated = formations.map((f, i) => i === editingFormIdx ? formForm : f);
      setEditingFormIdx(null);
    } else {
      updated = [...formations, formForm];
    }
    setFormations(updated);
    setFormForm({ title: '', school: '', location: '', period: '', description: '' });
  };

  const handleSaveFormations = async () => {
    try { await updateFormations(formations); alert('✅ Formations sauvegardées !'); }
    catch { alert('Erreur sauvegarde'); }
  };

  // ===== CONTACTS =====
  const handleContactSubmit = () => {
    if (!contactForm.label) return;
    let updated;
    if (editingContactIdx !== null) {
      updated = contacts.map((c, i) => i === editingContactIdx ? contactForm : c);
      setEditingContactIdx(null);
    } else {
      updated = [...contacts, contactForm];
    }
    setContacts(updated);
    setContactForm({ label: '', value: '', icon: '', url: '' });
  };

  const handleSaveContacts = async () => {
    try { await updateContacts(contacts); alert(' Contacts sauvegardés !'); }
    catch { alert('Erreur sauvegarde'); }
  };

  // ===== CLASSES CSS =====
  const inp = "w-full bg-slate-700 text-white px-4 py-2 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const btnBlue = "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer";
  const btnRed = "bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer";
  const btnGray = "bg-slate-600 hover:bg-slate-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer";
  const btnGreen = "bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer";

  // ===== PAGE DE CONNEXION =====
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🔐</div>
            <h1 className="text-2xl font-bold text-white">Espace Admin</h1>
            <p className="text-slate-400 text-sm mt-1">Portfolio de Saïd Osias</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="Email" required className={inp}
              value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} />
            <input type="password" placeholder="Mot de passe" required className={inp}
              value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-base hover:bg-blue-700 transition-colors">
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'stats', label: '📊 Stats' },
    { id: 'profil', label: '👤 Profil' },
    { id: 'projects', label: '💻 Projets' },
    { id: 'skills', label: '🛠️ Compétences' },
    { id: 'experiences', label: '💼 Expériences' },
    { id: 'formations', label: '🎓 Formations' },
    { id: 'contacts', label: '📬 Contacts' },
    { id: 'cv', label: '📄 Mon CV' },
  ];

  // ✅ CORRECTION — URL Cloudinary directe
  const currentPhoto = photoPreview || (profile?.photoUrl ? profile.photoUrl : null);
  //const currentPhoto = photoPreview || (profile?.photoUrl ? `${API_URL}${profile.photoUrl}` : null);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Cropper overlay */}
      {showCropper && rawImageSrc && (
        <PhotoCropper
          imageSrc={rawImageSrc}
          onCropDone={handleCropDone}
          onCancel={() => setShowCropper(false)}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">🎛️ Panneau Admin</h1>
            <p className="text-slate-400 text-xs mt-1">Portfolio de {profile?.name || 'Saïd Osias'}</p>
          </div>
          <div className="flex gap-3 items-center">
            <a href="/" target="_blank" className="text-blue-400 text-sm hover:underline">👁️ Voir le site</a>
            <button onClick={() => { localStorage.removeItem('adminToken'); setIsLoggedIn(false); }}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold">
              Déconnexion
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-8 border-b border-slate-700">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-3 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== STATS ===== */}
        {activeTab === 'stats' && stats && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { val: stats.totalVisitors, label: 'Total visiteurs', color: 'text-blue-400' },
                { val: stats.todayVisitors, label: "Visites aujourd'hui", color: 'text-green-400' },
                { val: stats.avgTimeSpent + 's', label: 'Temps moyen', color: 'text-yellow-400' },
              ].map((s, i) => (
                <div key={i} className="bg-slate-800 p-6 rounded-xl text-center">
                  <p className={`text-4xl font-bold ${s.color}`}>{s.val}</p>
                  <p className="text-slate-400 mt-2 text-sm">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">🕐 Derniers visiteurs</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700 text-left">
                      <th className="py-2 pr-4">Heure d'arrivée</th>
                      <th className="py-2 pr-4">Page</th>
                      <th className="py-2">Temps passé</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentVisitors?.map(v => (
                      <tr key={v._id} className="border-b border-slate-700/50">
                        <td className="py-2 pr-4">{new Date(v.arrivalTime).toLocaleString('fr-FR')}</td>
                        <td className="py-2 pr-4">{v.page}</td>
                        <td className="py-2">{v.timeSpent > 0 ? `${v.timeSpent}s` : '🟢 En cours'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== PROFIL ===== */}
        {activeTab === 'profil' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Infos texte */}
            <div className="bg-slate-800 p-6 rounded-xl">
              <h3 className="font-semibold mb-5"> Informations personnelles</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Nom complet</label>
                  <input className={inp} value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Titre / Poste</label>
                  <input className={inp} value={profileForm.title}
                    onChange={e => setProfileForm({ ...profileForm, title: e.target.value })} />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Bio / Description</label>
                  <textarea rows={5} className={inp + ' resize-none'} value={profileForm.description}
                    onChange={e => setProfileForm({ ...profileForm, description: e.target.value })} />
                </div>
                <button onClick={handleProfileSave} className={btnBlue + ' w-full py-3'}>
                   Sauvegarder les infos
                </button>
              </div>
            </div>

            {/* Photo */}
            <div className="bg-slate-800 p-6 rounded-xl">
              <h3 className="font-semibold mb-5">📸 Photo de profil</h3>
              <div className="flex flex-col items-center">
                {/* Aperçu */}
                <div className="relative mb-6">
                  {currentPhoto ? (
                    <img src={currentPhoto} alt="Profil"
                      className="w-36 h-36 rounded-full object-cover border-4 border-blue-400 shadow-lg shadow-blue-400/20" />
                  ) : (
                    <div className="w-36 h-36 rounded-full bg-slate-700 flex items-center justify-center text-5xl border-4 border-slate-600">
                      👤
                    </div>
                  )}
                  {currentPhoto && (
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-xs border-2 border-slate-800">
                      ✓
                    </div>
                  )}
                </div>

                {/* Boutons */}
                <div className="flex flex-col gap-3 w-full">
                  <label className={btnBlue + ' text-center py-3 w-full'}>
                    {currentPhoto ? '🔄 Changer la photo' : '📁 Uploader une photo'}
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoSelect} />
                  </label>

                  {currentPhoto && (
                    <button onClick={handlePhotoDelete} className={btnRed + ' py-2 w-full text-sm'}>
                      🗑️ Supprimer la photo
                    </button>
                  )}
                </div>

                <p className="text-slate-500 text-xs mt-3 text-center">
                  JPG, PNG ou WebP · 5MB max<br />
                  Tu pourras recadrer après sélection
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===== CV ===== */}
        {activeTab === 'cv' && (
          <div className="max-w-lg">
            <div className="bg-slate-800 p-6 rounded-xl">
              <h3 className="font-semibold mb-5">📄 Gestion du CV</h3>

              {/* CV actuel */}
              {cvInfo ? (
                <div className="bg-slate-700 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">📑</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{cvInfo.originalName}</p>
                      <p className="text-slate-400 text-xs mt-1">
                        Uploadé le {new Date(cvInfo.uploadedAt).toLocaleDateString('fr-FR')}
                      </p>
                      {/* Renommage */}
                      {cvRenaming ? (
                        <div className="mt-3 flex gap-2">
                          <input
                            className={inp + ' flex-1'}
                            placeholder="Nouveau nom (sans .pdf)"
                            value={cvNewName}
                            onChange={e => setCvNewName(e.target.value)}
                          />
                          <button onClick={handleCVRename} className={btnGreen}>✓</button>
                          <button onClick={() => { setCvRenaming(false); setCvNewName(''); }} className={btnGray}>✗</button>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <a href={cvInfo.path} target="_blank" rel="noopener noreferrer"
                    //<a href={`${API_URL}/api/profile/cv/download`} target="_blank" rel="noopener noreferrer"
                      className={btnBlue}>
                      👁️ Prévisualiser
                    </a>
                    <a href={cvInfo.path} download={cvInfo.originalName}
                   // <a href={`${API_URL}/api/profile/cv/download`} download={cvInfo.originalName}
                      className={btnGreen}>
                      📥 Télécharger
                    </a>
                    <button onClick={() => { setCvRenaming(!cvRenaming); setCvNewName(cvInfo.originalName.replace('.pdf', '')); }}
                      className={btnGray}>
                      ✏️ Renommer
                    </button>
                    <button onClick={handleCVDelete} className={btnRed}>
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-700/50 rounded-xl p-6 text-center mb-6">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-slate-400 text-sm">Aucun CV uploadé pour l'instant</p>
                </div>
              )}

              {/* Upload nouveau CV */}
              <label className="block w-full border-2 border-dashed border-slate-500 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-slate-700/30 transition-all">
                <div className="text-4xl mb-3">📁</div>
                <p className="text-slate-300 font-semibold">{cvInfo ? 'Remplacer le CV' : 'Uploader mon CV'}</p>
                <p className="text-slate-500 text-sm mt-1">PDF uniquement · 10MB max</p>
                <input type="file" accept=".pdf" className="hidden" onChange={handleCVUpload} />
              </label>
            </div>
          </div>
        )}

        {/* ===== PROJETS ===== */}
        {activeTab === 'projects' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800 p-6 rounded-xl">
              <h3 className="font-semibold mb-4">{editingProjectId ? '✏️ Modifier' : '➕ Ajouter'} un projet</h3>
              <form onSubmit={handleProjectSubmit} className="space-y-3">
                <input placeholder="Titre *" required className={inp}
                  value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} />
                <textarea placeholder="Description *" required rows={3} className={inp + ' resize-none'}
                  value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} />
                <input placeholder="Technologies (ex: Python, SQL, React)" className={inp}
                  value={projectForm.technologies} onChange={e => setProjectForm({ ...projectForm, technologies: e.target.value })} />
                <input placeholder="URL GitHub" className={inp}
                  value={projectForm.githubUrl} onChange={e => setProjectForm({ ...projectForm, githubUrl: e.target.value })} />
                <input placeholder="URL Live (optionnel)" className={inp}
                  value={projectForm.liveUrl} onChange={e => setProjectForm({ ...projectForm, liveUrl: e.target.value })} />
                <div className="flex gap-3">
                  <button type="submit" className={btnBlue + ' flex-1 py-2.5'}>
                    {editingProjectId ? '💾 Mettre à jour' : '➕ Ajouter'}
                  </button>
                  {editingProjectId && (
                    <button type="button" onClick={() => { setEditingProjectId(null); setProjectForm({ title: '', description: '', technologies: '', githubUrl: '', liveUrl: '' }); }}
                      className={btnGray + ' px-4'}>Annuler</button>
                  )}
                </div>
              </form>
            </div>
            <div>
              <h3 className="font-semibold mb-3">📋 Projets ({projects.length})</h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {projects.length === 0 && <p className="text-slate-500 text-sm">Aucun projet.</p>}
                {projects.map(p => (
                  <div key={p._id} className="bg-slate-800 p-4 rounded-xl flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">{p.title}</h4>
                      <p className="text-slate-400 text-xs mt-1 truncate">{p.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {p.technologies.map(t => (
                          <span key={t} className="bg-slate-700 text-blue-300 text-xs px-2 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => { setProjectForm({ title: p.title, description: p.description, technologies: p.technologies.join(', '), githubUrl: p.githubUrl || '', liveUrl: p.liveUrl || '' }); setEditingProjectId(p._id); }}
                        className={btnGray}>✏️</button>
                      <button onClick={async () => { if (window.confirm('Supprimer ?')) { await deleteProject(p._id); loadData(); } }}
                        className={btnRed}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== COMPÉTENCES ===== */}
        {activeTab === 'skills' && (
          <div>
            <div className="bg-slate-800 p-5 rounded-xl mb-5">
              <h3 className="font-semibold mb-4">➕ Ajouter une catégorie</h3>
              <div className="grid md:grid-cols-3 gap-3">
                <input placeholder="Catégorie (ex: Langages)" className={inp}
                  value={newSkillCat} onChange={e => setNewSkillCat(e.target.value)} />
                <input placeholder="Items séparés par virgule" className={inp}
                  value={newSkillItems} onChange={e => setNewSkillItems(e.target.value)} />
                <button onClick={handleAddSkill} className={btnBlue + ' py-2'}>➕ Ajouter</button>
              </div>
            </div>
            <div className="space-y-3 mb-5">
              {skills.map((s, i) => (
                <div key={i} className="bg-slate-800 p-4 rounded-xl flex gap-3 items-center">
                  <span className="text-blue-400 font-semibold text-sm w-36 shrink-0">{s.category}</span>
                  <input className={inp + ' flex-1'} value={s.items.join(', ')}
                    onChange={e => { const u = [...skills]; u[i].items = e.target.value.split(',').map(x => x.trim()).filter(Boolean); setSkills(u); }} />
                  <button onClick={() => setSkills(skills.filter((_, j) => j !== i))} className={btnRed}>🗑️</button>
                </div>
              ))}
            </div>
            <button onClick={handleSaveSkills} className={btnBlue + ' px-8 py-3'}>💾 Sauvegarder</button>
          </div>
        )}

        {/* ===== EXPÉRIENCES ===== */}
        {activeTab === 'experiences' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800 p-6 rounded-xl">
              <h3 className="font-semibold mb-4">{editingExpIdx !== null ? '✏️ Modifier' : '➕ Ajouter'} une expérience</h3>
              <div className="space-y-3">
                {[['Titre du poste *', 'title'], ['Entreprise', 'company'], ['Lieu', 'location'], ['Période', 'period']].map(([ph, key]) => (
                  <input key={key} placeholder={ph} className={inp} value={expForm[key]}
                    onChange={e => setExpForm({ ...expForm, [key]: e.target.value })} />
                ))}
                <textarea placeholder="Description" rows={3} className={inp + ' resize-none'} value={expForm.description}
                  onChange={e => setExpForm({ ...expForm, description: e.target.value })} />
                <input placeholder="Technologies (séparées par virgule)" className={inp} value={expForm.tech}
                  onChange={e => setExpForm({ ...expForm, tech: e.target.value })} />
                <div className="flex gap-3">
                  <button onClick={handleExpSubmit} className={btnBlue + ' flex-1 py-2'}>
                    {editingExpIdx !== null ? '💾 Modifier' : '➕ Ajouter'}
                  </button>
                  {editingExpIdx !== null && (
                    <button onClick={() => { setEditingExpIdx(null); setExpForm({ title: '', company: '', location: '', period: '', description: '', tech: '' }); }}
                      className={btnGray}>Annuler</button>
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">📋 ({experiences.length})</h3>
                <button onClick={handleSaveExperiences} className={btnBlue}>💾 Sauvegarder</button>
              </div>
              <div className="space-y-3">
                {experiences.map((e, i) => (
                  <div key={i} className="bg-slate-800 p-4 rounded-xl flex justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm">{e.title}</p>
                      <p className="text-blue-400 text-xs">{e.company} · {e.period}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => { setExpForm({ ...e, tech: (e.tech || []).join(', ') }); setEditingExpIdx(i); }} className={btnGray}>✏️</button>
                      <button onClick={() => setExperiences(experiences.filter((_, j) => j !== i))} className={btnRed}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== FORMATIONS ===== */}
        {activeTab === 'formations' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800 p-6 rounded-xl">
              <h3 className="font-semibold mb-4">{editingFormIdx !== null ? '✏️ Modifier' : '➕ Ajouter'} une formation</h3>
              <div className="space-y-3">
                {[["Titre du diplôme *", 'title'], ['École / Université', 'school'], ['Lieu', 'location'], ['Période', 'period']].map(([ph, key]) => (
                  <input key={key} placeholder={ph} className={inp} value={formForm[key]}
                    onChange={e => setFormForm({ ...formForm, [key]: e.target.value })} />
                ))}
                <textarea placeholder="Description" rows={3} className={inp + ' resize-none'} value={formForm.description}
                  onChange={e => setFormForm({ ...formForm, description: e.target.value })} />
                <div className="flex gap-3">
                  <button onClick={handleFormSubmit} className={btnBlue + ' flex-1 py-2'}>
                    {editingFormIdx !== null ? '💾 Modifier' : '➕ Ajouter'}
                  </button>
                  {editingFormIdx !== null && (
                    <button onClick={() => { setEditingFormIdx(null); setFormForm({ title: '', school: '', location: '', period: '', description: '' }); }}
                      className={btnGray}>Annuler</button>
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">📋 ({formations.length})</h3>
                <button onClick={handleSaveFormations} className={btnBlue}>💾 Sauvegarder</button>
              </div>
              <div className="space-y-3">
                {formations.map((f, i) => (
                  <div key={i} className="bg-slate-800 p-4 rounded-xl flex justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm">{f.title}</p>
                      <p className="text-blue-400 text-xs">{f.school} · {f.period}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => { setFormForm(f); setEditingFormIdx(i); }} className={btnGray}>✏️</button>
                      <button onClick={() => setFormations(formations.filter((_, j) => j !== i))} className={btnRed}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== CONTACTS ===== */}
        {activeTab === 'contacts' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800 p-6 rounded-xl">
              <h3 className="font-semibold mb-4">{editingContactIdx !== null ? '✏️ Modifier' : '➕ Ajouter'} un contact</h3>
              <div className="space-y-3">
                <input placeholder="Label (ex: Email)" className={inp} value={contactForm.label}
                  onChange={e => setContactForm({ ...contactForm, label: e.target.value })} />
                <input placeholder="Valeur (ex: mon@email.com)" className={inp} value={contactForm.value}
                  onChange={e => setContactForm({ ...contactForm, value: e.target.value })} />
                <input placeholder="Icône emoji (ex: 📧)" className={inp} value={contactForm.icon}
                  onChange={e => setContactForm({ ...contactForm, icon: e.target.value })} />
                <input placeholder="URL (ex: mailto:... ou https://...)" className={inp} value={contactForm.url}
                  onChange={e => setContactForm({ ...contactForm, url: e.target.value })} />
                <div className="flex gap-3">
                  <button onClick={handleContactSubmit} className={btnBlue + ' flex-1 py-2'}>
                    {editingContactIdx !== null ? '💾 Modifier' : '➕ Ajouter'}
                  </button>
                  {editingContactIdx !== null && (
                    <button onClick={() => { setEditingContactIdx(null); setContactForm({ label: '', value: '', icon: '', url: '' }); }}
                      className={btnGray}>Annuler</button>
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">📋 ({contacts.length})</h3>
                <button onClick={handleSaveContacts} className={btnBlue}>💾 Sauvegarder</button>
              </div>
              <div className="space-y-3">
                {contacts.map((c, i) => (
                  <div key={i} className="bg-slate-800 p-4 rounded-xl flex justify-between items-center gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-400">{getIcon(c.label)}</span>
                      <div>
                        <p className="font-semibold text-sm">{c.label}</p>
                        <p className="text-slate-400 text-xs">{c.value}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => { setContactForm(c); setEditingContactIdx(i); }} className={btnGray}>✏️</button>
                      <button onClick={() => setContacts(contacts.filter((_, j) => j !== i))} className={btnRed}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;