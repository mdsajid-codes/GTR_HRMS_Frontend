import React from 'react';

const TestimonialCard = ({ quote, author, role, company }) => (
  <div className="rounded-xl border p-6 text-center shadow-sm">
    <p className="text-sm italic">{quote}</p>
    <div className="mt-4 font-semibold">{author}</div>
    <div className="text-xs opacity-60">{role}, {company}</div>
  </div>
);

export default TestimonialCard;