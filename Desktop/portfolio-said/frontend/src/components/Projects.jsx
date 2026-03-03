import { useState, useEffect } from 'react';
import { getProjects } from '../services/api';

// ===== MODAL PROJET avec carrousel =====
const ProjectModal = ({ project, onClose }) => {
  const [currentImg, setCurrentImg] = useState(0);

  // Construire la liste d'images (nouveau format + legacy)
  const images = project.images && project.images.length > 0
    ? project.images.map(i => i.url)
    : project.imageUrl ? [project.imageUrl] : [];

  const prev = (e) => { e.stopPropagation(); setCurrentImg(i => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setCurrentImg(i => (i + 1) % images.length); };

  // Fermer avec Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-white font-bold text-xl">{project.title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-colors"
          >✕</button>
        </div>

        {/* Carrousel images */}
        {images.length > 0 && (
          <div className="relative bg-slate-900 select-none">
            <img
              src={images[currentImg]}
              alt={`${project.title} - ${currentImg + 1}`}
              className="w-full h-72 object-cover"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors"
                >‹</button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors"
                >›</button>

                {/* Points indicateurs */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={e => { e.stopPropagation(); setCurrentImg(i); }}
                      className={`w-2 h-2 rounded-full transition-all ${i === currentImg ? 'bg-white scale-125' : 'bg-white/40'}`}
                    />
                  ))}
                </div>

                {/* Compteur */}
                <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  {currentImg + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        )}

        {/* Miniatures si plusieurs images */}
        {images.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto bg-slate-900/50">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentImg(i)}
                className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${i === currentImg ? 'border-blue-400' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img} alt={`miniature ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Contenu texte */}
        <div className="p-6">
          {project.category && (
            <span className="inline-block bg-blue-600/30 text-blue-300 text-xs px-3 py-1 rounded-full mb-4">
              {project.category}
            </span>
          )}

          {/* Description complète */}
          <p className="text-slate-300 text-sm leading-relaxed mb-6 whitespace-pre-line">
            {project.description}
          </p>

          {/* Technologies */}
          <div className="mb-6">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Technologies</p>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map(tech => (
                <span key={tech} className="bg-blue-600/30 text-blue-300 px-3 py-1 rounded-full text-sm">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Liens */}
          <div className="flex gap-3 pt-4 border-t border-slate-700">
            {project.githubUrl && project.githubUrl !== '#' && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-700 hover:bg-slate-600 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                GitHub →
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Voir le site →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== COMPOSANT PRINCIPAL =====
const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    getProjects()
      .then(res => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const defaultProjects = [
    { _id: '1', title: 'RPG Game en Python', description: 'Jeu RPG en programmation orientée objet, renforçant les compétences en logique algorithmique et structuration du code.', technologies: ['Python', 'POO'], githubUrl: '#', images: [], imageUrl: '' },
    { _id: '2', title: 'Idle Game interactif', description: "Développement d'un Idle Game en JavaScript, HTML et CSS avec gestion d'état dynamique et logique frontend.", technologies: ['JavaScript', 'HTML', 'CSS'], githubUrl: '#', images: [], imageUrl: '' },
    { _id: '3', title: 'Application full stack API REST', description: "Application avec intégration d'API REST (Adzuna) et traitement de données JSON.", technologies: ['Python', 'REST API', 'JSON'], githubUrl: '#', images: [], imageUrl: '' },
  ];

  const displayProjects = projects.length > 0 ? projects : defaultProjects;

  return (
    <section id="projets" className="py-20 bg-slate-900">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          Mes <span className="text-blue-400">Projets</span>
        </h2>

        {loading ? (
          <div className="text-center text-slate-400">Chargement...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProjects.map(project => {
              const images = project.images && project.images.length > 0
                ? project.images : project.imageUrl ? [{ url: project.imageUrl }] : [];
              const firstImage = images.length > 0 ? images[0].url : '';
              const nbImages = images.length;

              return (
                <div
                  key={project._id}
                  className="bg-slate-800 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-blue-500/20 transition-all hover:-translate-y-1 duration-300 cursor-pointer group"
                  onClick={() => setSelectedProject(project)}
                >
                  {/* IMAGE */}
                  <div className="h-48 overflow-hidden relative">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-slate-700 flex items-center justify-center">
                        <span className="text-5xl">💻</span>
                      </div>
                    )}

                    {/* Overlay "Voir le projet" au survol */}
                    <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/20 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full font-semibold border border-white/30">
                        Voir le projet →
                      </span>
                    </div>

                    {/* Badge nombre d'images */}
                    {nbImages > 1 && (
                      <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        🖼️ {nbImages}
                      </div>
                    )}

                    {/* Badge catégorie */}
                    {project.category && (
                      <span className="absolute top-3 right-3 bg-blue-600/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                        {project.category}
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="text-white font-bold text-lg mb-2">{project.title}</h3>

                    {/* Description tronquée à 2 lignes → modal pour lire tout */}
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{project.description}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.technologies.map(tech => (
                        <span key={tech} className="bg-blue-600/30 text-blue-300 px-2 py-1 rounded text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-700 flex items-center justify-between">
                      <span className="text-blue-400 text-sm font-semibold group-hover:text-blue-300 transition-colors">
                        Voir les détails →
                      </span>
                      {nbImages > 1 && (
                        <span className="text-slate-500 text-xs">{nbImages} captures</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal projet */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </section>
  );
};

export default Projects;