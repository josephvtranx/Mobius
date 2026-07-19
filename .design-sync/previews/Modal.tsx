import React from 'react';
import { Modal } from 'mobius-client';

// Modal portals into #modal-root — the app's index.html provides it; previews provide it here.
if (typeof document !== 'undefined' && !document.getElementById('modal-root')) {
  const d = document.createElement('div');
  d.id = 'modal-root';
  document.body.appendChild(d);
}

export const Basic = () => (
  <Modal isOpen onClose={() => {}}>
    <h2 style={{ fontSize: 18, fontWeight: 600, color: '#16303a', marginBottom: 8 }}>Session details</h2>
    <p style={{ fontSize: 14, color: '#64827e', marginBottom: 16 }}>
      Algebra · Mon, Jul 20 · 4:00 – 5:00 PM with Kim Soyeon in Room 305.
    </p>
    <button className="hm-btn primary">Got it</button>
  </Modal>
);

export const ConfirmCancel = () => (
  <Modal isOpen onClose={() => {}}>
    <h2 style={{ fontSize: 18, fontWeight: 600, color: '#16303a', marginBottom: 8 }}>Cancel this session?</h2>
    <p style={{ fontSize: 14, color: '#64827e', marginBottom: 16 }}>
      This session is past the change deadline — the credit will be forfeited. You can contact the academy to appeal.
    </p>
    <div style={{ display: 'flex', gap: 10 }}>
      <button className="hm-btn primary">Keep session</button>
      <button className="hm-btn">Cancel anyway</button>
    </div>
  </Modal>
);
