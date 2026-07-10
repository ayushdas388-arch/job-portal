import { FaLinkedin, FaGithub, FaYoutube, FaTelegram, FaGoogle, FaExternalLinkAlt, FaBriefcase } from 'react-icons/fa';
import { SiIndeed, SiGlassdoor, SiLeetcode, SiGeeksforgeeks, SiCoursera, SiUdemy } from 'react-icons/si';

export default function BrandIcon({ url = '', name = '', className = '' }) {
  const target = (url + ' ' + name).toLowerCase();

  if (target.includes('linkedin')) {
    return <FaLinkedin className={`text-[#0A66C2] ${className}`} />;
  }
  if (target.includes('indeed')) {
    return <SiIndeed className={`text-[#003A9B] ${className}`} />;
  }
  if (target.includes('glassdoor')) {
    return <SiGlassdoor className={`text-[#0CAA41] ${className}`} />;
  }
  if (target.includes('github')) {
    return <FaGithub className={`text-slate-800 dark:text-white ${className}`} />;
  }
  if (target.includes('leetcode')) {
    return <SiLeetcode className={`text-[#FFA116] ${className}`} />;
  }
  if (target.includes('geeksforgeeks')) {
    return <SiGeeksforgeeks className={`text-[#2F8D46] ${className}`} />;
  }
  if (target.includes('youtube')) {
    return <FaYoutube className={`text-[#FF0000] ${className}`} />;
  }
  if (target.includes('telegram') || target.includes('t.me')) {
    return <FaTelegram className={`text-[#26A5E4] ${className}`} />;
  }
  if (target.includes('google')) {
    return <FaGoogle className={`text-[#4285F4] ${className}`} />;
  }
  if (target.includes('coursera')) {
    return <SiCoursera className={`text-[#0056D2] ${className}`} />;
  }
  if (target.includes('udemy')) {
    return <SiUdemy className={`text-[#A435F0] ${className}`} />;
  }
  if (target.includes('naukri') || target.includes('adzuna') || target.includes('foundit') || target.includes('monster')) {
    return <FaBriefcase className={`text-slate-500 ${className}`} />;
  }

  // Default external link icon
  return <FaExternalLinkAlt className={`text-slate-400 ${className}`} />;
}
