import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import Button from './Button';

const PricingCard = ({ name, price, period, features, highlighted }) => (
  <div className={`rounded-xl border p-8 flex flex-col ${highlighted ? "bg-blue-600 text-white border-blue-600" : "bg-white"}`}>
    <div className="flex items-center justify-between">
      <h3 className="text-xl font-semibold">{name}</h3>
      {highlighted && <span className="rounded-full bg-white/20 px-3 py-1 text-xs">Popular</span>}
    </div>
    {price === 'Custom' ? (
      <div className="mt-6 text-4xl font-bold">Contact Us</div>
    ) : (
      <div className="mt-6 flex items-end gap-1">
        <div className="text-4xl font-bold">{price}</div>
        <div className={`mb-1 text-sm ${highlighted ? "opacity-80" : "opacity-60"}`}>/{period}</div>
      </div>
    )}
    <ul className="mt-6 space-y-2 text-sm">
      {features.map((f, i) => (
        <li key={i} className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {f}
        </li>
      ))}
    </ul>
    <Button className="mt-8" variant={highlighted ? "ghost" : "solid"}>Buy Plan</Button>
  </div>
);

export default PricingCard;