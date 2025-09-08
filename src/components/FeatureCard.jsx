import React from 'react';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="rounded-xl border p-6 text-center">
    <Icon className="h-8 w-8 text-blue-600 mx-auto" />
    <h3 className="mt-4 font-semibold">{title}</h3>
    <p className="mt-2 text-sm opacity-70">{description}</p>
  </div>
);

export default FeatureCard;