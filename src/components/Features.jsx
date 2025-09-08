import React from 'react';
import { Users, Briefcase, ShieldCheck } from 'lucide-react';
import Container from './Container';
import FeatureCard from './FeatureCard';


const featuresData = [
  {
    icon: Users,
    title: "Employee Management",
    description: "Centralized profiles, onboarding, leave, and attendance in one place."
  },
  {
    icon: Briefcase,
    title: "Recruitment & Onboarding",
    description: "Streamline hiring with integrated job postings, applications, and onboarding flows."
  },
  {
    icon: ShieldCheck,
    title: "Compliance & Security",
    description: "Enterprise-grade security, SSO, audit logs, and compliance with global standards."
  }
];

const Features = () => (
  <section id="features" className="py-20 bg-white">
    <Container>
      <h2 className="text-3xl font-bold text-center">Powerful Features</h2>
      <p className="mt-2 text-center text-sm opacity-70 max-w-2xl mx-auto">
        Designed for enterprises that need performance, compliance, and scalability.
      </p>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {featuresData.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </Container>
  </section>
);

export default Features;

