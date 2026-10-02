export default function PageHeader({ title, subtitle }) {
  return (
    <header className="page-header">
      <span className="eyebrow">Order System</span>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  );
}
