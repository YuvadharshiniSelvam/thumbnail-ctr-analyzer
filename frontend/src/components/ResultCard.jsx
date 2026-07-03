import React from 'react';

export default function ResultCard({ prediction, confidence }) {
  if (!prediction) return null;

  const getPredictionColor = (prediction) => {
    switch (prediction?.toLowerCase()) {
      case 'high': return 'from-emerald-500 to-emerald-400 text-emerald-400 border-emerald-500/30 shadow-[0_0_30px_rgba(52,211,153,0.3)]';
      case 'medium': return 'from-yellow-500 to-yellow-400 text-yellow-400 border-yellow-500/30 shadow-[0_0_30px_rgba(250,204,21,0.3)]';
      case 'low': return 'from-red-500 to-red-400 text-red-400 border-red-500/30 shadow-[0_0_30px_rgba(248,113,113,0.3)]';
      default: return 'from-gray-500 to-gray-400 text-gray-400 border-gray-500/30';
    }
  };

  const colorClass = getPredictionColor(prediction);

  return (
    <div className={`bg-brand-card/80 p-8 rounded-3xl border backdrop-blur-md relative overflow-hidden group ${colorClass}`}>
      <div className="absolute inset-0 bg-gradient-to-br opacity-5 pointer-events-none transition-opacity duration-500 group-hover:opacity-10"></div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div>
          <h2 className="text-gray-400 text-sm font-display tracking-widest uppercase mb-2">Predicted CTR Performance</h2>
          <div className={`text-5xl font-display font-extrabold uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r ${colorClass.split(' text-')[0]}`}>
            {prediction}
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="text-gray-400 text-sm font-display tracking-widest uppercase mb-2">Confidence Score</div>
          <div className="text-4xl font-light text-white">
            {(confidence > 1 ? confidence : confidence * 100).toFixed(1)}<span className="text-xl text-gray-500 ml-1">%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
