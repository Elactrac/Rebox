import React from 'react';
import { Download, Mail, ExternalLink } from 'lucide-react';

const Press = () => {
  const pressReleases = [
    {
      date: 'January 15, 2025',
      title: 'ReBox Surpasses 50,000 Packages Recycled Milestone',
      excerpt: 'Platform achieves major environmental milestone, saving over 125 tons of CO₂ emissions through innovative packaging marketplace.',
      link: '#'
    },
    {
      date: 'December 2, 2024',
      title: 'ReBox Secures $5M Series A Funding',
      excerpt: 'Investment led by GreenTech Ventures will accelerate platform expansion and recycler network growth across major U.S. cities.',
      link: '#'
    },
    {
      date: 'October 20, 2024',
      title: 'Partnership with Major Retailers Announced',
      excerpt: 'ReBox partners with leading e-commerce platforms to offer sustainable packaging solutions at scale.',
      link: '#'
    },
    {
      date: 'September 5, 2024',
      title: 'ReBox Launches Rewards Program',
      excerpt: 'New incentive system encourages sustainable behavior by rewarding users for every package recycled through the platform.',
      link: '#'
    }
  ];

  const coverage = [
    {
      outlet: 'TechCrunch',
      title: 'How ReBox is Revolutionizing Packaging Waste',
      date: 'Jan 2025',
      link: '#'
    },
    {
      outlet: 'Forbes',
      title: 'Top 10 Sustainability Startups to Watch',
      date: 'Dec 2024',
      link: '#'
    },
    {
      outlet: 'Fast Company',
      title: 'The Circular Economy Comes to Packaging',
      date: 'Nov 2024',
      link: '#'
    },
    {
      outlet: 'VentureBeat',
      title: 'ReBox Makes Recycling Profitable',
      date: 'Oct 2024',
      link: '#'
    }
  ];

  const stats = [
    { number: '50,000+', label: 'Packages Recycled' },
    { number: '10,000+', label: 'Active Users' },
    { number: '125 tons', label: 'CO₂ Saved' },
    { number: '500+', label: 'Recycler Partners' }
  ];

  return (
    <div className="press-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">Press & Media</h1>
          <p className="hero-subtitle">
            News, updates, and resources for journalists and media professionals
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Press Releases</h2>
          <div className="press-releases">
            {pressReleases.map((release, index) => (
              <div key={index} className="release-card">
                <div className="release-date">{release.date}</div>
                <h3 className="release-title">{release.title}</h3>
                <p className="release-excerpt">{release.excerpt}</p>
                <a href={release.link} className="read-more">
                  Read Full Release <ExternalLink size={16} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Coverage */}
      <section className="section coverage-section">
        <div className="container">
          <h2 className="section-title">In the News</h2>
          <div className="coverage-grid">
            {coverage.map((item, index) => (
              <a key={index} href={item.link} className="coverage-card">
                <div className="coverage-outlet">{item.outlet}</div>
                <h3 className="coverage-title">{item.title}</h3>
                <div className="coverage-date">{item.date}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Media Kit */}
      <section className="section kit-section">
        <div className="container">
          <div className="kit-content">
            <h2 className="section-title">Media Kit</h2>
            <p className="kit-description">
              Download our brand assets, logos, and company information for use in your publications
            </p>
            <div className="kit-items">
              <div className="kit-item">
                <h3>Brand Guidelines</h3>
                <p>Logo usage, colors, typography, and brand voice</p>
                <button className="download-btn">
                  <Download size={18} />
                  Download PDF
                </button>
              </div>
              <div className="kit-item">
                <h3>Company Fact Sheet</h3>
                <p>Key facts, statistics, and company overview</p>
                <button className="download-btn">
                  <Download size={18} />
                  Download PDF
                </button>
              </div>
              <div className="kit-item">
                <h3>Logo Assets</h3>
                <p>High-resolution logos in various formats</p>
                <button className="download-btn">
                  <Download size={18} />
                  Download ZIP
                </button>
              </div>
              <div className="kit-item">
                <h3>Product Screenshots</h3>
                <p>Platform screenshots and product images</p>
                <button className="download-btn">
                  <Download size={18} />
                  Download ZIP
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="section contact-section">
        <div className="container">
          <div className="contact-content">
            <h2>Media Inquiries</h2>
            <p>For press inquiries, interviews, or additional information, please contact our media team:</p>
            <div className="contact-info">
              <Mail size={24} />
              <div>
                <strong>press@rebox.com</strong>
                <p>We typically respond within 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .press-page {
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

        .section-title {
          font-size: 2.5rem;
          font-weight: 800;
          text-align: center;
          margin-bottom: 3rem;
          color: #111827;
        }

        .stats-section {
          background: #f9fafb;
          padding: 60px 20px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 30px;
        }

        .stat-card {
          text-align: center;
        }

        .stat-number {
          font-size: 3rem;
          font-weight: 800;
          color: #10B981;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 1rem;
          color: #6b7280;
          font-weight: 600;
        }

        .press-releases {
          display: flex;
          flex-direction: column;
          gap: 30px;
          max-width: 900px;
          margin: 0 auto;
        }

        .release-card {
          background: white;
          padding: 30px;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          transition: all 0.3s;
        }

        .release-card:hover {
          border-color: #10B981;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .release-date {
          color: #10B981;
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: 0.75rem;
        }

        .release-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.75rem;
        }

        .release-excerpt {
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .read-more {
          color: #10B981;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          transition: gap 0.3s;
        }

        .read-more:hover {
          gap: 10px;
        }

        .coverage-section {
          background: #f9fafb;
        }

        .coverage-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 25px;
        }

        .coverage-card {
          background: white;
          padding: 25px;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          text-decoration: none;
          transition: all 0.3s;
          display: block;
        }

        .coverage-card:hover {
          border-color: #10B981;
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }

        .coverage-outlet {
          font-size: 0.875rem;
          font-weight: 700;
          color: #10B981;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }

        .coverage-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }

        .coverage-date {
          color: #9ca3af;
          font-size: 0.875rem;
        }

        .kit-section {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        }

        .kit-content {
          max-width: 900px;
          margin: 0 auto;
        }

        .kit-description {
          text-align: center;
          color: #6b7280;
          font-size: 1.125rem;
          margin-bottom: 3rem;
        }

        .kit-items {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
        }

        .kit-item {
          background: white;
          padding: 25px;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
        }

        .kit-item h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .kit-item p {
          color: #6b7280;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .download-btn {
          background: #10B981;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          justify-content: center;
          transition: background 0.3s;
        }

        .download-btn:hover {
          background: #059669;
        }

        .contact-section {
          background: white;
        }

        .contact-content {
          max-width: 700px;
          margin: 0 auto;
          text-align: center;
        }

        .contact-content h2 {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 1rem;
        }

        .contact-content > p {
          color: #6b7280;
          font-size: 1.125rem;
          margin-bottom: 2rem;
        }

        .contact-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          background: #f9fafb;
          padding: 30px;
          border-radius: 12px;
        }

        .contact-info svg {
          color: #10B981;
          flex-shrink: 0;
        }

        .contact-info div {
          text-align: left;
        }

        .contact-info strong {
          color: #111827;
          font-size: 1.125rem;
          display: block;
          margin-bottom: 0.25rem;
        }

        .contact-info p {
          color: #6b7280;
          margin: 0;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stat-number {
            font-size: 2rem;
          }

          .kit-items {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Press;
