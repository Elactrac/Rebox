import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = React.useState(null);

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'What is ReBox?',
          a: 'ReBox is a sustainable packaging marketplace that connects individuals, businesses, and recyclers. We make it easy to recycle, reuse, and repurpose packaging materials while earning rewards for your environmental impact.'
        },
        {
          q: 'How do I create an account?',
          a: 'Click the "Sign Up" button on our homepage and choose your account type (Individual, Business, or Recycler). Fill in your details, verify your email, and you\'re ready to start!'
        },
        {
          q: 'Is ReBox free to use?',
          a: 'Yes! Creating an account and listing packaging is completely free. We only charge a small service fee when transactions are completed through our platform.'
        }
      ]
    },
    {
      category: 'For Individuals',
      questions: [
        {
          q: 'What types of packaging can I list?',
          a: 'You can list boxes, bottles, containers, bags, and other reusable packaging materials. Items should be clean and in good condition. We accept cardboard, plastic, glass, and metal packaging.'
        },
        {
          q: 'How do pickups work?',
          a: 'Schedule a pickup at your convenience. Select your items, choose a time slot, and a verified recycler will come to collect. You\'ll earn reward points for each successful pickup!'
        },
        {
          q: 'What are reward points and how do I use them?',
          a: 'Reward points are earned for every package you recycle. Points can be redeemed for gift cards, discounts, or donated to environmental causes. Check your dashboard to track your points!'
        }
      ]
    },
    {
      category: 'For Businesses',
      questions: [
        {
          q: 'How can my business benefit from ReBox?',
          a: 'Businesses can list excess packaging, reduce disposal costs, access sustainable materials, and showcase their environmental commitment. Our platform also provides detailed sustainability reports.'
        },
        {
          q: 'Can I make bulk listings?',
          a: 'Absolutely! Business accounts support bulk listings and regular pickup scheduling. Contact our business team for enterprise solutions tailored to your needs.'
        },
        {
          q: 'Do you provide sustainability reports?',
          a: 'Yes! All business accounts receive quarterly sustainability reports showing your environmental impact, including CO₂ savings, waste diverted, and equivalent trees planted.'
        }
      ]
    },
    {
      category: 'For Recyclers',
      questions: [
        {
          q: 'How do I become a verified recycler?',
          a: 'Apply through our recycler signup page. We\'ll verify your credentials, certifications, and background. Once approved, you\'ll gain access to pickup requests in your service area.'
        },
        {
          q: 'How do I get paid?',
          a: 'Payments are processed weekly through your preferred method (direct deposit or PayPal). You\'ll earn for each completed pickup based on volume and material type.'
        },
        {
          q: 'Can I choose which pickups to accept?',
          a: 'Yes! You have full control over which pickup requests you accept. View details like location, volume, and items before committing.'
        }
      ]
    },
    {
      category: 'Safety & Trust',
      questions: [
        {
          q: 'How do you ensure user safety?',
          a: 'All recyclers undergo background checks and verification. Users can rate and review their experiences. Pickups include tracking codes, and support is available 24/7.'
        },
        {
          q: 'What if there\'s an issue with my pickup?',
          a: 'Contact our support team immediately through the app or email support@rebox.com. We\'ll investigate and resolve any issues quickly. Your satisfaction is our priority.'
        },
        {
          q: 'Is my personal information secure?',
          a: 'Absolutely. We use bank-level encryption and never share your personal information without consent. Read our Privacy Policy for complete details.'
        }
      ]
    },
    {
      category: 'Technical Support',
      questions: [
        {
          q: 'I forgot my password. What should I do?',
          a: 'Click "Forgot Password" on the login page. Enter your email and we\'ll send you a reset link. The link expires in 1 hour for security.'
        },
        {
          q: 'Why isn\'t my email verification working?',
          a: 'Check your spam folder first. If you still don\'t see it, log in and request a new verification email from your dashboard. Contact support if issues persist.'
        },
        {
          q: 'The app isn\'t working properly. What should I do?',
          a: 'Try clearing your browser cache or updating to the latest version. If problems continue, contact support@rebox.com with details about the issue and your device/browser.'
        }
      ]
    }
  ];

  const toggleFAQ = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">Frequently Asked Questions</h1>
          <p className="hero-subtitle">
            Find answers to common questions about ReBox. Can't find what you're looking for? Contact our support team!
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="section">
        <div className="container">
          <div className="faq-content">
            {faqs.map((category, catIndex) => (
              <div key={catIndex} className="faq-category">
                <h2 className="category-title">{category.category}</h2>
                <div className="faq-list">
                  {category.questions.map((faq, qIndex) => {
                    const index = `${catIndex}-${qIndex}`;
                    const isOpen = openIndex === index;
                    
                    return (
                      <div key={qIndex} className={`faq-item ${isOpen ? 'open' : ''}`}>
                        <button
                          className="faq-question"
                          onClick={() => toggleFAQ(catIndex, qIndex)}
                        >
                          <span>{faq.q}</span>
                          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        {isOpen && (
                          <div className="faq-answer">
                            <p>{faq.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="contact-cta">
            <h3>Still have questions?</h3>
            <p>Our support team is here to help you 24/7</p>
            <div className="cta-buttons">
              <a href="/contact" className="btn btn-primary">
                Contact Support
              </a>
              <a href="mailto:support@rebox.com" className="btn btn-secondary">
                Email Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .faq-page {
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
          max-width: 900px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .section {
          padding: 80px 20px;
        }

        .faq-content {
          margin-bottom: 60px;
        }

        .faq-category {
          margin-bottom: 50px;
        }

        .category-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 3px solid #10B981;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .faq-item {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .faq-item.open {
          border-color: #10B981;
          box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.1);
        }

        .faq-question {
          width: 100%;
          padding: 20px 24px;
          background: none;
          border: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          cursor: pointer;
          text-align: left;
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          transition: color 0.3s;
        }

        .faq-question:hover {
          color: #10B981;
        }

        .faq-item.open .faq-question {
          color: #10B981;
        }

        .faq-answer {
          padding: 0 24px 24px 24px;
          color: #4b5563;
          line-height: 1.7;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .faq-answer p {
          margin: 0;
        }

        .contact-cta {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          padding: 50px;
          border-radius: 16px;
          text-align: center;
        }

        .contact-cta h3 {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .contact-cta p {
          color: #6b7280;
          margin-bottom: 2rem;
          font-size: 1.125rem;
        }

        .cta-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .category-title {
            font-size: 1.5rem;
          }

          .faq-question {
            font-size: 1rem;
            padding: 16px 20px;
          }

          .contact-cta {
            padding: 30px 20px;
          }

          .contact-cta h3 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default FAQ;
