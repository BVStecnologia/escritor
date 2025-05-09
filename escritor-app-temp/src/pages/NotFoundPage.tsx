import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Página não encontrada</h2>
        <p className="not-found-text">
          A página que você está procurando não existe ou foi removida.
        </p>
        <Link to="/" className="not-found-button">
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
}