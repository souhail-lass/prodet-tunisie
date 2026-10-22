import 'server-only';

import tls from 'node:tls';

/**
 * Drop a message in the connected Gmail account's Drafts folder via IMAP.
 *
 * Gmail app passwords do not expire the way an unverified OAuth refresh
 * token does, and IMAP APPEND is enough: the draft is left unsent so a
 * human still presses Send. No extra npm dependency.
 */

const IMAP_HOST = 'imap.gmail.com';
const IMAP_PORT = 993;
const IMAP_TIMEOUT_MS = 20_000;

export function gmailDraftConfigured(): boolean {
  return Boolean(gmailUser() && gmailAppPassword());
}

export function draftsMailboxFromList(lines: string[]): string | null {
  for (const line of lines) {
    if (!line.startsWith('* LIST ') || !line.includes('\\Drafts')) continue;
    const quoted = line.match(/"((?:\\"|[^"])*)"\s*$/);
    if (quoted?.[1]) return quoted[1].replace(/\\"/g, '"');
  }
  return null;
}

export function buildMimeMessage(input: {
  from: string;
  to?: string | null;
  subject: string;
  text: string;
  html: string;
  attachments?: { filename: string; contentType: string; data: Uint8Array }[];
}): string {
  const mixed = boundary('mix');
  const alt = boundary('alt');
  const to = safeHeader(input.to);
  const chunks: string[] = [
    'MIME-Version: 1.0',
    `Date: ${new Date().toUTCString()}`,
    `From: ${input.from}`,
    to ? `To: ${to}` : 'To:',
    `Subject: ${encodeSubject(input.subject)}`,
    `Content-Type: multipart/mixed; boundary="${mixed}"`,
    '',
    `--${mixed}`,
    `Content-Type: multipart/alternative; boundary="${alt}"`,
    '',
    `--${alt}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    wrapBase64(Buffer.from(input.text, 'utf8').toString('base64')),
    '',
    `--${alt}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    wrapBase64(Buffer.from(input.html, 'utf8').toString('base64')),
    '',
    `--${alt}--`,
  ];

  for (const file of input.attachments ?? []) {
    const filename = safeFilename(file.filename);
    chunks.push(
      '',
      `--${mixed}`,
      `Content-Type: ${file.contentType}; name="${filename}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${filename}"`,
      '',
      wrapBase64(Buffer.from(file.data).toString('base64')),
    );
  }

  chunks.push('', `--${mixed}--`, '');
  return chunks.join('\r\n');
}

export async function createGmailDraft(input: {
  to?: string | null;
  subject: string;
  text: string;
  html: string;
  attachments?: { filename: string; contentType: string; data: Uint8Array }[];
}): Promise<'created' | 'skipped' | 'failed'> {
  const user = gmailUser();
  const password = gmailAppPassword();
  if (!user || !password) return 'skipped';

  const mime = buildMimeMessage({
    from: `Prodet Tunisie <${user}>`,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
    attachments: input.attachments,
  });

  try {
    await appendToDrafts(user, password, mime);
    return 'created';
  } catch (error) {
    console.error('[gmail-draft:failed]', error instanceof Error ? error.message : error);
    return 'failed';
  }
}

function gmailUser(): string | null {
  const user = process.env.GMAIL_USER?.trim().toLowerCase();
  if (!user || !user.includes('@') || /[\r\n]/.test(user)) return null;
  return user;
}

function gmailAppPassword(): string | null {
  const password = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '').trim();
  if (!password) return null;
  return password;
}

function safeHeader(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed || /[\r\n]/.test(trimmed)) return null;
  return trimmed;
}

function encodeSubject(subject: string): string {
  const clean = subject.replace(/[\r\n]+/g, ' ').trim();
  if (/^[\u0020-\u007E]*$/.test(clean)) return clean;
  return `=?UTF-8?B?${Buffer.from(clean, 'utf8').toString('base64')}?=`;
}

