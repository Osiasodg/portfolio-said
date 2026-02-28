const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-slate-900">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Me <span className="text-blue-400">Contacter</span>
        </h2>
        <p className="text-slate-400 mb-10">
          Disponible pour une alternance en Data Analyst / Développeur Data. N'hésitez pas à me contacter.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <a href="mailto:ouedraogoosia4@gmail.com" 
            className="bg-slate-800 p-6 rounded-xl hover:border hover:border-blue-400 transition-all">
            <div className="text-3xl mb-3">📧</div>
            <p className="text-blue-400 font-semibold">Email</p>
            <p className="text-slate-400 text-sm mt-1">ouedraogoosia4@gmail.com</p>
          </a>
          
          <a href="tel:+33782983199" 
            className="bg-slate-800 p-6 rounded-xl hover:border hover:border-blue-400 transition-all">
            <div className="text-3xl mb-3">📱</div>
            <p className="text-blue-400 font-semibold">Téléphone</p>
            <p className="text-slate-400 text-sm mt-1">+33 7 82 98 31 99</p>
          </a>
          
          <a href="https://www.linkedin.com/in/osiasodg" target="_blank" rel="noopener noreferrer"
            className="bg-slate-800 p-6 rounded-xl hover:border hover:border-blue-400 transition-all">
            <div className="text-3xl mb-3">💼</div>
            <p className="text-blue-400 font-semibold">LinkedIn</p>
            <p className="text-slate-400 text-sm mt-1">@Saïd Osias</p>
          </a>
        </div>

        <a href="https://github.com/Osiasodg" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-slate-800 px-6 py-3 rounded-xl hover:border hover:border-blue-400 transition-all text-slate-300">
          <span>🐙</span> GitHub : @Osiasodg
        </a>
      </div>
    </section>
  );
};

export default Contact;