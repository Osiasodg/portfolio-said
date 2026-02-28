const experiences = [
  {
    type: 'work',
    title: 'Stage de perfectionnement',
    company: 'SONAR – Société Nationale d\'Assurance et de Réassurance',
    location: 'Ouagadougou, Burkina Faso',
    period: 'Février 2025 – Mai 2025',
    description: 'Conception d\'une application Laravel full stack pour la gestion des bons d\'achat : structuration MySQL, imports automatisés, génération de rapports.',
    tech: ['Laravel', 'MySQL', 'PHP'],
  },
  {
    type: 'work',
    title: 'Stage de fin de cycle',
    company: 'ONASER – Office National de la Sécurité Routière',
    location: 'Ouagadougou, Burkina Faso',
    period: 'Mars 2024 – Août 2024',
    description: 'Développement d\'une plateforme de suivi des missions en Java/MySQL, maintenance des systèmes et support utilisateurs.',
    tech: ['Java', 'MySQL'],
  },
];

const formations = [
  {
    title: 'Prépa Mastère Digital',
    school: 'HETIC',
    location: 'Montreuil, France',
    period: 'Depuis Octobre 2025',
    description: 'Développement web, analyse de données, marketing digital, UX, projets collaboratifs.',
  },
  {
    title: 'Diplôme d\'ingénieur en informatique',
    school: 'Université Aube Nouvelle',
    location: 'Ouagadougou, Burkina Faso',
    period: '2021 – Décembre 2024',
    description: 'Option technologie du génie informatique.',
  },
];

const Experience = () => {
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
              {experiences.map((exp, i) => (
                <div key={i} className="border-l-2 border-blue-400 pl-6 relative">
                  <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-blue-400"></div>
                  <p className="text-blue-300 text-sm">{exp.period}</p>
                  <h4 className="text-white font-bold">{exp.title}</h4>
                  <p className="text-slate-400 text-sm">{exp.company}</p>
                  <p className="text-slate-300 text-sm mt-2">{exp.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {exp.tech.map(t => (
                      <span key={t} className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-xs">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
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
    </section>
  );
};

export default Experience;