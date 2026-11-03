import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import AuthLayout from '../components/AuthLayout.jsx';
import Field from '../components/Field.jsx';
import Icon from '../components/Icon.jsx';
import { useAuth } from '../context/auth.js';

// PU-02: logowanie
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: location.state?.email || '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'Logowanie · PetCare';
  }, []);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError('Podaj adres e-mail i hasło.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await login(form.email.trim(), form.password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="WITAJ PONOWNIE"
      title="Miło Cię widzieć!"
      lead="Zaloguj się, aby zadbać o zdrowie i szczęście swoich pupili."
    >
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <Alert type="success">{location.state?.message}</Alert>
        <Alert>{error}</Alert>
        <Field
          label="Adres e-mail"
          type="email"
          autoComplete="email"
          placeholder="anna@example.com"
          value={form.email}
          onChange={update('email')}
          autoFocus
        />
        <Field
          label="Hasło"
          type="password"
          autoComplete="current-password"
          placeholder="Wpisz hasło"
          value={form.password}
          onChange={update('password')}
        />
        <button className="primary auth-button" type="submit" disabled={busy}>
          {busy ? 'Logowanie…' : 'Zaloguj się'} <Icon name="arrow" size={18} />
        </button>
      </form>
      <p className="auth-switch">
        Nie masz jeszcze konta? <Link to="/register">Załóż konto</Link>
      </p>
    </AuthLayout>
  );
}
