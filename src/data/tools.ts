

export interface Tool {
  id: number;
  name: string;
  description: string;
  status: string;
  link: string;
  category: string;
  beta?: boolean;
}

export const useToolsData = () => {
  return [
    {
      id: 1,
      name: "Idea Scan",
      description: "Get feedback from industry experts on your app idea.",
      status: "Available",
      link: "/idea-scan",
      category: "Ideation"
    },
    {
      id: 2,
      name: "Reviews Scan",
      description: "Analyze app reviews to identify user pain points and feature requests.",
      status: "Available",
      link: "/reviews-scan",
      category: "Ideation"
    },
    {
      id: 4,
      name: "ASO Scan",
      description: "Analyze app store listings to identify keyword opportunities and improve app store optimization.",
      status: "Available",
      link: "/aso-scan",
      category: "Product"
    },
    {
      id: 7,
      name: "Socials Scan",
      description: "Analyze the performance of your social media posts across different accounts.",
      status: "Available",
      link: "/socials-scan",
      category: "Marketing"
    },
    {
      id: 8,
      name: "Voice Control",
      description: "Control your devices with your voice in real time.",
      status: "Available",
      link: "/voice-control",
      category: "Tools"
    },
    {
      id: 9,
      name: "OTG Control",
      description: "Easily control and automate your OTG farm.",
      status: "Available",
      link: "/otg-control",
      category: "Tools"
    },
  ];
};

