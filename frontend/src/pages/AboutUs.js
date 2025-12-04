import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Users, Target, Award, TrendingUp, Heart } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">About ReBox</h1>
          <p className="hero-subtitle">
            We're on a mission to revolutionize packaging recycling and create a sustainable future, one box at a time.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section">
        <div className="container">
          <div className="content-grid">
            <div className="content-text">
              <h2 className="section-title">Our Mission</h2>
              <p className="text-lg">
                ReBox was founded on a simple belief: packaging shouldn't end up in landfills when it can have a second life. 
                We've built a platform that connects individuals, businesses, and recyclers to create a circular economy for packaging materials.
              </p>
              <p className="text-lg mt-4">
                Every year, millions of tons of perfectly reusable packaging waste ends up in landfills. We're changing that 
                by making it easy, rewarding, and impactful to give your packaging a second chance.
              </p>
            </div>
            <div className="stats-card">
              <div className="stat-item">
                <div className="stat-icon">
                  <Leaf size={32} />
                </div>
                <div>
                  <div className="stat-value">50K+</div>
                  <div className="stat-label">Packages Recycled</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">
                  <Users size={32} />
                </div>
                <div>
                  <div className="stat-value">10K+</div>
                  <div className="stat-label">Active Users</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">
                  <TrendingUp size={32} />
                </div>
                <div>
                  <div className="stat-value">125 tons</div>
                  <div className="stat-label">CO₂ Saved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section bg-gray">
        <div className="container">
          <h2 className="section-title text-center mb-12">Our Core Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <Target className="value-icon" size={40} />
              <h3>Impact First</h3>
              <p>Every decision we make prioritizes environmental impact and sustainability.</p>
            </div>
            <div className="value-card">
              <Heart className="value-icon" size={40} />
              <h3>Community Driven</h3>
              <p>We believe in the power of collective action to create meaningful change.</p>
            </div>
            <div className="value-card">
              <Award className="value-icon" size={40} />
              <h3>Quality & Trust</h3>
              <p>We're committed to transparency, reliability, and excellence in everything we do.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section">
        <div className="container">
          <div className="story-content">
            <h2 className="section-title">Our Story</h2>
            <p className="text-lg">
              ReBox started in 2024 when our founders realized the massive environmental impact of packaging waste. 
              After witnessing countless reusable boxes being thrown away, they envisioned a platform where packaging 
              could easily find its way to people who need it.
            </p>
            <p className="text-lg mt-4">
              What began as a simple idea has grown into a thriving marketplace connecting thousands of people who share 
              our vision of a sustainable future. Today, ReBox is helping reduce landfill waste, lower carbon emissions, 
              and create a circular economy for packaging materials.
            </p>
            <p className="text-lg mt-4">
              We're proud of how far we've come, but we're even more excited about where we're going. Join us in our 
              mission to make packaging recycling simple, rewarding, and impactful for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Make a Difference?</h2>
            <p>Join thousands of people who are already making an impact with ReBox.</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started Today
              </Link>
              <Link to="/contact" className="btn btn-secondary btn-lg">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .about-page {
          min-height: 100vh;
        }

        .hero-section {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          padding: 80px 20px;
          text-align: center;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          max-width: 700px;
          margin: 0 auto;
          opacity: 0.95;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .section {
          padding: 80px 20px;
        }

        .section.bg-gray {
          background: #f9fafb;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 2rem;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .content-text {
          color: #4b5563;
        }

        .text-lg {
          font-size: 1.125rem;
          line-height: 1.75;
        }

        .stats-card {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          padding: 40px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .stat-icon {
          background: white;
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #10B981;
          flex-shrink: 0;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: #059669;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #047857;
          font-weight: 600;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        .value-card {
          background: white;
          padding: 40px;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .value-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .value-icon {
          color: #10B981;
          margin-bottom: 20px;
        }

        .value-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 12px;
        }

        .value-card p {
          color: #6b7280;
          line-height: 1.6;
        }

        .story-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .cta-section {
          background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
          color: white;
          padding: 80px 20px;
          text-align: center;
        }

        .cta-content h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .cta-content p {
          font-size: 1.25rem;
          opacity: 0.9;
          margin-bottom: 2rem;
        }

        .cta-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-lg {
          padding: 16px 40px;
          font-size: 1.125rem;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .content-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .values-grid {
            grid-template-columns: 1fr;
          }

          .section-title {
            font-size: 2rem;
          }

          .cta-content h2 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutUs;
