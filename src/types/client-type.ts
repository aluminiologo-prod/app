/**
 * Public-facing ClientType shape returned by `GET /client-types/public`.
 * Minimal fields — the mobile app only needs enough to render the picker in
 * the self-registration wizard.
 */
export interface PublicClientType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon_name: string | null;
}
