export const SITE = {
  website: "https://n-aylward.github.io/",
  author: "Nick Aylward",
  profile: "https://n-aylward.github.io/",
  desc: "Technical Writing resume site for Nick Aylward.",
  title: "Nick Aylward | Technical Writer",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: false,
  showBackButton: true,
  editPost: {
    enabled: false,
    text: "Edit page",
    url: "",
  },
  dynamicOgImage: true,
  dir: "ltr",
  lang: "en",
  timezone: "America/New_York",
} as const;
