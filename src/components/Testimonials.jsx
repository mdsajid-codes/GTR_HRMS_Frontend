import React from 'react';
import Container from './Container';
import TestimonialCard from './TestimonialCard';

const testimonialsData = [
    {
        quote: "“Enterprise HRMS streamlined our HR operations and improved employee satisfaction.”",
        author: "Customer 1",
        role: "CTO",
        company: "Example Corp"
    },
    {
        quote: "“The compliance features are top-notch and give us peace of mind.”",
        author: "Customer 2",
        role: "HR Director",
        company: "Innovate Inc."
    },
    {
        quote: "“Scalable, secure, and incredibly easy to use. A must-have for any large organization.”",
        author: "Customer 3",
        role: "CEO",
        company: "Global Solutions"
    }
]

const Testimonials = () => (
  <section className="py-20 bg-white">
    <Container>
      <h2 className="text-3xl font-bold text-center">Trusted by Industry Leaders</h2>
      <p className="mt-2 text-center text-sm opacity-70 max-w-2xl mx-auto">
        Our HRMS powers companies of all sizes, from startups to Fortune 500s.
      </p>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {testimonialsData.map((testimonial, i) => (
          <TestimonialCard key={i} {...testimonial} />
        ))}
      </div>
    </Container>
  </section>
);

export default Testimonials;

