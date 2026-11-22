"use client";

import clsx from "clsx";

export type PhoneCountrySpec = {
  code: string;
  dial: string;
  label: string;
  placeholder: string;
  pattern: RegExp;
  hint: string;
};

export const PHONE_COUNTRIES: PhoneCountrySpec[] = [
  { code: "BGD", dial: "+880", label: "BD +880", placeholder: "1712345678", pattern: /^1[3-9]\d{8}$/, hint: "10 digits starting with 1 (e.g. 1712345678)" },
  { code: "UAE", dial: "+971", label: "AE +971", placeholder: "501234567", pattern: /^5\d{8}$/, hint: "9 digits starting with 5 (e.g. 501234567)" },
  { code: "SAU", dial: "+966", label: "SA +966", placeholder: "501234567", pattern: /^5\d{8}$/, hint: "9 digits starting with 5 (e.g. 501234567)" },
  { code: "QAT", dial: "+974", label: "QA +974", placeholder: "55123456", pattern: /^[3567]\d{7}$/, hint: "8 digits starting with 3, 5, 6, or 7" },
  { code: "USA", dial: "+1", label: "US +1", placeholder: "4155550199", pattern: /^[2-9]\d{9}$/, hint: "10-digit US mobile number" },
  { code: "GBR", dial: "+44", label: "UK +44", placeholder: "7700900123", pattern: /^7\d{9}$/, hint: "10 digits starting with 7 (e.g. 7700900123)" },
  { code: "BHR", dial: "+973", label: "BH +973", placeholder: "36123456", pattern: /^\d{8}$/, hint: "8-digit Bahrain mobile number" },
  { code: "OMN", dial: "+968", label: "OM +968", placeholder: "92123456", pattern: /^[79]\d{7}$/, hint: "8 digits starting with 7 or 9" },
  { code: "KWT", dial: "+965", label: "KW +965", placeholder: "51234567", pattern: /^[569]\d{7}$/, hint: "8 digits starting with 5, 6, or 9" },
  { code: "SGP", dial: "+65", label: "SG +65", placeholder: "81234567", pattern: /^[89]\d{7}$/, hint: "8 digits starting with 8 or 9" },
  { code: "MYS", dial: "+60", label: "MY +60", placeholder: "123456789", pattern: /^1\d{8,9}$/, hint: "9–10 digits starting with 1" },
];

export function resolvePhoneSpec(countryCode: string): PhoneCountrySpec {
  const norm = countryCode.trim().toUpperCase();
  const alias = norm === "KSA" ? "SAU" : norm === "ARE" ? "UAE" : norm === "UK" ? "GBR" : norm;
  return PHONE_COUNTRIES.find((c) => c.code === alias) ?? PHONE_COUNTRIES[0];
}

export function normalizeNationalDigits(raw: string): string {
  return raw.replace(/\D/g, "").replace(/^0+/, "");
}

export function validateCountryPhone(countryCode: string, rawNumber: string): string | null {
  const spec = resolvePhoneSpec(countryCode);
  const digits = normalizeNationalDigits(rawNumber);
  if (!digits) return `Mobile number is required (${spec.dial}).`;
  if (!spec.pattern.test(digits)) {
    return `Enter a valid ${spec.code} mobile number: ${spec.hint}.`;
  }
  return null;
}

export function formatE164(countryCode: string, rawNumber: string): string {
  const spec = resolvePhoneSpec(countryCode);
  return `${spec.dial}${normalizeNationalDigits(rawNumber)}`;
}

export function CountryPhoneInput({
  countryCode,
  onCountryChange,
  value,
  onChange,
  label = "Mobile number *",
  required = true,
  className = "",
}: {
  countryCode: string;
  onCountryChange: (code: string) => void;
  value: string;
  onChange: (val: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}) {
  const spec = resolvePhoneSpec(countryCode);
  const err = value.trim() ? validateCountryPhone(spec.code, value) : null;

  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      <span className="text-xs font-medium text-muted">{label}</span>
      <div className="flex gap-2">
        <select
          aria-label="Country dial code"
          value={spec.code}
          onChange={(e) => onCountryChange(e.target.value)}
          className="h-11 w-[116px] shrink-0 rounded-lg border border-line bg-white px-2.5 text-sm font-medium text-ink outline-none focus:border-primary"
        >
          {PHONE_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          type="tel"
          inputMode="tel"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={spec.placeholder}
          aria-invalid={!!err}
          className={clsx(
            "h-11 min-w-0 flex-1 rounded-lg border bg-white px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-subtle focus:ring-4 focus:ring-primary/10",
            err ? "border-danger focus:border-danger" : "border-line focus:border-primary",
          )}
        />
      </div>
      <span className={clsx("text-[11px]", err ? "font-medium text-danger" : "text-muted")}>
        {err ?? `${spec.dial} · ${spec.hint}`}
      </span>
    </div>
  );
}
