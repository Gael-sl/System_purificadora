export default function BrandMark({ className = "", size = 28 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12 2.2L3.8 9.6L12 21.8L20.2 9.6L12 2.2Z" fill="currentColor" opacity="0.18" />
      <path d="M12 2.2L3.8 9.6L12 21.8L20.2 9.6L12 2.2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M3.8 9.6H20.2M7.6 9.6L12 21.8L16.4 9.6" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M9 9.6L12 5.3L15 9.6" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}
