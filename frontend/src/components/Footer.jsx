import { Link } from "react-router-dom";

function Footer() {
  const footerLinks = {
    "Quick Links": ["Home", "Mood", "Challenges", "Chat", "Progress"],
    "Features": ["Mood Tracking", "Focus Sessions", "Mini Challenges", "Support Chat"],
    "Help": ["Help Center", "FAQs", "Contact", "Report a problem"]
  };

  const currentYear = new Date().getFullYear();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');

        .footer-root {
          background: #d4ede8;
          border-top: 1.5px solid #c0ddd8;
          font-family: 'Nunito', sans-serif;
        }

        .footer-main {
          max-width: 1120px;
          margin: 0 auto;
          padding: 56px 28px 44px;
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr;
          gap: 40px;
        }

        @media (max-width: 900px) {
          .footer-main { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 520px) {
          .footer-main { grid-template-columns: 1fr; }
        }

        /* Brand */
        .footer-brand-logo {
          width: 148px;
          height: auto;
          display: block;
          margin-bottom: 14px;
        }

        .footer-brand-desc {
          font-size: 13.5px;
          color: #4d7a76;
          line-height: 1.65;
          max-width: 220px;
          margin: 0 0 14px;
        }

        .footer-brand-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          color: #5b9e96;
          background: #fff;
          border: 1px solid #c0ddd8;
          padding: 5px 14px;
          border-radius: 100px;
        }

        /* Link columns */
        .footer-col-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #3d5a58;
          margin: 0 0 16px;
        }

        .footer-col-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .footer-col-list a {
          font-size: 13.5px;
          color: #5d8a86;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.18s ease;
        }

        .footer-col-list a:hover {
          color: #2d4a47;
        }

        /* Bottom bar */
        .footer-bottom {
          border-top: 1px solid #c0ddd8;
        }

        .footer-bottom-inner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 18px 28px;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
        }

        .footer-copy {
          font-size: 12.5px;
          color: #7aaca8;
          margin: 0;
        }

        .footer-policy-links {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .footer-policy-links a {
          font-size: 12.5px;
          color: #7aaca8;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.18s ease;
        }

        .footer-policy-links a:hover { color: #3d5a58; }

        .footer-badge {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .footer-badge span {
          font-size: 11.5px;
          color: #9ab5b2;
        }

        .footer-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #b0ceca;
        }

        /* Social icons */
        .footer-socials {
          display: flex;
          gap: 10px;
          margin-top: 18px;
        }

        .footer-social-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #fff;
          border: 1.5px solid #c0ddd8;
          display: grid;
          place-items: center;
          text-decoration: none;
          transition: all 0.22s ease;
          color: #5b9e96;
        }

        .footer-social-btn:hover {
          background: #3d5a58;
          border-color: #3d5a58;
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(61,90,88,0.22);
        }

        .footer-social-btn svg {
          width: 16px;
          height: 16px;
          fill: currentColor;
        }
      `}</style>

      <footer className="footer-root">
        {/* Main */}
        <div className="footer-main">
          {/* Brand */}
          <div>
            <Link to="/">
              <img
                src="https://res.cloudinary.com/dkqjn6dqw/image/upload/v1771944890/s__1_-removebg-preview_b54v9c.png"
                alt="Zenly logo"
                className="footer-brand-logo"
              />
            </Link>
            <p className="footer-brand-desc">
              Your companion for mindful studying, emotional balance and better focus.
            </p>
            <span className="footer-brand-tag">
              🌿 Made for students
            </span>

            {/* Social Links */}
            <div className="footer-socials">
              {/* Instagram */}
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Instagram">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* LinkedIn */}
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>

              {/* Twitter / X */}
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Twitter / X">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="footer-col-title">{category}</p>
              <ul className="footer-col-list">
                {links.map((link) => (
                  <li key={link}>
                    <Link to={`/${link.toLowerCase().replace(/\s+/g, '-')}`}>
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-inner">
            <p className="footer-copy">© {currentYear} Zenly. All rights reserved.</p>

            <div className="footer-policy-links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms & Conditions</Link>
              <Link to="/cookies">Cookie Policy</Link>
            </div>

            <div className="footer-badge">
              <span>v1.0.0</span>
              <div className="footer-dot" />
              <span>Student Wellbeing</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;