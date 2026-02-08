'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import styles from './page.module.css';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated, isLoading, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get('from') || '/';

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, redirectTo, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const result = await login(password);

    if (result.success) {
      router.replace(redirectTo);
    } else {
      setError(result.error || 'Invalid password');
      setSubmitting(false);
    }
  }

  if (isLoading || isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.heading}>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <table className={styles.formTable}>
          <tbody>
            <tr>
              <td className={styles.labelCell}>Password</td>
              <td className={styles.inputCell}>
                <input
                  type="password"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  required
                />
              </td>
            </tr>
            <tr>
              <td colSpan={2} className={styles.buttonRow}>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={submitting || !password}
                >
                  {submitting ? 'Logging in...' : 'Login'}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
