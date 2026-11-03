// Pole formularza z etykietą i komunikatem błędu walidacji
export default function Field({ label, error, wide = false, as = 'input', children, ...props }) {
  const Control = as;
  return (
    <label className={`field ${wide ? 'field-wide' : ''} ${error ? 'field-invalid' : ''}`}>
      <span>{label}</span>
      {children ?? <Control aria-invalid={Boolean(error)} {...props} />}
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}
