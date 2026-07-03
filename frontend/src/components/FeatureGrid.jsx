import React from 'react';

export default function FeatureGrid({ features }) {
  if (!features) return null;

  const featureCards = [
    { label: "Aesthetic Score", value: features.aesthetic_score, desc: "AI-assessed visual quality, layout style, and design appeal (0-100%)." },
    ...(features.alignment_score !== undefined && features.alignment_score !== null && features.alignment_score !== 0 ? [
      { label: "Title Alignment", value: features.alignment_score, desc: "Semantic relevance and context matching between the video title and thumbnail." }
    ] : []),
    { label: "Brightness", value: features.brightness, desc: "Relative luminosity calculated across the image frame." },
    { label: "Face Detected", value: !!features.face_detected, desc: "Boolean flag indicating presence of human facial features." },
    { label: "Contrast", value: features.contrast, desc: "Difference in intensity between the lightest and darkest pixels." },
    { label: "Mean Saturation", value: features.saturation || 0, desc: "Average vibrance and colorfulness across the image." },
    { label: "Color Richness", value: features.color_richness, desc: "Quantitative measurement of unique dominant colors." },
    { label: "Text Present", value: !!features.text_present, desc: "Detection status for alphanumeric character blocks." },
  ];

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-xl font-display uppercase tracking-widest text-white mb-6">Feature Analysis</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featureCards.map((feat, idx) => (
          <div key={idx} className="bg-brand-card/50 p-6 rounded-2xl border border-white/5 backdrop-blur-sm hover:border-brand-blue/30 hover:bg-brand-card/80 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-display tracking-widest uppercase text-gray-400 group-hover:text-brand-blue transition-colors">
                {feat.label}
              </span>
              <span className={`text-2xl font-light ${typeof feat.value === 'boolean' ? (feat.value ? 'text-emerald-400' : 'text-gray-500') : 'text-white'}`}>
                {typeof feat.value === 'number' 
                  ? (feat.value % 1 !== 0 ? feat.value.toFixed(2) : feat.value)
                  : (typeof feat.value === 'boolean' ? (feat.value ? 'YES' : 'NO') : feat.value)
                }
              </span>
            </div>
            <div className="h-1 w-full bg-brand-dark rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-blue/50 rounded-full group-hover:bg-brand-blue transition-colors duration-500"
                style={{ width: typeof feat.value === 'number' && feat.value <= 100 ? `${feat.value}%` : '100%' }}
              ></div>
            </div>
            <p className="mt-4 text-xs font-light text-gray-500 leading-relaxed">
              {feat.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
