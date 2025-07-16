// src/components/ServiceOrders.jsx
import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebase'; // make sure this points to your src/firebase.js

export default function ServiceOrders() {
  const [orders, setOrders]       = useState([]);
  const [filter, setFilter]       = useState('pending');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // Reload whenever 'filter' changes
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all bookings
        const snap = await getDocs(collection(db, 'bookings'));
        const all  = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setOrders(all);
      } catch (err) {
        console.error('Error loading bookings:', err);
        setError('Could not load bookings.');
      } finally {
        setLoading(false);
      }
    })();
  }, [filter]);

  // Update a booking doc in Firestore
  const patch = async (id, data) => {
    try {
      await updateDoc(doc(db, 'bookings', id), data);
      // Optimistically update local list
      setOrders(orders.map(o =>
        o.id === id ? { ...o, ...data } : o
      ));
    } catch (err) {
      console.error('Failed to update booking:', err);
      setError('Failed to update booking.');
    }
  };

  const active    = orders.filter(o => o.status === filter && o.status !== 'delivered');
  const delivered = orders.filter(o => o.status === 'delivered');

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Service Bookings</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      {loading && <p className="text-gray-500">Loading…</p>}

      {/* Status tabs */}
      <div className="mb-4">
        {['pending','approved','delivered'].map(s => (
          <label key={s} className="mr-4">
            <input
              type="radio"
              name="status"
              checked={filter === s}
              onChange={() => setFilter(s)}
              className="mr-1"
            />
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </label>
        ))}
      </div>

      {/* Active bookings */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">
          {filter.charAt(0).toUpperCase() + filter.slice(1)} ({active.length})
        </h3>
        {active.length === 0 && !loading && <em>No bookings.</em>}
        {active.map(o => (
          <div key={o.id} className="border p-4 mb-4 rounded bg-white shadow">
            <p>
              <strong>#{o.id}</strong> — {o.serviceName} @ {o.date} {o.time}
            </p>
            <div className="mt-2">
              <select
                value={o.status}
                onChange={e => patch(o.id, { status: e.target.value })}
                className="p-1 border rounded"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
            <div className="mt-2">
              <input
                type="text"
                placeholder="Assign provider"
                value={o.provider || ''}
                onChange={e => patch(o.id, { provider: e.target.value })}
                className="w-full p-1 border rounded"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Delivered bookings */}
      <div>
        <h3 className="text-xl font-semibold mb-2">
          Delivered ({delivered.length})
        </h3>
        {delivered.map(o => (
          <div key={o.id} className="border p-4 mb-4 rounded bg-gray-50">
            <p><strong>#{o.id}</strong> — {o.serviceName}</p>
            <p>Provider: {o.provider || '—'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
