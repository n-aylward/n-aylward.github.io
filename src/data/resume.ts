// Edit this file to update the resume content. The homepage and the PDF
// and DOCX generators all read from this data.

export interface ResumeRole {
  title: string;
  dateRange: string;
  bullets: string[];
}

export interface ResumeCompany {
  company: string;
  dateRange: string;
  /**
   * Use one role for a single position, or several roles for positions
   * the person held at the same company over time.
   */
  roles: ResumeRole[];
}

export interface ResumeEducation {
  institution: string;
  dateRange: string;
  degree: string;
  coursework: string[];
}

export const RESUME = {
  name: "Nick Aylward",
  title: "Technical Writer",

  /** These are the paths to downloadable files generated during the build. */
  downloads: {
    pdf: "/assets/aylward-nickolas-resume.pdf",
    docx: "/assets/aylward-nickolas-resume.docx",
  },

  introduction:
    "Principal Technical Writer specializing in developer documentation, docs-as-code infrastructure, and AI systems. Proven expertise authoring comprehensive documentation for agentic AI frameworks, LLM evaluation, NVIDIA NIM integrations, and developer APIs. Skilled at optimizing CI/CD publishing pipelines and search indexing, while leveraging AI development tools to deliver high-impact technical content.",

  skills: {
    proficiency: [
      "macOS",
      "Windows",
      "Ubuntu",
      "Git",
      "SVN",
      "Make",
      "HTML",
      "CSS",
      "Markdown",
      "Bootstrap",
      "Vale",
      "MkDocs",
      "Material for MkDocs",
      "Astro",
      "GitHub",
      "GitHub Actions",
      "GitHub Pages",
      "Cloudflare Pages",
      "Claude Code",
      "Cursor",
      "Antigravity",
      "Airtable",
      "Atlassian Tools",
      "Microsoft Office",
      "MadCap Flare",
      "MadCap Capture",
      "Pendo",
      "Snagit",
      "Camtasia",
    ],
    familiarity: [
      "Python",
      "JavaScript",
      "Jinja",
      "Liquid",
      "LaTeX",
      "Algolia",
      "Harness",
      "Mintlify",
      "VS Code",
      "Claude Desktop",
      "Postman",
      "Bitbucket",
      "DataTables",
      "Google Search Console",
      "Google Analytics",
      "Figma",
      "InDesign",
      "Photoshop",
      "Lightroom",
      "Dreamweaver",
    ],
  },

  experience: [
    {
      company: "DataRobot, Inc. / Product and Engineering Teams",
      dateRange: "January 2022 – September 2026",
      roles: [
        {
          title: "Principal Technical Writer",
          dateRange: "September 2024 – September 2026",
          bullets: [
            "Built DataRobot's initial agentic AI documentation, including agent development guides, infrastructure for tracing, evaluation, and moderation, and template walkthroughs.",
            "Maintained DataRobot's NVIDIA AI Enterprise integration documentation, covering NIM container deployment from the NVIDIA GPU Cloud (NGC) gallery, embedding models for vector databases, and NeMo Guardrails moderation, while partially automating upkeep of the NIM reference tables.",
            "Produced DataRobot's public-facing Workload API documentation (tutorial, CLI reference, and installation guide), translating internal engineering documentation into user-facing content.",
            "Prototyped an internal automation that drafts release notes directly from pull requests.",
            "Rebuilt the documentation site's Algolia search-indexing pipeline to extract visible page text instead of raw HTML and to split oversized sections into additional records instead of truncating them at Algolia's size limits, shipping the fix end-to-end across the Python index builders, CLI, and React search UI with new regression tests.",
            "Redesigned the search taxonomy's facet detection to track a major documentation restructuring, closed indexing gaps that had been dropping tabbed content and duplicating LLM sidecar files, and cut search-QA cycle time by enabling verification of search UI changes against live indexes without a full rebuild.",
            "Managed the documentation site's Harness/MkDocs CI pipeline, shipping fixes for redirect handling, heading-hierarchy checks, prose linting, and link-checker exclusions.",
            "Extended the documentation site's machine-readable documentation exports and improved Markdown link handling for LLM and agentic consumers of the site.",
            "Implemented a Python/Pillow-based image pipeline to resize, optimize, and recolor callout graphics across the documentation site.",
          ],
        },
        {
          title: "Senior Technical Writer",
          dateRange: "February 2023 – September 2024",
          bullets: [
            "Documented the redesigned NextGen UI end-to-end across MLOps surfaces as part of DataRobot's platform-wide migration from its Classic UI.",
            "Contributed to early documentation for DataRobot's generative AI and LLM capabilities, including LLM evaluation, prompt monitoring, generative AI performance tracking, and the LLM playground.",
            "Managed backports and cherry-picks of documentation fixes to release branches for DataRobot's enterprise and on-premises releases.",
            "Added new documentation-site UI elements, including badges, admonition styling, and banners, and fixed responsive-navigation and search-UI issues.",
          ],
        },
        {
          title: "Technical Writer",
          dateRange: "January 2022 – February 2023",
          bullets: [
            "Provided documentation and sign-off for feature releases across DataRobot's MLOps platform, including predictions, model monitoring and management, custom models, and external models.",
            "Led a two-part refactor of the custom model documentation and consolidated the MLOps information architecture to reduce redundant content.",
            "Fixed local doc-portal build failures and a Poetry-related CI build breakage.",
          ],
        },
      ],
    },
    {
      company: "Onapsis, Inc. / Product Team",
      dateRange: "January 2021 – November 2021",
      roles: [
        {
          title: "Product Documentation Specialist",
          dateRange: "January 2021 – November 2021",
          bullets: [
            "Worked on an agile product team during a fast-paced transitional period, producing documentation in two-week sprints and participating in standups to track progress.",
            "Built Pendo guides, walkthroughs, banners, and toasts to assist users within the product and facilitate the transition to a new user interface.",
            "Contributed to a help center rebrand, providing custom CSS styles and a CSS grid homepage layout.",
            "Assisted with security team initiatives, providing a JavaScript proof of concept for securing external links and helping implement the eventual MadCap Flare post-build event solution.",
            "Contributed to the HTML table sort and filter implementation in MadCap Flare, creating custom CSS classes to import use-case-specific DataTables functions by topic.",
            "Expanded in-product changelogs for SAP Security Note support and proprietary Onapsis roles.",
            "Created a customer-facing guide for the most complex third-party deployment, walking users through the creation and configuration of a Microsoft Azure VM for the Onapsis platform.",
          ],
        },
      ],
    },
    {
      company: "Rediker Software, Inc. / Software Development Department",
      dateRange: "October 2016 – January 2021",
      roles: [
        {
          title: "Technical Writing Team Lead",
          dateRange: "October 2017 – January 2021",
          bullets: [
            "Evaluated the feasibility of a Confluence-based documentation site and took the lead on design and information architecture during the implementation process.",
            "Created COVID-19 resources (using Bootstrap 4 and MadCap Flare) to assist schools with online learning, emergency communication, contact tracing, and health screening.",
            "Worked with company leadership and product owners to identify and address documentation needs across the suite of school information software.",
            "Interviewed, onboarded, and trained technical writers.",
          ],
        },
        {
          title: "Technical Writer",
          dateRange: "June 2017 – January 2021",
          bullets: [
            "Developed a customer portal and knowledge base in Freshdesk using HTML, CSS, and the Liquid template language.",
            "Created a structured release-notes process with responsive web and email templates.",
            "Converted an outdated MadCap Flare project from Flare 12 to Flare 2020 by resolving compatibility issues due to custom CSS and jQuery.",
            "Improved the search engine optimization of the documentation site using Google Search Console.",
          ],
        },
        {
          title: "Junior Technical Writer",
          dateRange: "October 2016 – June 2017",
          bullets: [
            "Wrote, edited, and published end-user software documentation and release notes in MadCap Flare, Freshdesk, and Adxstudio Portals, working closely with subject matter experts to verify content.",
            "Created and implemented a find-and-replace process using regular expressions to convert blocks of MadCap Flare drop-down XML to standard HTML headings.",
          ],
        },
      ],
    },
    {
      company: "UMass Amherst / University Health Services",
      dateRange: "September 2014 – August 2015",
      roles: [
        {
          title: "New Student Immunization Program Assistant",
          dateRange: "September 2014 – August 2015",
          bullets: [
            "Transcribed student immunization records to GE Centricity EMR and verified compliance with Massachusetts School Immunization Requirements.",
            "Contacted students with incomplete or invalid immunization records and provided guidance to reach compliance with immunization standards.",
          ],
        },
      ],
    },
    {
      company: "UMass Amherst / Organismic and Evolutionary Biology Department",
      dateRange: "May 2014 – September 2014",
      roles: [
        {
          title: "Undergraduate Research Assistant",
          dateRange: "May 2014 – September 2014",
          bullets: [
            "Collected acoustic data in the field from Song Sparrows at various stages of development.",
            "Worked as a team to attract, mist-net, measure, band, and safely release Song Sparrows and bycatch.",
          ],
        },
      ],
    },
  ] satisfies ResumeCompany[],

  education: {
    institution: "University of Massachusetts Amherst",
    dateRange: "May 2016",
    degree: "Bachelor of Arts in English with a minor in Biological Sciences",
    coursework: [
      "Introduction to Professional Writing",
      "Introduction to Software Documentation",
      "Professional Writing and Technical Communication Capstone",
      "Introduction to Programming",
      "Quantitative Systems Biology",
    ],
  } satisfies ResumeEducation,
} as const;
