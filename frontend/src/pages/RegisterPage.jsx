import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client.js';
import Alert from '../components/Alert.jsx';
import AuthLayout from '../components/AuthLayout.jsx';
import Field from '../components/Field.jsx';
import Icon from '../components/Icon.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Walidacja po stronie klienta – te same reguły co w backendzie
function validate({ email, password, confirm }) {
  const errors = {};
  if (!EMAIL_RE.test(email.trim())) errors.email = 'Podaj poprawny adres e-mail.';
  if (password.length < 8 || password.length > 72)
    errors.password = 'Hasło musi mieć od 8 do 72 znaków.';
  else if (!/[a-zA-Z]/.test(password) || !/\d/.test(password))
    errors.password = 'Hasło musi zawierać co najmniej jedną literę i jedną cyfrę.';
  if (confirm !== password) errors.confirm = 'Hasła nie są takie same.';
  return errors;
}

// PU-01: rejestracja – po sukcesie przejście do logowania z komunikatem
export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'Rejestracja · PetCare';
  }, []);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    setError('');
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: { email: form.email.trim(), password: form.password },
      });
      navigate('/login', { state: { message: data.message, email: data.user.email } });
    } catch (err) {
      setError(err.message);
      setErrors(err.details || {});
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="DOŁĄCZ DO PETCARE"
      title="Załóż konto"
      lead="Wszystko, czego potrzebują Twoje zwierzęta, uporządkowane w jednym miejscu."
    >
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <Alert>{error}</Alert>
        <Field
          label="Adres e-mail"
          type="email"
          autoComplete="email"
          placeholder="anna@example.com"
          value={form.email}
          onChange={update('email')}
          error={errors.email}
          autoFocus
        />
        <Field
          label="Hasło"
          type="password"
          autoComplete="new-password"
          placeholder="Min. 8 znaków, litera i cyfra"
          value={form.password}
          onChange={update('password')}
          error={errors.password}
        />
        <Field
          label="Powtórz hasło"
          type="password"
          autoComplete="new-password"
          placeholder="Wpisz hasło ponownie"
          value={form.confirm}
          onChange={update('confirm')}
          error={errors.confirm}
        />
        <button className="primary auth-button" type="submit" disabled={busy}>
          {busy ? 'Tworzenie konta…' : 'Utwórz konto'} <Icon name="arrow" size={18} />
        </button>
      </form>
      <p className="auth-switch">
        Masz już konto? <Link to="/login">Zaloguj się</Link>
      </p>
    </AuthLayout>
  );
}
