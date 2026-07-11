import { FaLinkedin, FaGithub, FaYoutube, FaTelegram, FaGoogle, FaExternalLinkAlt, FaBriefcase, FaGraduationCap, FaAngellist, FaAward, FaTrain, FaUniversity } from 'react-icons/fa';
import { SiIndeed, SiGlassdoor, SiLeetcode, SiGeeksforgeeks, SiCoursera, SiUdemy } from 'react-icons/si';

export default function BrandIcon({ url = '', name = '', className = '' }) {
  const target = (url + ' ' + name).toLowerCase();

  const wrap = (icon) => (
    <span className={`inline-flex items-center justify-center wander-bg-white rounded-md p-0.5 shadow-sm border border-slate-200/80 shrink-0 overflow-hidden ${className}`}>
      {icon}
    </span>
  );

  if (target.includes('linkedin')) {
    return wrap(<FaLinkedin className="text-[#0A66C2] w-full h-full" />);
  }
  if (target.includes('indeed')) {
    return wrap(<SiIndeed className="text-[#003A9B] w-full h-full" />);
  }
  if (target.includes('glassdoor')) {
    return wrap(<SiGlassdoor className="text-[#0CAA41] w-full h-full" />);
  }
  if (target.includes('github')) {
    return wrap(<FaGithub className="text-slate-800 w-full h-full" />);
  }
  if (target.includes('leetcode')) {
    return wrap(<SiLeetcode className="text-[#FFA116] w-full h-full" />);
  }
  if (target.includes('geeksforgeeks')) {
    return wrap(<SiGeeksforgeeks className="text-[#2F8D46] w-full h-full" />);
  }
  if (target.includes('youtube')) {
    return wrap(<FaYoutube className="text-[#FF0000] w-full h-full" />);
  }
  if (target.includes('telegram') || target.includes('t.me')) {
    return wrap(<FaTelegram className="text-[#26A5E4] w-full h-full" />);
  }
  if (target.includes('google')) {
    return wrap(<FaGoogle className="text-[#4285F4] w-full h-full" />);
  }
  if (target.includes('coursera')) {
    return wrap(<SiCoursera className="text-[#0056D2] w-full h-full" />);
  }
  if (target.includes('udemy')) {
    return wrap(<SiUdemy className="text-[#A435F0] w-full h-full" />);
  }
  if (target.includes('internshala')) {
    return wrap(<FaGraduationCap className="text-[#008cff] w-full h-full" />);
  }
  if (target.includes('wellfound') || target.includes('angellist')) {
    return wrap(<FaAngellist className="text-[#0f172a] w-full h-full" />);
  }
  if (target.includes('naukri')) {
    return wrap(<FaBriefcase className="text-[#005c97] w-full h-full" />);
  }
  if (target.includes('foundit') || target.includes('monster')) {
    return wrap(<FaBriefcase className="text-[#8e24aa] w-full h-full" />);
  }
  if (target.includes('upsc')) {
    return wrap(<UpscIcon />);
  }
  if (target.includes('rrb') || target.includes('railway')) {
    return wrap(<RrbIcon />);
  }
  if (target.includes('ibps')) {
    return wrap(<IbpsIcon />);
  }
  if (target.includes('ssc')) {
    return wrap(<SscIcon />);
  }
  if (target.includes('ncs')) {
    return wrap(<NcsIcon />);
  }

  // Default external link icon
  return wrap(<FaExternalLinkAlt className="text-slate-400 w-full h-full" />);
}

// Custom High-Quality SVG Icons for Government Portals to ensure 100% availability and bypass bot-traffic blocking
function UpscIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full object-contain">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#b8860b" strokeWidth="6" />
      <circle cx="50" cy="50" r="38" fill="#fcf8f2" />
      <circle cx="50" cy="45" r="15" fill="none" stroke="#000080" strokeWidth="2" />
      {[...Array(24)].map((_, i) => (
        <line
          key={i}
          x1="50"
          y1="45"
          x2={50 + 15 * Math.cos((i * 15 * Math.PI) / 180)}
          y2={45 + 15 * Math.sin((i * 15 * Math.PI) / 180)}
          stroke="#000080"
          strokeWidth="1"
        />
      ))}
      <text x="50" y="80" textAnchor="middle" fill="#b8860b" fontSize="12" fontWeight="900" fontFamily="sans-serif">UPSC</text>
    </svg>
  );
}

function RrbIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full object-contain">
      <circle cx="50" cy="50" r="45" fill="#00529b" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="#ffffff" strokeWidth="2" />
      <path d="M30 65 L70 65 L70 58 L65 52 L35 52 L30 58 Z" fill="#ffffff" />
      <path d="M35 50 L65 50 L60 40 L40 40 Z" fill="#ffffff" />
      <line x1="20" y1="75" x2="80" y2="75" stroke="#ffffff" strokeWidth="3" />
      <line x1="30" y1="70" x2="30" y2="75" stroke="#ffffff" strokeWidth="2" />
      <line x1="50" y1="70" x2="50" y2="75" stroke="#ffffff" strokeWidth="2" />
      <line x1="70" y1="70" x2="70" y2="75" stroke="#ffffff" strokeWidth="2" />
      <text x="50" y="32" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900" fontFamily="sans-serif">INDIAN</text>
      <text x="50" y="22" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">RAILWAYS</text>
    </svg>
  );
}

function IbpsIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full object-contain">
      <rect x="15" y="15" width="70" height="70" rx="15" fill="#1e3a8a" />
      <path d="M35 35 H65 V55 C65 65 50 75 50 75 C50 75 35 65 35 55 Z" fill="none" stroke="#ffffff" strokeWidth="5" />
      <text x="50" y="52" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900" fontFamily="sans-serif">IBPS</text>
    </svg>
  );
}

function SscIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full object-contain">
      <circle cx="50" cy="50" r="45" fill="#dc2626" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="#ffffff" strokeWidth="3" />
      <polygon points="50,25 57,40 73,40 60,50 65,65 50,55 35,65 40,50 27,40 43,40" fill="#facc15" />
      <text x="50" y="82" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="900" fontFamily="sans-serif">SSC</text>
    </svg>
  );
}

function NcsIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full object-contain">
      <circle cx="50" cy="50" r="45" fill="#f8fafc" />
      <circle cx="32" cy="40" r="8" fill="#ef4444" />
      <path d="M22 65 C22 53 32 50 32 50 C32 50 42 53 42 65 Z" fill="#ef4444" />
      <circle cx="50" cy="35" r="8" fill="#3b82f6" />
      <path d="M40 60 C40 48 50 45 50 45 C50 45 60 48 60 60 Z" fill="#3b82f6" />
      <circle cx="68" cy="40" r="8" fill="#10b981" />
      <path d="M58 65 C58 53 68 50 68 50 C68 50 78 53 78 65 Z" fill="#10b981" />
      <text x="50" y="85" textAnchor="middle" fill="#1e293b" fontSize="13" fontWeight="900" fontFamily="sans-serif">NCS</text>
    </svg>
  );
}
