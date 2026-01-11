/**
 * InviteModal Component
 *
 * Modal for generating and sharing household invites.
 * Displays invite link and code with copy/share options.
 */

import { useState, useEffect } from 'react';
import { X, Copy, Share2, Check, Link } from 'lucide-react';
import { Button } from '@/components/ui';
import { useInvite } from '@/hooks';
import { getUserFriendlyError } from '@/utils';

export interface InviteModalProps {
  /** The household ID to invite to */
  householdId: string;
  /** The household name (for display) */
  householdName: string;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Called when modal should close */
  onClose: () => void;
}

/**
 * InviteModal - Share household invites.
 *
 * Features:
 * - Displays invite link with copy button
 * - Shows invite code for manual entry
 * - Native share sheet support (Web Share API)
 * - Auto-generates invite if none exists
 */
export function InviteModal({
  householdId,
  householdName,
  isOpen,
  onClose,
}: InviteModalProps) {
  const {
    invite,
    inviteLink,
    isLoading,
    generateInvite,
    error,
    clearError,
  } = useInvite(householdId);

  const [copied, setCopied] = useState<'link' | 'code' | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  // Generate invite if none exists when modal opens
  useEffect(() => {
    if (isOpen && !invite && !isLoading) {
      generateInvite().catch(() => {
        // Error is handled by the hook
      });
    }
  }, [isOpen, invite, isLoading, generateInvite]);

  // Clear copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(null), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  // Don't render if not open
  if (!isOpen) return null;

  /**
   * Copy link to clipboard
   */
  async function handleCopyLink() {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied('link');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  /**
   * Copy code to clipboard
   */
  async function handleCopyCode() {
    if (!invite) return;

    try {
      await navigator.clipboard.writeText(invite.code);
      setCopied('code');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  /**
   * Share via native share sheet (Web Share API)
   */
  async function handleShare() {
    if (!inviteLink || !navigator.share) return;

    setShareError(null);

    try {
      await navigator.share({
        title: `Join ${householdName} on DishCourse`,
        text: `Join my household on DishCourse to share dishes and meal plans!`,
        url: inviteLink,
      });
    } catch (err) {
      // User cancelled or share failed
      if ((err as Error).name !== 'AbortError') {
        setShareError('Unable to share. Try copying the link instead.');
      }
    }
  }

  /**
   * Handle modal close
   */
  function handleClose() {
    clearError();
    setShareError(null);
    setCopied(null);
    onClose();
  }

  // Check if Web Share API is available
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-modal-title"
      >
        <div
          className="rounded-2xl shadow-xl overflow-hidden"
          style={{ backgroundColor: 'var(--color-card)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 border-b"
            style={{ borderColor: 'var(--color-bg-muted)' }}
          >
            <h2
              id="invite-modal-title"
              className="text-lg font-semibold"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text)',
              }}
            >
              Invite to {householdName}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className={[
                'p-2 -mr-2 rounded-lg',
                'text-stone-400 hover:text-stone-600 hover:bg-stone-100',
                'transition-colors duration-150',
                'focus:outline-none focus-visible:ring-2',
              ].join(' ')}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {/* Loading state */}
            {isLoading && !invite && (
              <div className="text-center py-8">
                <div
                  className="w-12 h-12 mx-auto rounded-full animate-pulse"
                  style={{ backgroundColor: 'var(--color-bg-muted)' }}
                />
                <p
                  className="mt-4 text-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Generating invite...
                </p>
              </div>
            )}

            {/* Error state */}
            {error && !invite && (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{getUserFriendlyError(error)}</p>
                <Button
                  variant="secondary"
                  onClick={() => generateInvite()}
                  loading={isLoading}
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Invite details */}
            {invite && (
              <>
                {/* Invite link */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Share this link
                  </label>
                  <div className="flex gap-2">
                    <div
                      className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm truncate"
                      style={{
                        backgroundColor: 'var(--color-bg-muted)',
                        color: 'var(--color-text)',
                      }}
                    >
                      <Link size={16} className="flex-shrink-0" />
                      <span className="truncate">{inviteLink}</span>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={handleCopyLink}
                      aria-label="Copy link"
                    >
                      {copied === 'link' ? (
                        <Check size={18} className="text-green-500" />
                      ) : (
                        <Copy size={18} />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Invite code */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Or share this code
                  </label>
                  <div className="flex gap-2">
                    <div
                      className="flex-1 flex items-center justify-center py-3 rounded-lg font-mono text-2xl font-bold tracking-widest"
                      style={{
                        backgroundColor: 'var(--color-bg-muted)',
                        color: 'var(--color-text)',
                      }}
                    >
                      {invite.code}
                    </div>
                    <Button
                      variant="secondary"
                      onClick={handleCopyCode}
                      aria-label="Copy code"
                    >
                      {copied === 'code' ? (
                        <Check size={18} className="text-green-500" />
                      ) : (
                        <Copy size={18} />
                      )}
                    </Button>
                  </div>
                </div>

                {/* SMS invite - hidden until A2P 10DLC or Toll-Free registration
                <div
                  className="pt-4 border-t"
                  style={{ borderColor: 'var(--color-bg-muted)' }}
                >
                  <label
                    className="flex items-center gap-2 text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text)' }}
                  >
                    <MessageSquare size={16} />
                    Send invite via text message
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="tel"
                        label=""
                        placeholder="Phone number"
                        value={phoneNumber}
                        onChange={setPhoneNumber}
                        disabled={isSendingSms}
                        aria-label="Phone number for SMS invite"
                      />
                    </div>
                    <Button
                      variant="primary"
                      onClick={handleSendSms}
                      disabled={!phoneNumber.trim() || isSendingSms}
                      loading={isSendingSms}
                      aria-label="Send SMS invite"
                    >
                      <Send size={18} />
                    </Button>
                  </div>
                  {smsSuccess && (
                    <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                      <Check size={14} />
                      Invite sent!
                    </p>
                  )}
                  {smsError && (
                    <p className="mt-2 text-sm text-red-500">
                      {smsError}
                    </p>
                  )}
                </div>
                */}

                {/* Share button (if supported) */}
                {canShare && (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleShare}
                  >
                    <Share2 size={18} />
                    Share Invite
                  </Button>
                )}

                {shareError && (
                  <p className="text-center text-sm text-red-500">
                    {shareError}
                  </p>
                )}

                {/* Expiry note */}
                <p
                  className="text-center text-sm"
                  style={{ color: 'var(--color-text-light)' }}
                >
                  This invite expires in 7 days and can only be used once.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
