import { useState, useEffect } from 'react';
import { getProjects } from '../services/api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects()
      .then(res => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Projets par défaut (depuis ton CV)
  const defaultProjects = [
    {
      _id: '1',
      title: 'RPG Game en Python',
      description: 'Jeu RPG en programmation orientée objet, renforçant les compétences en logique algorithmique et structuration du code.',
      technologies: ['Python', 'POO'],
      githubUrl: '#',
    },
    {
      _id: '2',
      title: 'Idle Game interactif',
      description: 'Développement d\'un Idle Game en JavaScript, HTML et CSS avec gestion d\'état dynamique et logique frontend.',
      technologies: ['JavaScript', 'HTML', 'CSS'],
      githubUrl: '#',
    },
    {
      _id: '3',
      title: 'Application full stack API REST',
      description: 'Application avec intégration d\'API REST (Adzuna) et traitement de données JSON.',
      technologies: ['Python', 'REST API', 'JSON'],
      githubUrl: '#',
    },
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
            {displayProjects.map(project => (
              <div key={project._id} className="bg-slate-800 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-blue-500/20 transition-all">
                <div className="h-48 bg-gradient-to-br from-blue-600 to-slate-700 flex items-center justify-center">
                  <span className="text-4xl">💻</span>
                </div>
                <div className="p-6">
                  <h3 className="text-white font-bold text-lg mb-2">{project.title}</h3>
                  <p className="text-slate-400 text-sm mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map(tech => (
                      <span key={tech} className="bg-blue-600/30 text-blue-300 px-2 py-1 rounded text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    {project.githubUrl && project.githubUrl !== '#' && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white text-sm transition-colors">
                        GitHub →
                      </a>
                    )}
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                        Voir le site →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;