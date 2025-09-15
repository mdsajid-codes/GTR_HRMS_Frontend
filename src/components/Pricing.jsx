import React from 'react';
import Container from './Container';
import PricingCard from './PricingCard';

const pricingData = [
  {
    name: "Starter",
    price: "₹1999",
    period: "month",
    features: ["Core HR", "Employee Management", "Basic Reporting", "Up to 50 Employees", "Email Support"]
  },
  {
    name: "Standard",
    price: "₹3999",
    period: "month",
    highlighted: true,
    features: ["All Starter Features", "Attendance & Leave Mgt.", "Role-Based Access", "Up to 150 Employees", "Priority Email Support"]
  },
  {
    name: "Premium",
    price: "₹7999",
    period: "month",
    features: ["All Standard Features", "Payroll Management", "Advanced Reporting", "Up to 500 Employees", "Phone & Email Support"]
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact",
    features: ["All Premium Features", "Recruitment Module", "Dedicated DB & Support", "SSO & Audit Logs", "Unlimited Employees"]
  },
];

const Pricing = () => (
  <section id="pricing" className="py-20">
    <Container>
      <h2 className="text-3xl font-bold text-center">Flexible Pricing</h2>
      <p className="mt-3 text-sm text-center opacity-70">Transparent plans built for startups, SMEs, and global enterprises.</p>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {pricingData.map((p) => (
          <PricingCard key={p.name} {...p} />
        ))}
      </div>
    </Container>
  </section>
);

export default Pricing;
