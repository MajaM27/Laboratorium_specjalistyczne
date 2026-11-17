import { cloneElement, isValidElement, useId } from 'react';

// Pole formularza z etykietą i komunikatem błędu walidacji.
// Komunikat błędu jest powiązany z polem (aria-describedby), więc czytnik ekranu odczyta go
// razem z polem. Własną kontrolkę (np. <select>) można przekazać jako children.
export default function Field({ label, error, wide = false, as = 'input', children, ...props }) {
  const errorId = useId();
  const a11y = {
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? errorId : undefined,
  };
  const Control = as;
  const control = isValidElement(children) ? (
    cloneElement(children, a11y)
  ) : (
    <Control {...a11y} {...props} />
  );

  return (
    <label className={`field ${wide ? 'field-wide' : ''} ${error ? 'field-invalid' : ''}`}>
      <span>{label}</span>
      {control}
      {error && (
        <small className="field-error" id={errorId}>
          {error}
        </small>
      )}
    </label>
  );
}
