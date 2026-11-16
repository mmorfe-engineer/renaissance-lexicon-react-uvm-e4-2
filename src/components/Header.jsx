/**
 * Header component
 * Main header with title and navigation
 */

export function Header() {
  return (
    <header className="header" role="banner">
      <div className="header-container">
        <h1 className="header-title">
          Renaissance Lexicon · React Edition
        </h1>
        <p className="header-subtitle">
          E-Actividad 4.2 · CRUD con React y Dictionary API
        </p>
      </div>
    </header>
  );
}

export default Header;
