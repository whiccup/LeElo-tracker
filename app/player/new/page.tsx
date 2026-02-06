'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function NewPlayerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    venmo_user: '',
    player_notes: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create player');
        setIsSubmitting(false);
        return;
      }

      // Success - clear form and show success message
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        venmo_user: '',
        player_notes: '',
      });
      setSuccess('Player added successfully!');
      setIsSubmitting(false);
    } catch (err) {
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <main>
      <Link href="/" className={styles.backLink}>
        &larr; Back to Rankings
      </Link>

      <div className="section-header">
        <h2>Add New Player</h2>
      </div>

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit}>
          <table className={styles.formTable}>
            <tbody>
              <tr>
                <td className={styles.labelCell}>
                  First Name<span className={styles.required}>*</span>
                </td>
                <td className={styles.inputCell}>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>
                  Last Name<span className={styles.required}>*</span>
                </td>
                <td className={styles.inputCell}>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Email</td>
                <td className={styles.inputCell}>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.input}
                  />
                  <span className={styles.helpText}>Optional</span>
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Phone</td>
                <td className={styles.inputCell}>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={styles.input}
                  />
                  <span className={styles.helpText}>Optional</span>
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Venmo Username</td>
                <td className={styles.inputCell}>
                  <input
                    type="text"
                    name="venmo_user"
                    value={formData.venmo_user}
                    onChange={handleChange}
                    className={styles.input}
                  />
                  <span className={styles.helpText}>Optional</span>
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Notes</td>
                <td className={styles.inputCell}>
                  <textarea
                    name="player_notes"
                    value={formData.player_notes}
                    onChange={handleChange}
                    className={styles.textarea}
                  />
                  <span className={styles.helpText}>Optional notes about the player</span>
                </td>
              </tr>
              <tr>
                <td colSpan={2} className={styles.buttonRow}>
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Adding Player...' : 'Add Player'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
      </div>
    </main>
  );
}
