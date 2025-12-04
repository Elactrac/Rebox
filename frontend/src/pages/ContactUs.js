import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const ContactUs = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast.success('Message sent! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">Get in Touch</h1>
          <p className="hero-subtitle">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Information */}
            <div className="contact-info">
              <h2>Contact Information</h2>
              <p className="info-subtitle">Get in touch with us through any of these channels</p>

              <div className="info-cards">
                <div className="info-card">
                  <div className="info-icon">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3>Email Us</h3>
                    <a href="mailto:support@rebox.com">support@rebox.com</a>
                    <p className="info-note">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3>Call Us</h3>
                    <a href="tel:+1234567890">+1 (234) 567-890</a>
                    <p className="info-note">Mon-Fri, 9AM-6PM PST</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3>Visit Us</h3>
                    <p>123 Sustainability Street<br/>San Francisco, CA 94102</p>
                    <p className="info-note">By appointment only</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h3>Live Chat</h3>
                    <p>Available on our dashboard</p>
                    <p className="info-note">Mon-Fri, 9AM-6PM PST</p>
                  </div>
                </div>
              </div>

              <div className="social-section">
                <h3>Follow Us</h3>
                <div className="social-links">
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                    Twitter
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                    Facebook
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
                    LinkedIn
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                    Instagram
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-wrapper">
              <form onSubmit={handleSubmit} className="contact-form">
                <h2>Send Us a Message</h2>
                
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    className="form-input"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    name="message"
                    className="form-textarea"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                  {loading ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send size={18} style={{ marginRight: '0.5rem' }} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Looking for Quick Answers?</h2>
            <p>Check out our FAQ section for answers to commonly asked questions.</p>
            <Link to="/faq" className="btn btn-secondary btn-lg">
              View FAQ
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .contact-page {
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

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
        }

        .contact-info h2 {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .info-subtitle {
          color: #6b7280;
          margin-bottom: 2rem;
        }

        .info-cards {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 3rem;
        }

        .info-card {
          display: flex;
          gap: 20px;
          padding: 24px;
          background: #f9fafb;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
        }

        .info-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .info-card h3 {
          font-size: 1.125rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .info-card a {
          color: #10B981;
          text-decoration: none;
          font-weight: 600;
        }

        .info-card a:hover {
          color: #059669;
        }

        .info-card p {
          color: #6b7280;
          margin: 0;
        }

        .info-note {
          font-size: 0.875rem;
          margin-top: 0.25rem !important;
          color: #9ca3af !important;
        }

        .social-section {
          margin-top: 3rem;
        }

        .social-section h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 1rem;
        }

        .social-links {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .social-link {
          padding: 10px 20px;
          background: #f3f4f6;
          border-radius: 8px;
          color: #4b5563;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
        }

        .social-link:hover {
          background: #10B981;
          color: white;
        }

        .contact-form-wrapper {
          background: white;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .contact-form h2 {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 2rem;
        }

        .form-textarea {
          resize: vertical;
        }

        .btn-block {
          width: 100%;
          margin-top: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cta-section {
          background: #f9fafb;
          padding: 80px 20px;
          text-align: center;
        }

        .cta-content h2 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 1rem;
        }

        .cta-content p {
          font-size: 1.25rem;
          color: #6b7280;
          margin-bottom: 2rem;
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

          .contact-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .contact-form-wrapper {
            padding: 30px 20px;
          }

          .cta-content h2 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ContactUs;
