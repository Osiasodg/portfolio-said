import { useState, useEffect } from 'react';
import { getProfile } from '../services/api';

const Hero = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getProfile()
      .then(res => setProfile(res.data))
      .catch(console.error);
  }, []);

  if (!profile) return (
    <section className="min-h-screen flex items-center justify-center bg-slate-900">
      <p className="text-slate-400">Chargement...</p>
    </section>
  );

  const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const cvDownloadUrl = `${API_URL}/api/profile/cv/download`;

  return (
    <section id="accueil" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-16">
      <div className="text-center px-4 max-w-3xl mx-auto">

        {/* Photo de profil */}
        {profile.photoUrl ? (
          <img
            src={`${API_URL}${profile.photoUrl}`}
            alt="Photo de profil"
            className="w-60 h-60 rounded-full object-cover mx-auto mb-6 border-4 border-blue-400"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-blue-500 mx-auto mb-6 flex items-center justify-center text-4xl font-bold text-white">
            {profile.name?.charAt(0) || 'S'}
          </div>
        )}

        <p className="text-blue-400 text-lg mb-2">Bonjour, je suis</p>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          {profile.name}
        </h1>
        <h2 className="text-xl md:text-2xl text-blue-300 mb-6">
          {profile.title}
        </h2>
        <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
          {profile.description}
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <a href="#projets"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Voir mes projets
          </a>
          {profile.cv && (
            <a href={cvDownloadUrl} download
              className="border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-slate-900 px-8 py-3 rounded-lg font-semibold transition-colors">
              Télécharger mon CV
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;