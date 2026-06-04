export default function Footer() {
  return (
    <footer
      className="footer-flex flex items-center justify-between px-10 py-7 border-t"
      style={{ background: '#0a0b0d', borderColor: 'var(--dark3)' }}
    >
      <div
        className="font-condensed font-black italic uppercase text-white"
        style={{ fontSize: '1.4rem' }}
      >
        CLAVEL<span style={{ color: 'var(--yellow)' }}>PARTS</span>
      </div>

      <div style={{ fontSize: '0.78rem', color: '#444' }}>
        © 2025 ClavelParts · Argentina · Proyecto en desarrollo
      </div>

      <div className="flex gap-6">
        {['Términos', 'Privacidad', 'Contacto'].map((link) => (
          <a
            key={link}
            href="#"
            className="footer-link"
            style={{ fontSize: '0.78rem', color: '#444', textDecoration: 'none', fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--yellow)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#444')}
          >
            {link}
          </a>
        ))}
      </div>
    </footer>
  )
}
