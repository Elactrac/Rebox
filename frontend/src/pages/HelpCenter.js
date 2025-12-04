import React, { useState } from 'react';
import { Search, Book, MessageCircle, Mail, Phone, ExternalLink, ChevronRight } from 'lucide-react';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      icon: '📦',
      title: 'Getting Started',
      description: 'Learn the basics of using ReBox',
      articles: [
        { title: 'How to create an account', link: '#' },
        { title: 'Understanding account types', link: '#' },
        { title: 'Setting up your profile', link: '#' },
        { title: 'First steps after signing up', link: '#' }
      ]
    },
    {
      icon: '♻️',
      title: 'Listing & Recycling',
      description: 'Create listings and schedule pickups',
      articles: [
        { title: 'How to list packaging materials', link: '#' },
        { title: 'Scheduling a pickup', link: '#' },
        { title: 'Quality standards for materials', link: '#' },
        { title: 'QR codes and tracking', link: '#' }
      ]
    },
    {
      icon: '🎁',
      title: 'Rewards & Points',
      description: 'Earn and redeem reward points',
      articles: [
        { title: 'How the rewards program works', link: '#' },
        { title: 'Earning points', link: '#' },
        { title: 'Redeeming rewards', link: '#' },
        { title: 'Points expiration policy', link: '#' }
      ]
    },
    {
      icon: '🏢',
      title: 'For Businesses',
      description: 'Business account features and tools',
      articles: [
        { title: 'Business account benefits', link: '#' },
        { title: 'Bulk listings and pickups', link: '#' },
        { title: 'Sustainability reporting', link: '#' },
        { title: 'Enterprise solutions', link: '#' }
      ]
    },
    {
      icon: '🚚',
      title: 'For Recyclers',
      description: 'Recycler verification and operations',
      articles: [
        { title: 'Becoming a verified recycler', link: '#' },
        { title: 'Managing pickup requests', link: '#' },
        { title: 'Payment and invoicing', link: '#' },
        { title: 'Best practices for recyclers', link: '#' }
      ]
    },
    {
      icon: '💰',
      title: 'Payments & Billing',
      description: 'Payment methods and transactions',
      articles: [
        { title: 'Payment methods accepted', link: '#' },
        { title: 'Understanding fees', link: '#' },
        { title: 'Refund policy', link: '#' },
        { title: 'Payment troubleshooting', link: '#' }
      ]
    },
    {
      icon: '🔒',
      title: 'Account & Security',
      description: 'Manage your account and stay secure',
      articles: [
        { title: 'Resetting your password', link: '#' },
        { title: 'Email verification', link: '#' },
        { title: 'Two-factor authentication', link: '#' },
        { title: 'Deleting your account', link: '#' }
      ]
    },
    {
      icon: '📊',
      title: 'Impact Tracking',
      description: 'Monitor your environmental impact',
      articles: [
        { title: 'Understanding your impact dashboard', link: '#' },
        { title: 'CO₂ calculations explained', link: '#' },
        { title: 'Sharing your impact', link: '#' },
        { title: 'Impact certificates', link: '#' }
      ]
    }
  ];

  const supportOptions = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      availability: 'Available Mon-Fri, 9am-6pm PST',
      action: 'Start Chat',
      link: '#'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us an email and we\'ll respond within 24 hours',
      availability: 'support@rebox.com',
      action: 'Send Email',
      link: 'mailto:support@rebox.com'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak with a support representative',
      availability: '+1 (234) 567-890',
      action: 'Call Us',
      link: 'tel:+1234567890'
    }
  ];

  const popularArticles = [
    'How to create an account',
    'Scheduling a pickup',
    'Understanding the rewards program',
    'Resetting your password',
    'Becoming a verified recycler'
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, this would search articles
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="help-center">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">How can we help you?</h1>
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
          <div className="popular-searches">
            <span>Popular:</span>
            {popularArticles.slice(0, 3).map((article, index) => (
              <a key={index} href="#">{article}</a>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section categories-section">
        <div className="container">
          <h2 className="section-title">Browse by Category</h2>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <div key={index} className="category-card">
                <div className="category-icon">{category.icon}</div>
                <h3>{category.title}</h3>
                <p className="category-description">{category.description}</p>
                <ul className="articles-list">
                  {category.articles.map((article, idx) => (
                    <li key={idx}>
                      <a href={article.link}>
                        {article.title}
                        <ChevronRight size={16} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="section support-section">
        <div className="container">
          <h2 className="section-title">Still need help?</h2>
          <p className="section-subtitle">Our support team is here for you</p>
          <div className="support-grid">
            {supportOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <div key={index} className="support-card">
                  <Icon size={40} className="support-icon" />
                  <h3>{option.title}</h3>
                  <p className="support-description">{option.description}</p>
                  <p className="support-availability">{option.availability}</p>
                  <a href={option.link} className="support-btn">
                    {option.action}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="section quick-links-section">
        <div className="container">
          <div className="quick-links-content">
            <div className="quick-link">
              <Book size={24} />
              <div>
                <h3>Documentation</h3>
                <p>Complete guides and API documentation</p>
              </div>
              <ExternalLink size={18} />
            </div>
            <div className="quick-link">
              <MessageCircle size={24} />
              <div>
                <h3>Community Forum</h3>
                <p>Connect with other ReBox users</p>
              </div>
              <ExternalLink size={18} />
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .help-center {
          min-height: 100vh;
        }

        .hero-section {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          padding: 100px 20px 80px;
          text-align: center;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 2rem;
        }

        .search-form {
          max-width: 700px;
          margin: 0 auto 1.5rem;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 15px;
          background: white;
          padding: 18px 24px;
          border-radius: 50px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .search-box svg {
          color: #6b7280;
          flex-shrink: 0;
        }

        .search-box input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 1rem;
          color: #111827;
        }

        .search-box input::placeholder {
          color: #9ca3af;
        }

        .popular-searches {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
          font-size: 0.875rem;
        }

        .popular-searches span {
          opacity: 0.9;
        }

        .popular-searches a {
          color: white;
          text-decoration: underline;
          opacity: 0.9;
          transition: opacity 0.3s;
        }

        .popular-searches a:hover {
          opacity: 1;
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
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }

        .category-card {
          background: white;
          padding: 30px;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          transition: all 0.3s;
        }

        .category-card:hover {
          border-color: #10B981;
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }

        .category-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .category-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .category-description {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }

        .articles-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .articles-list li {
          margin-bottom: 0.75rem;
        }

        .articles-list a {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #10B981;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s;
        }

        .articles-list a:hover {
          color: #059669;
          padding-left: 5px;
        }

        .support-section {
          background: #f9fafb;
        }

        .support-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px;
        }

        .support-card {
          background: white;
          padding: 40px;
          border-radius: 12px;
          text-align: center;
          border: 2px solid #e5e7eb;
          transition: all 0.3s;
        }

        .support-card:hover {
          border-color: #10B981;
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }

        .support-icon {
          color: #10B981;
          margin-bottom: 1rem;
        }

        .support-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.75rem;
        }

        .support-description {
          color: #6b7280;
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }

        .support-availability {
          color: #10B981;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .support-btn {
          display: inline-block;
          background: #10B981;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: background 0.3s;
        }

        .support-btn:hover {
          background: #059669;
        }

        .quick-links-section {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        }

        .quick-links-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 25px;
          max-width: 900px;
          margin: 0 auto;
        }

        .quick-link {
          background: white;
          padding: 30px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 20px;
          border: 2px solid #e5e7eb;
          transition: all 0.3s;
          cursor: pointer;
        }

        .quick-link:hover {
          border-color: #10B981;
          transform: translateX(5px);
        }

        .quick-link svg:first-child {
          color: #10B981;
          flex-shrink: 0;
        }

        .quick-link div {
          flex: 1;
        }

        .quick-link h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .quick-link p {
          color: #6b7280;
          margin: 0;
        }

        .quick-link svg:last-child {
          color: #9ca3af;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .categories-grid {
            grid-template-columns: 1fr;
          }

          .support-grid {
            grid-template-columns: 1fr;
          }

          .quick-links-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default HelpCenter;
