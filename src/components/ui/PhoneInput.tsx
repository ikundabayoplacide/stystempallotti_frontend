import { useEffect, useRef, useState } from "react";
import { HiOutlineChevronDown, HiOutlineSearch } from "react-icons/hi";

// ─── Country data ─────────────────────────────────────────────────────────────

export interface Country {
  name: string;
  code: string;   // ISO 3166-1 alpha-2
  dial: string;   // e.g. "+250"
  flag: string;   // emoji flag
}

export const COUNTRIES: Country[] = [
  { name: "Rwanda",               code: "RW", dial: "+250", flag: "🇷🇼" },
  { name: "Afghanistan",          code: "AF", dial: "+93",  flag: "🇦🇫" },
  { name: "Albania",              code: "AL", dial: "+355", flag: "🇦🇱" },
  { name: "Algeria",              code: "DZ", dial: "+213", flag: "🇩🇿" },
  { name: "Angola",               code: "AO", dial: "+244", flag: "🇦🇴" },
  { name: "Argentina",            code: "AR", dial: "+54",  flag: "🇦🇷" },
  { name: "Australia",            code: "AU", dial: "+61",  flag: "🇦🇺" },
  { name: "Austria",              code: "AT", dial: "+43",  flag: "🇦🇹" },
  { name: "Belgium",              code: "BE", dial: "+32",  flag: "🇧🇪" },
  { name: "Benin",                code: "BJ", dial: "+229", flag: "🇧🇯" },
  { name: "Bolivia",              code: "BO", dial: "+591", flag: "🇧🇴" },
  { name: "Brazil",               code: "BR", dial: "+55",  flag: "🇧🇷" },
  { name: "Burkina Faso",         code: "BF", dial: "+226", flag: "🇧🇫" },
  { name: "Burundi",              code: "BI", dial: "+257", flag: "🇧🇮" },
  { name: "Cameroon",             code: "CM", dial: "+237", flag: "🇨🇲" },
  { name: "Canada",               code: "CA", dial: "+1",   flag: "🇨🇦" },
  { name: "Central African Rep.", code: "CF", dial: "+236", flag: "🇨🇫" },
  { name: "Chad",                 code: "TD", dial: "+235", flag: "🇹🇩" },
  { name: "Chile",                code: "CL", dial: "+56",  flag: "🇨🇱" },
  { name: "China",                code: "CN", dial: "+86",  flag: "🇨🇳" },
  { name: "Colombia",             code: "CO", dial: "+57",  flag: "🇨🇴" },
  { name: "Congo (DRC)",          code: "CD", dial: "+243", flag: "🇨🇩" },
  { name: "Congo (Republic)",     code: "CG", dial: "+242", flag: "🇨🇬" },
  { name: "Côte d'Ivoire",        code: "CI", dial: "+225", flag: "🇨🇮" },
  { name: "Denmark",              code: "DK", dial: "+45",  flag: "🇩🇰" },
  { name: "Djibouti",             code: "DJ", dial: "+253", flag: "🇩🇯" },
  { name: "Egypt",                code: "EG", dial: "+20",  flag: "🇪🇬" },
  { name: "Ethiopia",             code: "ET", dial: "+251", flag: "🇪🇹" },
  { name: "Finland",              code: "FI", dial: "+358", flag: "🇫🇮" },
  { name: "France",               code: "FR", dial: "+33",  flag: "🇫🇷" },
  { name: "Gabon",                code: "GA", dial: "+241", flag: "🇬🇦" },
  { name: "Gambia",               code: "GM", dial: "+220", flag: "🇬🇲" },
  { name: "Germany",              code: "DE", dial: "+49",  flag: "🇩🇪" },
  { name: "Ghana",                code: "GH", dial: "+233", flag: "🇬🇭" },
  { name: "Greece",               code: "GR", dial: "+30",  flag: "🇬🇷" },
  { name: "Guinea",               code: "GN", dial: "+224", flag: "🇬🇳" },
  { name: "India",                code: "IN", dial: "+91",  flag: "🇮🇳" },
  { name: "Indonesia",            code: "ID", dial: "+62",  flag: "🇮🇩" },
  { name: "Iran",                 code: "IR", dial: "+98",  flag: "🇮🇷" },
  { name: "Iraq",                 code: "IQ", dial: "+964", flag: "🇮🇶" },
  { name: "Ireland",              code: "IE", dial: "+353", flag: "🇮🇪" },
  { name: "Israel",               code: "IL", dial: "+972", flag: "🇮🇱" },
  { name: "Italy",                code: "IT", dial: "+39",  flag: "🇮🇹" },
  { name: "Japan",                code: "JP", dial: "+81",  flag: "🇯🇵" },
  { name: "Jordan",               code: "JO", dial: "+962", flag: "🇯🇴" },
  { name: "Kenya",                code: "KE", dial: "+254", flag: "🇰🇪" },
  { name: "Lebanon",              code: "LB", dial: "+961", flag: "🇱🇧" },
  { name: "Liberia",              code: "LR", dial: "+231", flag: "🇱🇷" },
  { name: "Libya",                code: "LY", dial: "+218", flag: "🇱🇾" },
  { name: "Madagascar",           code: "MG", dial: "+261", flag: "🇲🇬" },
  { name: "Malawi",               code: "MW", dial: "+265", flag: "🇲🇼" },
  { name: "Malaysia",             code: "MY", dial: "+60",  flag: "🇲🇾" },
  { name: "Mali",                 code: "ML", dial: "+223", flag: "🇲🇱" },
  { name: "Mauritania",           code: "MR", dial: "+222", flag: "🇲🇷" },
  { name: "Mauritius",            code: "MU", dial: "+230", flag: "🇲🇺" },
  { name: "Mexico",               code: "MX", dial: "+52",  flag: "🇲🇽" },
  { name: "Morocco",              code: "MA", dial: "+212", flag: "🇲🇦" },
  { name: "Mozambique",           code: "MZ", dial: "+258", flag: "🇲🇿" },
  { name: "Namibia",              code: "NA", dial: "+264", flag: "🇳🇦" },
  { name: "Netherlands",          code: "NL", dial: "+31",  flag: "🇳🇱" },
  { name: "New Zealand",          code: "NZ", dial: "+64",  flag: "🇳🇿" },
  { name: "Niger",                code: "NE", dial: "+227", flag: "🇳🇪" },
  { name: "Nigeria",              code: "NG", dial: "+234", flag: "🇳🇬" },
  { name: "Norway",               code: "NO", dial: "+47",  flag: "🇳🇴" },
  { name: "Pakistan",             code: "PK", dial: "+92",  flag: "🇵🇰" },
  { name: "Philippines",          code: "PH", dial: "+63",  flag: "🇵🇭" },
  { name: "Poland",               code: "PL", dial: "+48",  flag: "🇵🇱" },
  { name: "Portugal",             code: "PT", dial: "+351", flag: "🇵🇹" },
  { name: "Saudi Arabia",         code: "SA", dial: "+966", flag: "🇸🇦" },
  { name: "Senegal",              code: "SN", dial: "+221", flag: "🇸🇳" },
  { name: "Sierra Leone",         code: "SL", dial: "+232", flag: "🇸🇱" },
  { name: "Somalia",              code: "SO", dial: "+252", flag: "🇸🇴" },
  { name: "South Africa",         code: "ZA", dial: "+27",  flag: "🇿🇦" },
  { name: "South Korea",          code: "KR", dial: "+82",  flag: "🇰🇷" },
  { name: "South Sudan",          code: "SS", dial: "+211", flag: "🇸🇸" },
  { name: "Spain",                code: "ES", dial: "+34",  flag: "🇪🇸" },
  { name: "Sudan",                code: "SD", dial: "+249", flag: "🇸🇩" },
  { name: "Sweden",               code: "SE", dial: "+46",  flag: "🇸🇪" },
  { name: "Switzerland",          code: "CH", dial: "+41",  flag: "🇨🇭" },
  { name: "Tanzania",             code: "TZ", dial: "+255", flag: "🇹🇿" },
  { name: "Thailand",             code: "TH", dial: "+66",  flag: "🇹🇭" },
  { name: "Togo",                 code: "TG", dial: "+228", flag: "🇹🇬" },
  { name: "Tunisia",              code: "TN", dial: "+216", flag: "🇹🇳" },
  { name: "Turkey",               code: "TR", dial: "+90",  flag: "🇹🇷" },
  { name: "Uganda",               code: "UG", dial: "+256", flag: "🇺🇬" },
  { name: "Ukraine",              code: "UA", dial: "+380", flag: "🇺🇦" },
  { name: "United Arab Emirates", code: "AE", dial: "+971", flag: "🇦🇪" },
  { name: "United Kingdom",       code: "GB", dial: "+44",  flag: "🇬🇧" },
  { name: "United States",        code: "US", dial: "+1",   flag: "🇺🇸" },
  { name: "Zambia",               code: "ZM", dial: "+260", flag: "🇿🇲" },
  { name: "Zimbabwe",             code: "ZW", dial: "+263", flag: "🇿🇼" },
];