function safeFilename(name: string): string {
  const cleaned = name.replace(/[^\w.\-]+/g, '-').replace(/-+/g, '-');
  return cleaned.slice(0, 80) || 'devis.pdf';
}

function wrapBase64(value: string): string {
  return value.replace(/(.{76})/g, '$1\r\n');
}

function boundary(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

function quoteImap(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

async function appendToDrafts(user: string, password: string, mime: string): Promise<void> {
  const socket = tls.connect({ host: IMAP_HOST, port: IMAP_PORT, servername: IMAP_HOST });
  const reader = new LineReader(socket);
  try {
    const greeting = await reader.nextLine();
    if (!greeting.startsWith('* OK')) throw new Error('imap greeting rejected');

    const login = await reader.tagged('A1', `LOGIN ${quoteImap(user)} ${quoteImap(password)}`);
    if (!login.ok) throw new Error('imap login failed');

    const list = await reader.tagged('A2', 'LIST "" "[Gmail]/*"');
    const mailbox = draftsMailboxFromList(list.lines) ?? '[Gmail]/Drafts';
    const payload = Buffer.from(mime, 'utf8');
    const appended = await reader.tagged(
      'A3',
      `APPEND ${quoteImap(mailbox)} (\\Draft) {${payload.length}}`,
      payload,
    );
    if (!appended.ok) throw new Error('imap append failed');
  } finally {
    try {
      socket.write('A4 LOGOUT\r\n');
    } catch {
      // Socket may already be gone.
    }
    socket.destroy();
  }
}

class LineReader {
  private buffer = '';
  private queue: string[] = [];
  private waiters: Array<{
    resolve: (line: string) => void;
    reject: (error: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  }> = [];
  private failed: Error | null = null;

  constructor(private readonly socket: tls.TLSSocket) {
    socket.setEncoding('utf8');
    socket.on('data', (chunk: string) => {
      this.buffer += chunk;
      let index = this.buffer.indexOf('\r\n');
      while (index >= 0) {
        const line = this.buffer.slice(0, index);
        this.buffer = this.buffer.slice(index + 2);
        this.push(line);
        index = this.buffer.indexOf('\r\n');
      }
    });
    socket.on('error', (error) => {
      this.fail(error instanceof Error ? error : new Error('imap socket error'));
    });
    socket.on('end', () => {
      this.fail(new Error('imap connection closed'));
    });
  }

  async tagged(
    tag: string,
    command: string,
    literal?: Buffer,
  ): Promise<{ ok: boolean; lines: string[] }> {
    const lines: string[] = [];
    this.socket.write(`${tag} ${command}\r\n`);
    if (literal) {
      const cont = await this.nextLine();
      lines.push(cont);
      if (!cont.startsWith('+')) return { ok: false, lines };
      this.socket.write(literal);
      this.socket.write('\r\n');
    }
    for (;;) {
      const line = await this.nextLine();
      lines.push(line);
      if (line.startsWith(`${tag} `)) return { ok: line.startsWith(`${tag} OK`), lines };
    }
  }

  nextLine(): Promise<string> {
    if (this.failed) return Promise.reject(this.failed);
    const queued = this.queue.shift();
    if (queued !== undefined) return Promise.resolve(queued);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.fail(new Error('imap timeout'));
      }, IMAP_TIMEOUT_MS);
      this.waiters.push({ resolve, reject, timer });
    });
  }

  private push(line: string): void {
    const waiter = this.waiters.shift();
    if (!waiter) {
      this.queue.push(line);
      return;
    }
    clearTimeout(waiter.timer);
    waiter.resolve(line);
  }

  private fail(error: Error): void {
    if (this.failed) return;
    this.failed = error;
    while (this.waiters.length > 0) {
      const waiter = this.waiters.shift();
      if (!waiter) break;
      clearTimeout(waiter.timer);
      waiter.reject(error);
    }
  }
}
