import React from 'react';

const Features = () => {
  const features = [
    {
      emoji: '🎨',
      title: 'Interactive Color Mixing',
      description: 'Experience real-time color mixing with three primary colors (RGB) in an intuitive visual interface.',
    },
    {
      emoji: '🎯',
      title: 'Precise Control',
      description: 'Fine-tune brightness with responsive sliders for each primary color.',
    },
    {
      emoji: '🔍',
      title: 'Real-time RGB Values',
      description: 'Hover anywhere to see exact RGB color values, perfect for learning and design work.',
    },
    {
      emoji: '🎓',
      title: 'Educational Tool',
      description: 'Perfect for students, designers, and anyone interested in understanding color theory.',
    },
    {
      emoji: '⚡',
      title: 'Instant Response',
      description: 'Experience smooth, lag-free color transitions with <100ms response time.',
    },
    {
      emoji: '💡',
      title: 'Natural Light Simulation',
      description: 'Realistic light blending with smooth gradients and natural edge falloff effects.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-12 text-white">
        ✨ Features & Capabilities
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-6 rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
          >
            <div className="text-4xl mb-4">{feature.emoji}</div>
            <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
            <p className="text-gray-300">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