const DEFAULT_COUNTRY = COUNTRIES[0]; // Rwanda

// Parse a full phone string like "+250788000004" into { country, localNumber }
function parsePhone(full: string): { country: Country; localNumber: string } {
  if (!full) return { country: DEFAULT_COUNTRY, localNumber: "" };
  // Sort by dial length descending so "+1868" matches before "+1"
  const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  const match = sorted.find((c) => full.startsWith(c.dial));
  if (match) {
    return { country: match, localNumber: full.slice(match.dial.length).replace(/\D/g, "") };
  }
  return { country: DEFAULT_COUNTRY, localNumber: full.replace(/\D/g, "") };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface PhoneInputProps {
  value: string;
  onChange: (fullNumber: string) => void;
  error?: string;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PhoneInput({ value, onChange, error, className = "" }: PhoneInputProps) {
  // Parse initial value so edit mode pre-fills correctly
  const parsed = parsePhone(value);
  const [selected, setSelected] = useState<Country>(parsed.country);
  const [number, setNumber] = useState(parsed.localNumber);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync full number upward whenever dial code or number changes
  useEffect(() => {
    onChange(number ? `${selected.dial}${number}` : "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, number]);

  // Keep local number in sync if parent resets value to ""
  useEffect(() => {
    if (value === "") setNumber("");
  }, [value]);

  const filtered = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search)
  );

  const handleSelect = (country: Country) => {
    setSelected(country);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`flex items-center rounded-xl border ${
          error ? "border-red-400" : "border-custom-300"
        } bg-white overflow-hidden focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20`}
      >
        {/* Country selector trigger */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 px-3 py-2 border-r border-custom-300 bg-custom-50 hover:bg-custom-100 transition-colors shrink-0 h-full"
        >
          <span className="text-lg leading-none">{selected.flag}</span>
          <span className="text-sm font-semibold text-secondary-100">{selected.dial}</span>
          <HiOutlineChevronDown
            className={`w-3.5 h-3.5 text-custom-700 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* Number input */}
        <input
          type="tel"
          value={number}
          onChange={(e) => setNumber(e.target.value.replace(/\D/g, ""))}
          placeholder="7XXXXXXXX"
          className="flex-1 px-3 py-2 text-sm outline-none bg-transparent text-secondary-100 placeholder:text-custom-500"
        />
      </div>

      {/* Error */}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-72 bg-white border border-custom-300 rounded-xl shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-custom-200">
            <div className="relative">
              <HiOutlineSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-500" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country..."
                className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-custom-300 outline-none focus:border-primary-500"
              />
            </div>
          </div>

          {/* List */}
          <ul className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-custom-500 text-center">No results</li>
            ) : (
              filtered.map((country) => (
                <li key={country.code}>
                  <button
                    type="button"
                    onClick={() => handleSelect(country)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-custom-50 transition-colors text-left ${
                      selected.code === country.code ? "bg-primary-50 font-semibold" : ""
                    }`}
                  >
                    <span className="text-lg leading-none">{country.flag}</span>
                    <span className="flex-1 text-secondary-100">{country.name}</span>
                    <span className="text-custom-500 text-xs">{country.dial}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
