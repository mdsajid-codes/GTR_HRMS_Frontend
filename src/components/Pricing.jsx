import React from 'react';
import Container from './Container';
import PricingCard from './PricingCard';

const pricingData = [
  { name: "Starter", price: "₹1999", period: "month", features: ["Up to 25 employees", "Basic Payroll", "Email support"] },
  { name: "Growth", price: "₹5999", period: "month", highlighted: true, features: ["Up to 200 employees", "Multi-tenant Admin", "Recruitment"] },
  { name: "Enterprise", price: "Custom", period: "mo", features: ["Unlimited employees", "Dedicated DB", "SSO & Audit logs"] },
];

const Pricing = () => (
  <section id="pricing" className="py-20">
    <Container>
      <h2 className="text-3xl font-bold text-center">Flexible Pricing</h2>
      <p className="mt-3 text-sm text-center opacity-70">Transparent plans built for startups, SMEs, and global enterprises.</p>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {pricingData.map((p) => (
          <PricingCard key={p.name} {...p} />
        ))}
      </div>
    </Container>
  </section>
);

export default Pricing;

