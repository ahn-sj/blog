type SocialLinksProps = {
  github: string;
  linkedin: string;
  email: string;
};

export function SocialLinks({ github, linkedin, email }: SocialLinksProps) {
  return (
    <div className="social" aria-label="소셜 링크">
      <a href={github} aria-label="GitHub" rel="noreferrer" target="_blank">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.36 6.84 9.72.5.1.68-.22.68-.5v-1.74c-2.78.62-3.37-1.38-3.37-1.38-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05A9.4 9.4 0 0 1 12 6.94c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.95.68 1.92v2.85c0 .28.18.6.69.5A10.25 10.25 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
        </svg>
      </a>
      <a href={linkedin} aria-label="LinkedIn" rel="noreferrer" target="_blank">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5.001 2.5 2.5 0 0 1 0-5ZM3 9.75h4v10.75H3V9.75Zm6.25 0h3.84v1.47h.05c.54-.96 1.85-1.97 3.8-1.97 4.07 0 4.81 2.68 4.81 6.16v5.09h-4v-4.52c0-1.08-.02-2.47-1.5-2.47-1.51 0-1.74 1.18-1.74 2.39v4.6h-4V9.75Z" />
        </svg>
      </a>
      <a href={`mailto:${email}`} aria-label="Email">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16v12H4z" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      </a>
    </div>
  );
}
