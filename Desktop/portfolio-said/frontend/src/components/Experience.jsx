import { useState, useEffect } from 'react';
import { getProfile } from '../services/api';

// ===== MODAL IMAGES =====
const ImageModal = ({ images, title, onClose }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const prev = (e) => { e.stopPropagation(); setCurrent(i => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setCurrent(i => (i + 1) % images.length); };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-700">
          <h3 className="text-white font-bold text-base">{title}</h3>
          <button onClick={onClose}
            className="text-slate-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-colors text-xl">
            ✕
          </button>
        </div>

        {/* Image principale */}
        <div className="relative bg-slate-900 select-none">
          <img src={images[current].url} alt={`${title} - ${current + 1}`}
            className="w-full h-80 object-contain" />
          {images.length > 1 && (
            <>
              <button onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors">
                ‹
              </button>
              <button onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors">
                ›
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <button key={i} onClick={e => { e.stopPropagation(); setCurrent(i); }}
                    className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white scale-125' : 'bg-white/40'}`} />
                ))}
              </div>
              <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                {current + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {/* Miniatures */}
        {images.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto bg-slate-900/50">
            {images.map((img, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${i === current ? 'border-blue-400' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                <img src={img.url} alt={`miniature ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ===== COMPOSANT PRINCIPAL =====
const Experience = () => {
  const [experiences, setExperiences] = useState([]);
  const [formations, setFormations] = useState([]);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    getProfile().then(res => {
      setExperiences(res.data.experiences || []);
      setFormations(res.data.formations || []);
    }).catch(console.error);
  }, []);

  return (
    <section id="expérience" className="py-20 bg-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          Expériences & <span className="text-blue-400">Formations</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-12">

          {/* Expériences */}
          <div>
            <h3 className="text-xl font-semibold text-blue-400 mb-6">💼 Expériences</h3>
            <div className="space-y-6">
              {experiences.map((exp, i) => {
                const imgs = exp.images && exp.images.length > 0 ? exp.images : [];
                return (
                  <div key={i} className="border-l-2 border-blue-400 pl-6 relative">
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-blue-400"></div>
                    <p className="text-blue-300 text-sm">{exp.period}</p>
                    <h4 className="text-white font-bold">{exp.title}</h4>
                    <p className="text-slate-400 text-sm">{exp.company} · {exp.location}</p>
                    <p className="text-slate-300 text-sm mt-2">{exp.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(exp.tech || []).map(t => (
                        <span key={t} className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-xs">{t}</span>
                      ))}
                    </div>
                    {/* Bouton "Voir les captures" si images présentes */}
                    {imgs.length > 0 && (
                      <button
                        onClick={() => setModalData({ images: imgs, title: `${exp.title} — ${exp.company}` })}
                        className="mt-3 inline-flex items-center gap-2 bg-blue-400/10 hover:bg-blue-400/20 border border-blue-400/30 hover:border-blue-400/60 text-blue-400 hover:text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all">
                        🖼️ Voir {imgs.length > 1 ? `les ${imgs.length} captures` : 'la capture'} →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Formations */}
          <div>
            <h3 className="text-xl font-semibold text-blue-400 mb-6">🎓 Formations</h3>
            <div className="space-y-6">
              {formations.map((form, i) => (
                <div key={i} className="border-l-2 border-slate-500 pl-6 relative">
                  <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-slate-500"></div>
                  <p className="text-slate-400 text-sm">{form.period}</p>
                  <h4 className="text-white font-bold">{form.title}</h4>
                  <p className="text-blue-300 text-sm">{form.school} – {form.location}</p>
                  <p className="text-slate-400 text-sm mt-1">{form.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal images */}
      {modalData && (
        <ImageModal
          images={modalData.images}
          title={modalData.title}
          onClose={() => setModalData(null)}
        />
      )}
    </section>
  );
};

export default Experience;