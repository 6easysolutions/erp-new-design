/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import DeleteModal from '../components/delete-modal';

describe('DeleteModal Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders default message and accessible dialog structure', () => {
    const { container } = render(<DeleteModal />);
    const dialog = container.querySelector('#delete-modal');
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBe('delete-modal-title');

    expect(screen.getByText('Are you sure you want to delete this?')).toBeDefined();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /yes delete/i })).toBeDefined();
  });

  it('renders custom title and message when provided', () => {
    render(
      <DeleteModal
        title="Delete Leave"
        message="Are you sure you want to delete this leave application?"
      />
    );
    expect(screen.getByText('Delete Leave')).toBeDefined();
    expect(
      screen.getByText('Are you sure you want to delete this leave application?')
    ).toBeDefined();
  });

  it('calls onDelete callback when Yes Delete button is clicked', () => {
    const handleDelete = vi.fn();
    render(<DeleteModal onDelete={handleDelete} />);

    const deleteBtn = screen.getByRole('button', { name: /yes delete/i });
    expect(deleteBtn.className).toContain('btn-danger');

    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalledTimes(1);
  });
});
