/**
 * Header component
 * Site header with Renaissance Lexicon branding
 */

export function Header() {
  return (
    <header className="site-header wrap" role="banner">
      <a className="brand" href="./" aria-label="Renaissance Lexicon, inicio">
        <span className="brand-mark" aria-hidden="true">R<span>l</span></span>
        <span>Renaissance <strong>Lexicon</strong></span>
      </a>
      <span className="edition">React Edition <span aria-hidden="true">/</span> E-Actividad 4.2</span>
    </header>
  );
}

export default Header;
