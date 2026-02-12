'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from '../new/page.module.css';

interface PlayerOption {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  venmo_user: string;
  player_notes: string;
}

export default function EditPlayerPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [players, setPlayers] = useState<PlayerOption[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    venmo_user: '',
    player_notes: '',
  });

  useEffect(() => {
    supabase
      .from('players')
      .select('*')
      .order('first_name')
      .then(({ data }) => {
        if (data) {
          setPlayers(
            (data as Record<string, any>[]).map((p) => ({
              id: p.id,
              name: `${p.first_name} ${p.last_name}`,
              first_name: p.first_name || '',
              last_name: p.last_name || '',
              email: p.email || '',
              phone: p.phone || '',
              venmo_user: p.venmo_user || '',
              player_notes: p.player_notes || p.player_notest || '',
            }))
          );
        }
      });
  }, []);

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setConfirmDelete(false);
    setError('');
    setSuccess('');

    if (!playerId) {
      setFormData({ first_name: '', last_name: '', email: '', phone: '', venmo_user: '', player_notes: '' });
      return;
    }

    const player = players.find((p) => p.id === playerId);
    if (player) {
      setFormData({
        first_name: player.first_name,
        last_name: player.last_name,
        email: player.email,
        phone: player.phone,
        venmo_user: player.venmo_user,
        player_notes: player.player_notes,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedPlayerId) {
      setError('Please select a player to edit');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/players', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedPlayerId, ...formData }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update player');
        setIsSubmitting(false);
        return;
      }

      setSuccess('Player updated successfully.');

      // Update local list
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === selectedPlayerId
            ? {
                ...p,
                first_name: formData.first_name,
                last_name: formData.last_name,
                name: `${formData.first_name} ${formData.last_name}`,
                email: formData.email,
                phone: formData.phone,
                venmo_user: formData.venmo_user,
                player_notes: formData.player_notes,
              }
            : p
        )
      );

      setIsSubmitting(false);
    } catch {
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPlayerId) return;

    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/players', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedPlayerId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to delete player');
        setIsDeleting(false);
        return;
      }

      setSuccess('Player deleted successfully.');
      setPlayers((prev) => prev.filter((p) => p.id !== selectedPlayerId));
      setSelectedPlayerId('');
      setConfirmDelete(false);
      setFormData({ first_name: '', last_name: '', email: '', phone: '', venmo_user: '', player_notes: '' });
      setIsDeleting(false);
    } catch {
      setError('An unexpected error occurred');
      setConfirmDelete(false);
      setIsDeleting(false);
    }
  };

  return (
    <main>
      <Link href="/" className={styles.backLink}>
        &larr; Back to Rankings
      </Link>

      <div className="section-header">
        <h2>Edit Player</h2>
      </div>

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit}>
          <table className={styles.formTable}>
            <tbody>
              <tr>
                <td className={styles.labelCell}>Select Player</td>
                <td className={styles.inputCell}>
                  <select
                    className={styles.input}
                    value={selectedPlayerId}
                    onChange={(e) => handlePlayerSelect(e.target.value)}
                  >
                    <option value="">— Select a player —</option>
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>

              {selectedPlayerId && (
                <>
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
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className={styles.buttonRow}>
                      <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting || isDeleting}
                      >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        className={styles.submitButton}
                        style={{
                          marginLeft: '8px',
                          color: confirmDelete ? '#fff' : 'var(--accent-red)',
                          background: confirmDelete ? 'var(--accent-red)' : undefined,
                          borderColor: 'var(--accent-red)',
                        }}
                        disabled={isSubmitting || isDeleting}
                        onClick={handleDelete}
                      >
                        {isDeleting ? 'Deleting...' : confirmDelete ? 'Confirm Delete' : 'Delete Player'}
                      </button>
                      {confirmDelete && (
                        <button
                          type="button"
                          className={styles.submitButton}
                          style={{ marginLeft: '8px' }}
                          onClick={() => setConfirmDelete(false)}
                          disabled={isDeleting}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </form>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
      </div>
    </main>
  );
}
