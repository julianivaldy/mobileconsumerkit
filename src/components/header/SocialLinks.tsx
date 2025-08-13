
import React from 'react';

const socialLinks = [
  {
    href: "https://www.linkedin.com/in/julianivaldy/",
    src: "/uploads/ac3b60b9-4a44-443e-823b-4845ff625df7.png",
    alt: "LinkedIn"
  },
  {
    href: "https://julianivaldy.medium.com/",
    src: "/uploads/38611089-37dc-41e8-b345-200b47fa1277.png",
    alt: "Medium"
  },
  {
    href: "https://julianivaldy.substack.com/feed",
    src: "/uploads/bb91a37a-72d7-4300-a14d-e7311b0c9201.png",
    alt: "RSS"
  },
  {
    href: "https://x.com/julianivaldy",
    src: "/uploads/0b8a1c66-2e82-4779-b3a2-e9a79f21ecdb.png",
    alt: "X"
  }
];

const SocialLinks: React.FC = () => {
  return (
    <div className="flex gap-2 items-center">
      {socialLinks.map((link) => (
        <a 
          key={link.alt}
          href={link.href} 
          className="hover:opacity-80 transition-opacity" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <img 
            src={link.src} 
            alt={link.alt} 
            width={28} 
            height={28} 
            style={{ borderRadius: '4px' }} 
          />
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
