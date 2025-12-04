import React from 'react';
import { Shield, Lock, Eye, Users, Database, Bell } from 'lucide-react';

const Privacy = () => {
  const principles = [
    {
      icon: Shield,
      title: 'Transparency',
      description: 'We are clear about what data we collect and why'
    },
    {
      icon: Lock,
      title: 'Security',
      description: 'Your data is protected with industry-standard encryption'
    },
    {
      icon: Eye,
      title: 'Control',
      description: 'You control your data and can delete it anytime'
    },
    {
      icon: Users,
      title: 'Limited Sharing',
      description: 'We never sell your data to third parties'
    }
  ];

  return (
    <div className="privacy-page">
      <div className="hero-section">
        <div className="container">
          <h1>Privacy Policy</h1>
          <p className="updated">Last Updated: January 15, 2025</p>
          <p className="intro">
            At ReBox, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information.
          </p>
        </div>
      </div>

      <div className="container">
        {/* Principles */}
        <section className="principles-section">
          <h2 className="section-title">Our Privacy Principles</h2>
          <div className="principles-grid">
            {principles.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <div key={index} className="principle-card">
                  <Icon size={32} className="principle-icon" />
                  <h3>{principle.title}</h3>
                  <p>{principle.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Content */}
        <div className="content">
          <section className="section">
            <div className="section-header">
              <Database size={24} />
              <h2>1. Information We Collect</h2>
            </div>
            
            <h3>1.1 Information You Provide</h3>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, password, phone number, and account type</li>
              <li><strong>Profile Information:</strong> Profile photo, business details, recycler credentials</li>
              <li><strong>Listing Information:</strong> Details about packaging materials you list</li>
              <li><strong>Transaction Information:</strong> Pickup details, locations, and communication with other users</li>
              <li><strong>Payment Information:</strong> Billing details processed securely through our payment providers</li>
            </ul>

            <h3>1.2 Information Collected Automatically</h3>
            <ul>
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform</li>
              <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
              <li><strong>Location Data:</strong> Approximate location for showing nearby listings and pickups</li>
              <li><strong>Cookies:</strong> We use cookies to remember your preferences and improve your experience</li>
            </ul>

            <h3>1.3 Information from Third Parties</h3>
            <ul>
              <li><strong>OAuth Providers:</strong> Basic profile information when you sign in with Google</li>
              <li><strong>Background Checks:</strong> Verification data for recycler accounts</li>
            </ul>
          </section>

          <section className="section">
            <div className="section-header">
              <Eye size={24} />
              <h2>2. How We Use Your Information</h2>
            </div>
            <p>We use your information to:</p>
            <ul>
              <li>Provide and improve the ReBox platform</li>
              <li>Process transactions and pickups</li>
              <li>Send transactional emails (verification, pickup confirmations, password resets)</li>
              <li>Display your listings to potential buyers or recyclers</li>
              <li>Calculate and track environmental impact</li>
              <li>Manage reward points and redemptions</li>
              <li>Prevent fraud and ensure platform safety</li>
              <li>Communicate important updates about the Service</li>
              <li>Personalize your experience</li>
              <li>Analyze usage patterns to improve features</li>
            </ul>
          </section>

          <section className="section">
            <div className="section-header">
              <Users size={24} />
              <h2>3. Information Sharing</h2>
            </div>
            
            <h3>3.1 With Other Users</h3>
            <p>
              Your profile information, listings, and ratings are visible to other users to facilitate transactions. 
              Contact information is only shared when you accept a pickup or transaction.
            </p>

            <h3>3.2 With Service Providers</h3>
            <p>We share information with trusted service providers who help us operate the platform:</p>
            <ul>
              <li><strong>Hosting:</strong> Vercel (frontend), Render (backend)</li>
              <li><strong>Database:</strong> Supabase (PostgreSQL)</li>
              <li><strong>Email:</strong> SendGrid</li>
              <li><strong>Payment Processing:</strong> Stripe</li>
              <li><strong>Analytics:</strong> Google Analytics</li>
            </ul>
            <p>These providers are contractually obligated to protect your data.</p>

            <h3>3.3 Legal Requirements</h3>
            <p>We may disclose information when required by law or to protect our rights and safety.</p>

            <h3>3.4 Business Transfers</h3>
            <p>
              If ReBox is acquired or merged, your information may be transferred to the new entity.
            </p>

            <h3>3.5 What We Don't Do</h3>
            <p><strong>We never sell your personal information to third parties for marketing purposes.</strong></p>
          </section>

          <section className="section">
            <div className="section-header">
              <Lock size={24} />
              <h2>4. Data Security</h2>
            </div>
            <p>We protect your information using:</p>
            <ul>
              <li><strong>Encryption:</strong> HTTPS/TLS for data in transit, AES encryption for data at rest</li>
              <li><strong>Secure Authentication:</strong> JWT tokens with expiration, bcrypt password hashing</li>
              <li><strong>Access Controls:</strong> Role-based permissions, limited employee access</li>
              <li><strong>Regular Security Audits:</strong> Vulnerability scanning and penetration testing</li>
              <li><strong>Secure Infrastructure:</strong> Cloud providers with SOC 2 compliance</li>
            </ul>
            <p>
              While we implement strong security measures, no system is 100% secure. Please use a strong, 
              unique password and enable two-factor authentication when available.
            </p>
          </section>

          <section className="section">
            <div className="section-header">
              <Bell size={24} />
              <h2>5. Your Rights and Choices</h2>
            </div>
            
            <h3>5.1 Access and Portability</h3>
            <p>You can access and download your data from your account settings.</p>

            <h3>5.2 Correction</h3>
            <p>You can update your information directly in your profile settings.</p>

            <h3>5.3 Deletion</h3>
            <p>
              You can delete your account at any time. Some information may be retained for legal or 
              operational purposes (e.g., transaction records for 7 years).
            </p>

            <h3>5.4 Marketing Communications</h3>
            <p>You can opt out of promotional emails using the unsubscribe link. You'll still receive transactional emails.</p>

            <h3>5.5 Cookies</h3>
            <p>You can control cookies through your browser settings, though some features may not work without them.</p>

            <h3>5.6 Do Not Track</h3>
            <p>We honor Do Not Track signals and do not track users across third-party websites.</p>
          </section>

          <section className="section">
            <h2>6. Data Retention</h2>
            <p>We retain your information as long as your account is active or as needed to provide services:</p>
            <ul>
              <li><strong>Account Data:</strong> Until you delete your account</li>
              <li><strong>Transaction Records:</strong> 7 years for tax and legal compliance</li>
              <li><strong>Logs and Analytics:</strong> 90 days</li>
              <li><strong>Backups:</strong> 30 days, then permanently deleted</li>
            </ul>
          </section>

          <section className="section">
            <h2>7. Children's Privacy</h2>
            <p>
              ReBox is not intended for children under 13. We do not knowingly collect information from 
              children. If we learn we have collected information from a child under 13, we will delete it.
            </p>
          </section>

          <section className="section">
            <h2>8. International Users</h2>
            <p>
              ReBox operates in the United States. If you access the Service from outside the U.S., your 
              information may be transferred to and stored in the U.S., which may have different data 
              protection laws.
            </p>
          </section>

          <section className="section">
            <h2>9. California Privacy Rights</h2>
            <p>
              If you are a California resident, you have additional rights under the CCPA including the 
              right to know what information we collect, the right to deletion, and the right to opt-out 
              of sales (though we don't sell personal information).
            </p>
          </section>

          <section className="section">
            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes 
              by email or through a notice on the platform. Your continued use after changes indicates 
              acceptance.
            </p>
          </section>

          <section className="section">
            <h2>11. Contact Us</h2>
            <p>For privacy questions or to exercise your rights, contact us at:</p>
            <div className="contact-box">
              <p><strong>Email:</strong> privacy@rebox.com</p>
              <p><strong>Mail:</strong> ReBox Privacy Team<br />123 Green Street, Suite 100<br />San Francisco, CA 94102</p>
              <p><strong>Response Time:</strong> We typically respond within 48 hours</p>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .privacy-page {
          min-height: 100vh;
          background: #f9fafb;
        }

        .hero-section {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          padding: 80px 20px 60px;
        }

        .hero-section h1 {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .updated {
          font-size: 1rem;
          opacity: 0.9;
          margin-bottom: 1.5rem;
        }

        .intro {
          font-size: 1.25rem;
          max-width: 800px;
          line-height: 1.6;
        }

        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .principles-section {
          background: white;
          margin: -40px 20px 40px;
          padding: 50px;
          border-radius: 16px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .section-title {
          font-size: 2rem;
          font-weight: 700;
          text-align: center;
          color: #111827;
          margin-bottom: 2rem;
        }

        .principles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 30px;
        }

        .principle-card {
          text-align: center;
        }

        .principle-icon {
          color: #10B981;
          margin-bottom: 1rem;
        }

        .principle-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .principle-card p {
          color: #6b7280;
          line-height: 1.5;
        }

        .content {
          background: white;
          padding: 60px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          margin-bottom: 60px;
          color: #374151;
          line-height: 1.8;
        }

        .section {
          margin-bottom: 50px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 1.5rem;
        }

        .section-header svg {
          color: #10B981;
          flex-shrink: 0;
        }

        .section h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .section h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 1.5rem 0 1rem;
        }

        .section p {
          margin-bottom: 1rem;
        }

        .section ul {
          margin: 1rem 0;
          padding-left: 2rem;
        }

        .section li {
          margin-bottom: 0.75rem;
        }

        strong {
          color: #111827;
          font-weight: 600;
        }

        .contact-box {
          background: #f0fdf4;
          padding: 30px;
          border-radius: 12px;
          border-left: 4px solid #10B981;
          margin-top: 1rem;
        }

        .contact-box p {
          margin-bottom: 1rem;
        }

        .contact-box p:last-child {
          margin-bottom: 0;
        }

        @media (max-width: 768px) {
          .hero-section h1 {
            font-size: 2rem;
          }

          .intro {
            font-size: 1rem;
          }

          .principles-section {
            padding: 30px 20px;
            margin: -30px 10px 30px;
          }

          .content {
            padding: 30px 20px;
          }

          .section h2 {
            font-size: 1.5rem;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default Privacy;
