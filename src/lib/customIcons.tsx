import React from "react";
import { FaSalesforce } from "react-icons/fa6";

/**
 * Custom SVG components for major tech platforms that are not in react-icons/si
 */

export const SalesforceIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <FaSalesforce className={className} />
);

export const OpenAIIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zM8.307 13.918l-2.02-1.168a.08.08 0 0 1-.038-.057V7.11a4.504 4.504 0 0 1 7.37-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
  </svg>
);

export const TableauIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M11.39 0v2.42h1.22V0h-1.22zm-5.74 3.79v2.24h2.24V3.79H5.65zm11.48 0v2.24h2.24V3.79h-2.24zM11.39 4.3v5.47h1.22V4.3h-1.22zM0 11.39v1.22h2.42v-1.22H0zm4.3 0v1.22h5.47v-1.22H4.3zm9.93 0v1.22h5.47v-1.22h-5.47zm7.35 0v1.22H24v-1.22h-2.42zM11.39 14.23v5.47h1.22v-5.47h-1.22zm-5.74 3.98v2.24h2.24v-2.24H5.65zm11.48 0v2.24h2.24v-2.24h-2.24zM11.39 21.58V24h1.22v-2.42h-1.22z" />
  </svg>
);

export const PowerBIIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M14.5 2h5a1.5 1.5 0 0 1 1.5 1.5v17a1.5 1.5 0 0 1-1.5 1.5h-5a1.5 1.5 0 0 1-1.5-1.5v-17A1.5 1.5 0 0 1 14.5 2zm-6 6h4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zm-5.5 5h3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z" />
  </svg>
);

export const OracleIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16.36 17.59H7.64A5.64 5.64 0 0 1 2 11.95a5.64 5.64 0 0 1 5.64-5.64h8.72a5.64 5.64 0 0 1 5.64 5.64 5.64 5.64 0 0 1-5.64 5.64zm-8.72-8.91A3.27 3.27 0 0 0 4.37 12a3.27 3.27 0 0 0 3.27 3.27h8.72A3.27 3.27 0 0 0 19.63 12a3.27 3.27 0 0 0-3.27-3.27z" />
  </svg>
);

export const ServiceNowIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5.5z" />
  </svg>
);

export const CUSTOM_ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  SiSalesforce: SalesforceIcon,
  SiOpenai: OpenAIIcon,
  SiChatgpt: OpenAIIcon,
  SiTableau: TableauIcon,
  SiPowerbi: PowerBIIcon,
  SiOracle: OracleIcon,
  SiServicenow: ServiceNowIcon,
};
