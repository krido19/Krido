import { STADIUM_INFO } from './worldCupConstants';

export const getStadiumTimezone = (stadiumId) => {
  return {
    "1": "-06:00", "2": "-06:00", "3": "-06:00", // Mexico (CST)
    "4": "-05:00", "5": "-05:00", "6": "-05:00", // Central US (CDT)
    "13": "-07:00", "14": "-07:00", "15": "-07:00", "16": "-07:00" // Pacific (PDT)
  }[stadiumId] || "-04:00"; // Default Eastern (EDT)
};

export const formatMatchDateTime = (localDateStr, stadiumId) => {
  if (!localDateStr) return 'TBD';
  const tzOffset = getStadiumTimezone(stadiumId);
  const dateObj = new Date(localDateStr.replace(/-/g, '/') + " " + tzOffset);
  if (isNaN(dateObj)) return localDateStr + ' WIB';
  const dateString = dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' }).toUpperCase();
  const timeString = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).replace('.', ':') + ' WIB';
  return `${dateString}, ${timeString}`;
};

export const getInitials = (name) => {
  if (!name) return "TBD";
  const words = name.split(' ');
  if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
  if (words.length === 2) return (words[0].substring(0, 2) + words[1][0]).toUpperCase();
  return name.substring(0, 3).toUpperCase();
};
