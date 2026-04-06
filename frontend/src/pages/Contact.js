import React from 'react';
import '../styles/Contact.css';

const Contact = () => {
  return (
    <div className="contact-container">
      <div className="contact-content">
        <h1 className="contact-title">Get in Touch</h1>
        <p className="contact-subtitle">
          Have questions? We'd love to hear from you.
        </p>

        <div className="contact-grid">
          <div className="contact-card liquid-glass-card">
            <div className="contact-icon">📧</div>
            <h3>Email Us</h3>
            <p>sagarpandey.in@gmail.com</p>
          </div>

          <div className="contact-card liquid-glass-card">
            <div className="contact-icon">📞</div>
            <h3>Call Us</h3>
            <p>+91-6280804215</p>
          </div>

          <div className="contact-card liquid-glass-card">
            <div className="contact-icon">📍</div>
            <h3>Visit Us</h3>
            <p>Sector 17, Chandigarh, India 160017</p>
          </div>

          <div className="contact-card liquid-glass-card">
            <div className="contact-icon">💻</div>
            <h3>GitHub</h3>
            <p><a href="https://github.com/sagarpandey19" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>github.com/sagarpandey19</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
