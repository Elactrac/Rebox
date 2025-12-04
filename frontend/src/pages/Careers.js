import React from 'react';
import { MapPin, Briefcase, Clock, ChevronRight } from 'lucide-react';

const Careers = () => {
  const openings = [
    {
      title: 'Senior Full Stack Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA / Remote',
      type: 'Full-time',
      description: 'Build scalable features for our marketplace platform. Work with React, Node.js, and PostgreSQL.'
    },
    {
      title: 'Product Designer',
      department: 'Design',
      location: 'San Francisco, CA / Remote',
      type: 'Full-time',
      description: 'Design intuitive user experiences for our web and mobile apps. Champion sustainability through design.'
    },
    {
      title: 'Sustainability Operations Manager',
      department: 'Operations',
      location: 'San Francisco, CA',
      type: 'Full-time',
      description: 'Manage recycler partnerships and optimize pickup logistics. Drive environmental impact initiatives.'
    },
    {
      title: 'Business Development Representative',
      department: 'Sales',
      location: 'Remote',
      type: 'Full-time',
      description: 'Help businesses discover ReBox. Build relationships and drive sustainable packaging adoption.'
    },
    {
      title: 'Customer Success Specialist',
      department: 'Support',
      location: 'Remote',
      type: 'Full-time',
      description: 'Be the voice of our customers. Solve problems and ensure amazing experiences on our platform.'
    },
    {
      title: 'Marketing Content Strategist',
      department: 'Marketing',
      location: 'Remote',
      type: 'Full-time',
      description: 'Tell our sustainability story. Create compelling content that educates and inspires action.'
    }
  ];

  const benefits = [
    {
      icon: '🌍',
      title: 'Environmental Impact',
      description: 'Work on a mission that matters. Your work directly contributes to reducing waste and carbon emissions.'
    },
    {
      icon: '💰',
      title: 'Competitive Salary',
      description: 'Fair compensation with equity options. We value your talent and reward your contributions.'
    },
    {
      icon: '🏥',
      title: 'Health & Wellness',
      description: 'Comprehensive health, dental, and vision insurance. Mental health support and wellness stipends.'
    },
    {
      icon: '🏠',
      title: 'Remote Flexibility',
      description: 'Work from anywhere. We support async collaboration and flexible schedules.'
    },
    {
      icon: '📚',
      title: 'Learning & Growth',
      description: '$2,000 annual learning budget. Attend conferences, take courses, and grow your skills.'
    },
    {
      icon: '🎉',
      title: 'Team Culture',
      description: 'Quarterly offsites, virtual hangouts, and a supportive team that celebrates wins together.'
    }
  ];

  const values = [
    {
      title: 'Impact First',
      description: 'Every decision considers environmental impact. We measure success by waste diverted and communities helped.'
    },
    {
      title: 'Bias for Action',
      description: 'We move fast and iterate. Small improvements compound. Ship early, learn quickly, improve constantly.'
    },
    {
      title: 'Radical Transparency',
      description: 'Open communication builds trust. We share wins, losses, and learnings openly with the team.'
    },
    {
      title: 'User Obsession',
      description: 'Our users are at the heart of everything. We listen, empathize, and build for their success.'
    }
  ];

  return (
    <div className="careers-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">Join Us in Building a Sustainable Future</h1>
          <p className="hero-subtitle">
            Work with a mission-driven team making recycling accessible, rewarding, and impactful
          </p>
          <a href="#openings" className="btn btn-primary">
            View Open Positions
          </a>
        </div>
      </section>

      {/* Why ReBox */}
      <section className="section why-section">
        <div className="container">
          <h2 className="section-title">Why Work at ReBox?</h2>
          <p className="section-subtitle">
            We're not just building software—we're transforming how the world thinks about packaging
          </p>
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <div className="benefit-icon">{benefit.icon}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="section values-section">
        <div className="container">
          <h2 className="section-title">Our Values</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="openings" className="section openings-section">
        <div className="container">
          <h2 className="section-title">Open Positions</h2>
          <p className="section-subtitle">
            Join our growing team. All roles offer competitive pay, equity, and the chance to make real impact.
          </p>
          <div className="openings-list">
            {openings.map((job, index) => (
              <div key={index} className="job-card">
                <div className="job-header">
                  <div>
                    <h3 className="job-title">{job.title}</h3>
                    <div className="job-meta">
                      <span className="meta-item">
                        <Briefcase size={16} />
                        {job.department}
                      </span>
                      <span className="meta-item">
                        <MapPin size={16} />
                        {job.location}
                      </span>
                      <span className="meta-item">
                        <Clock size={16} />
                        {job.type}
                      </span>
                    </div>
                  </div>
                  <button className="apply-btn">
                    Apply <ChevronRight size={18} />
                  </button>
                </div>
                <p className="job-description">{job.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Don't see the right role?</h2>
            <p>We're always looking for talented people who share our mission. Send us your resume!</p>
            <a href="mailto:careers@rebox.com" className="btn btn-primary">
              Get in Touch
            </a>
          </div>
        </div>
      </section>

      <style>{`
        .careers-page {
          min-height: 100vh;
        }

        .hero-section {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          padding: 100px 20px;
          text-align: center;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 1rem;
          max-width: 900px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          max-width: 700px;
          margin: 0 auto 2rem;
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
          margin-bottom: 1rem;
          color: #111827;
        }

        .section-subtitle {
          text-align: center;
          color: #6b7280;
          font-size: 1.125rem;
          margin-bottom: 3rem;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-top: 50px;
        }

        .benefit-card {
          background: white;
          padding: 30px;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          transition: all 0.3s;
        }

        .benefit-card:hover {
          border-color: #10B981;
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }

        .benefit-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .benefit-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #111827;
        }

        .benefit-card p {
          color: #6b7280;
          line-height: 1.6;
        }

        .values-section {
          background: #f9fafb;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
        }

        .value-card {
          background: white;
          padding: 30px;
          border-radius: 12px;
          border-left: 4px solid #10B981;
        }

        .value-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.75rem;
        }

        .value-card p {
          color: #6b7280;
          line-height: 1.6;
        }

        .openings-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .job-card {
          background: white;
          padding: 30px;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          transition: all 0.3s;
        }

        .job-card:hover {
          border-color: #10B981;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 20px;
          margin-bottom: 1rem;
        }

        .job-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.75rem;
        }

        .job-meta {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .job-description {
          color: #4b5563;
          line-height: 1.6;
        }

        .apply-btn {
          background: #10B981;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          transition: all 0.3s;
        }

        .apply-btn:hover {
          background: #059669;
          transform: translateX(5px);
        }

        .cta-section {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        }

        .cta-content {
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
        }

        .cta-content h2 {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 1rem;
        }

        .cta-content p {
          color: #6b7280;
          font-size: 1.125rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .job-header {
            flex-direction: column;
          }

          .apply-btn {
            width: 100%;
            justify-content: center;
          }

          .benefits-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Careers;
