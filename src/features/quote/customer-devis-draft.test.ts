import { describe, expect, it } from 'vitest';
import {
  buildMimeMessage,
  draftsMailboxFromList,
  messageIdFromImapFetch,
  replySubject,
} from '@/lib/gmail-draft';
import { buildCustomerDevisCopy } from './customer-devis-draft';

describe('draftsMailboxFromList', () => {
  it('picks the Gmail drafts mailbox, French or English', () => {
    expect(
      draftsMailboxFromList([
        '* LIST (\\HasNoChildren) "/" "[Gmail]/Messages envoyés"',
        '* LIST (\\HasNoChildren \\Drafts) "/" "[Gmail]/Brouillons"',
        'A2 OK Success',
      ]),
    ).toBe('[Gmail]/Brouillons');

    expect(draftsMailboxFromList(['* LIST (\\Drafts \\HasNoChildren) "/" "[Gmail]/Drafts"'])).toBe(
      '[Gmail]/Drafts',
    );
  });
});

describe('buildCustomerDevisCopy', () => {
  it('writes a send-ready customer note with the Swiver reference', () => {
    const copy = buildCustomerDevisCopy({
      referenceCode: 'QUO-2026-0001',
      swiverRef: 'DV-1042',
      to: 'client@example.com',
      hasPdf: true,
    });
    expect(copy.subject).toBe('Votre devis Prodet - DV-1042');
    expect(copy.text).toContain('Bonjour,');
    expect(copy.text).toContain('Voici votre devis.');
    expect(copy.text).not.toContain("Avant d'envoyer");
    expect(copy.text).not.toContain('Cordialement');
    expect(copy.html).not.toContain('contact@prodet.com.tn');
  });

  it('flags a missing address and a missing PDF for the operator', () => {
    const copy = buildCustomerDevisCopy({
      referenceCode: 'QUO-2026-0001',
      swiverRef: null,
      to: null,
      phoneHint: '98 000 000',
      hasPdf: false,
    });
    expect(copy.text).toContain("renseigner l'email");
    expect(copy.text).toContain('98 000 000');
    expect(copy.text).toContain('PDF Swiver');
    expect(copy.subject).toContain('QUO-2026-0001');
  });
});

describe('buildMimeMessage', () => {
  it('addresses the client and attaches the devis PDF', () => {
    const mime = buildMimeMessage({
      from: 'Prodet Tunisie <prodet.tunisie@gmail.com>',
      to: 'client@example.com',
      subject: 'Votre devis Prodet - DV-1042',
      text: 'Bonjour,\n\nVoici votre devis.',
      html: '<p>Voici votre devis.</p>',
      attachments: [
        {
          filename: 'devis-DV-1042.pdf',
          contentType: 'application/pdf',
          data: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
        },
      ],
    });
    expect(mime).toContain('To: client@example.com');
    expect(mime).toContain('Subject: Votre devis Prodet - DV-1042');
    expect(mime).toContain('filename="devis-DV-1042.pdf"');
    expect(mime).toContain('Content-Type: application/pdf');
  });

  it('leaves To empty when the client gave no email', () => {
    const mime = buildMimeMessage({
      from: 'Prodet Tunisie <prodet.tunisie@gmail.com>',
      to: null,
      subject: 'Votre devis Prodet',
      text: 'Bonjour,',
      html: '<p>Bonjour,</p>',
    });
    expect(mime).toContain('To:\r\n');
    expect(mime).not.toContain('filename=');
  });

  it('threads the draft onto the inbox notification', () => {
    const messageId = '<abc123@mail.resend.com>';
    const mime = buildMimeMessage({
      from: 'Prodet Tunisie <prodet.tunisie@gmail.com>',
      to: 'client@example.com',
      subject: replySubject('Demande de devis QUO-2026-PZ3V - souhail test'),
      text: 'Bonjour,',
      html: '<p>Bonjour,</p>',
      inReplyTo: messageId,
    });
    expect(mime).toContain('Subject: Re: Demande de devis QUO-2026-PZ3V - souhail test');
    expect(mime).toContain(`In-Reply-To: ${messageId}`);
    expect(mime).toContain(`References: ${messageId}`);
    expect(replySubject('Re: Demande de devis QUO-2026-PZ3V')).toBe(
      'Re: Demande de devis QUO-2026-PZ3V',
    );
    expect(
      messageIdFromImapFetch([
        '* 4 FETCH (UID 9 BODY[HEADER.FIELDS (MESSAGE-ID)] {40}',
        `Message-ID: ${messageId}`,
        ')',
        'A5 OK Success',
      ]),
    ).toBe(messageId);
  });
});
