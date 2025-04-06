export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Insecure app",
  description: "Build unbreakable apps.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Tasks",
      href: "/tasks",
    },
    {
      label: "Scoring table",
      href: "/scoring-table",
    },
    {
      label: "Account",
      href: "/account",
    },
    {
      label: "Log in",
      href: "/login",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Projects",
      href: "/projects",
    },
    {
      label: "Team",
      href: "/team",
    },
    {
      label: "Calendar",
      href: "/calendar",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    login: "/login",
    signup: "/signup",
    logout: "/logout",
    github: "https://github.com/KirillYuzh/insecure_app",
    docs: "https://github.com/KirillYuzh/insecure_app/tree/main#insecure-app",
  },
};
