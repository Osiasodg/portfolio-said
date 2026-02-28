const skillsData = [
  { category: 'Langages', items: ['Python', 'SQL', 'Java', 'JavaScript'] },
  { category: 'Bases de données', items: ['MySQL', 'MongoDB'] },
  { category: 'Data & BI', items: ['Pandas', 'Power BI', 'Anaconda'] },
  { category: 'Outils', items: ['Git', 'VS Code', 'Laravel', 'React'] },
  { category: 'Systèmes', items: ['Linux Ubuntu', 'Linux Mint', 'Windows'] },
  { category: 'Langues', items: ['Français C1', 'Anglais B1'] },
];

const Skills = () => {
  return (
    <section id="compétences" className="py-20 bg-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          Mes <span className="text-blue-400">Compétences</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillsData.map(({ category, items }) => (
            <div key={category} className="bg-slate-700 rounded-xl p-6 hover:border hover:border-blue-400 transition-all">
              <h3 className="text-blue-400 font-semibold mb-4">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {items.map(item => (
                  <span key={item} className="bg-slate-600 text-slate-200 px-3 py-1 rounded-full text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;