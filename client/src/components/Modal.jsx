import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

// Design handoff README > "Accessibility notes": modals close on Escape
// (overlay click was already handled) and should manage focus. This is a
// shared component used across many screens (Class detail, Wallets, the
// enrollment wizard, the student reschedule flow), so fixing it here has
// broad reach rather than patching each call site.
const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      previouslyFocused.current = document.activeElement;
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = 'unset';
      previouslyFocused.current?.focus?.();
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default Modal;
