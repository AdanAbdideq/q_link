import { useState } from "react";

type LegalPageType = "privacy" | "terms" | "cookies" | "compliance" | null;

interface LegalPagesProps {
  onBack: () => void;
}

export default function LegalPages({ onBack }: LegalPagesProps) {
  const [currentPage, setCurrentPage] = useState<LegalPageType>(null);

  const isDark = true;
  const bgColor = "#0f172a";
  const cardBg = "#1e293b";
  const textColor = "#e2e8f0";
  const mutedColor = "#94a3b8";
  const borderColor = "#334155";

  const privacyContent = {
    title: "Privacy Policy",
    lastUpdated: "April 2024",
    sections: [
      {
        heading: "1. Introduction",
        content:
          'Q-LINK ("we", "us", "our") operates the Q-LINK service. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service and the choices you have associated with that data.',
      },
      {
        heading: "2. Information Collection and Use",
        content:
          "We collect several different types of information for various purposes to provide and improve our service to you. This includes personal identification information (name, email address, phone number), device information, usage data, and cookies.",
      },
      {
        heading: "3. Use of Data",
        content:
          "Q-LINK uses the collected data for various purposes: to provide and maintain our service, to notify you about changes to our service, to allow you to participate in interactive features, to provide customer support, and to gather analysis or valuable information.",
      },
      {
        heading: "4. Security of Data",
        content:
          "The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.",
      },
      {
        heading: "5. Contact Us",
        content:
          "If you have any questions about this Privacy Policy, please contact us at privacy@q-link.com or by mail at Q-LINK, Privacy Department, [Address].",
      },
    ],
  };

  const termsContent = {
    title: "Terms of Service",
    lastUpdated: "April 2024",
    sections: [
      {
        heading: "1. Acceptance of Terms",
        content:
          "By accessing and using Q-LINK, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.",
      },
      {
        heading: "2. Use License",
        content:
          "Permission is granted to temporarily download one copy of the materials (information or software) on Q-LINK for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose or for any public display.",
      },
      {
        heading: "3. Disclaimer",
        content:
          'The materials on Q-LINK are provided on an "as is" basis. Q-LINK makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.',
      },
      {
        heading: "4. Limitations",
        content:
          "In no event shall Q-LINK or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Q-LINK.",
      },
      {
        heading: "5. Accuracy of Materials",
        content:
          "The materials appearing on Q-LINK could include technical, typographical, or photographic errors. Q-LINK does not warrant that any of the materials on its website are accurate, complete, or current. Q-LINK may make changes to the materials contained on its website at any time without notice.",
      },
    ],
  };

  const cookiesContent = {
    title: "Cookie Policy",
    lastUpdated: "April 2024",
    sections: [
      {
        heading: "1. What Are Cookies",
        content:
          "Cookies are small pieces of data stored on your device when you visit a website. They help websites remember information about your visit, such as your preferences and login information.",
      },
      {
        heading: "2. How We Use Cookies",
        content:
          "Q-LINK uses cookies for several purposes: to remember your preferences, to understand how you use our service, to improve our service, and to provide personalized content and advertisements.",
      },
      {
        heading: "3. Types of Cookies We Use",
        content:
          "We use both session and persistent cookies. Session cookies are temporary and are deleted when you close your browser. Persistent cookies remain on your device until they expire or you delete them. We use cookies for authentication, preferences, analytics, and marketing purposes.",
      },
      {
        heading: "4. Managing Cookies",
        content:
          "Most web browsers allow you to control cookies through their settings. You can choose to accept or reject cookies, or be notified when a cookie is being sent. However, disabling cookies may affect the functionality of our website.",
      },
      {
        heading: "5. Third-Party Cookies",
        content:
          "We may allow third parties to place cookies on your device for analytics and advertising purposes. These third parties have their own privacy policies governing their use of cookies.",
      },
    ],
  };

  const complianceContent = {
    title: "Compliance",
    lastUpdated: "April 2024",
    sections: [
      {
        heading: "1. GDPR Compliance",
        content:
          "Q-LINK complies with the General Data Protection Regulation (GDPR). We ensure that personal data of EU residents is processed lawfully, fairly, and transparently. Users have the right to access, rectify, and delete their personal data.",
      },
      {
        heading: "2. CCPA Compliance",
        content:
          "We comply with the California Consumer Privacy Act (CCPA). California residents have the right to know what personal information is collected, the right to delete personal information, and the right to opt-out of the sale of personal information.",
      },
      {
        heading: "3. Data Protection",
        content:
          "Q-LINK implements industry-standard security measures to protect personal data. We use encryption, secure servers, and regular security audits to ensure data protection.",
      },
      {
        heading: "4. Service Provider Verification",
        content:
          "All service providers on Q-LINK undergo verification and background checks. We maintain records of provider credentials and conduct regular compliance audits.",
      },
      {
        heading: "5. User Rights",
        content:
          "Users have the right to request access to their data, request corrections, request deletion, and withdraw consent. To exercise these rights, please contact us at compliance@q-link.com.",
      },
      {
        heading: "6. Data Retention",
        content:
          "We retain personal data only for as long as necessary to provide our services and fulfill the purposes outlined in this policy. Users can request deletion of their data at any time.",
      },
    ],
  };

  const renderPage = (page: LegalPageType) => {
    let content;
    switch (page) {
      case "privacy":
        content = privacyContent;
        break;
      case "terms":
        content = termsContent;
        break;
      case "cookies":
        content = cookiesContent;
        break;
      case "compliance":
        content = complianceContent;
        break;
      default:
        return null;
    }

    return (
      <div
        style={{ background: bgColor, color: textColor, minHeight: "100vh" }}
      >
        <nav
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(10px)",
            borderBottom: `1px solid ${borderColor}`,
            padding: "12px 0",
          }}
        >
          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              gap: "24px",
            }}
          >
            <button
              onClick={() => setCurrentPage(null)}
              style={{
                fontSize: "1.5rem",
                background: "none",
                border: "none",
                color: textColor,
                cursor: "pointer",
                padding: 0,
              }}
            >
              ← Back
            </button>
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700" }}>
              {content.title}
            </h1>
          </div>
        </nav>

        <div
          style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px" }}
        >
          <div
            style={{
              fontSize: "0.9rem",
              color: mutedColor,
              marginBottom: "32px",
            }}
          >
            Last updated: {content.lastUpdated}
          </div>

          {content.sections.map((section, idx) => (
            <div key={idx} style={{ marginBottom: "32px" }}>
              <h2
                style={{
                  fontSize: "1.3rem",
                  fontWeight: "700",
                  marginBottom: "12px",
                }}
              >
                {section.heading}
              </h2>
              <p
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.8",
                  color: textColor,
                }}
              >
                {section.content}
              </p>
            </div>
          ))}

          <div
            style={{
              marginTop: "48px",
              paddingTop: "32px",
              borderTop: `1px solid ${borderColor}`,
            }}
          >
            <p style={{ color: mutedColor, fontSize: "0.9rem" }}>
              If you have any questions about this policy, please contact us at
              legal@q-link.com
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (currentPage) {
    return renderPage(currentPage);
  }

  return (
    <div style={{ background: bgColor, color: textColor, minHeight: "100vh" }}>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${borderColor}`,
          padding: "12px 0",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <button
            onClick={onBack}
            style={{
              fontSize: "1.5rem",
              background: "none",
              border: "none",
              color: textColor,
              cursor: "pointer",
              padding: 0,
            }}
          >
            ← Back
          </button>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700" }}>
            Legal & Compliance
          </h1>
        </div>
      </nav>

      <div
        style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 24px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "24px",
          }}
        >
          <div
            onClick={() => setCurrentPage("privacy")}
            style={{
              background: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: "12px",
              padding: "32px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#0ea5e9";
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = borderColor;
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(0)";
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>🔒</div>
            <h2
              style={{
                fontSize: "1.3rem",
                fontWeight: "700",
                margin: "0 0 8px 0",
              }}
            >
              Privacy Policy
            </h2>
            <p style={{ color: mutedColor, margin: 0 }}>
              How we collect and use your data
            </p>
          </div>

          <div
            onClick={() => setCurrentPage("terms")}
            style={{
              background: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: "12px",
              padding: "32px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#0ea5e9";
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = borderColor;
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(0)";
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>📋</div>
            <h2
              style={{
                fontSize: "1.3rem",
                fontWeight: "700",
                margin: "0 0 8px 0",
              }}
            >
              Terms of Service
            </h2>
            <p style={{ color: mutedColor, margin: 0 }}>
              Our terms and conditions
            </p>
          </div>

          <div
            onClick={() => setCurrentPage("cookies")}
            style={{
              background: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: "12px",
              padding: "32px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#0ea5e9";
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = borderColor;
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(0)";
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>🍪</div>
            <h2
              style={{
                fontSize: "1.3rem",
                fontWeight: "700",
                margin: "0 0 8px 0",
              }}
            >
              Cookie Policy
            </h2>
            <p style={{ color: mutedColor, margin: 0 }}>How we use cookies</p>
          </div>

          <div
            onClick={() => setCurrentPage("compliance")}
            style={{
              background: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: "12px",
              padding: "32px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#0ea5e9";
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = borderColor;
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(0)";
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>✅</div>
            <h2
              style={{
                fontSize: "1.3rem",
                fontWeight: "700",
                margin: "0 0 8px 0",
              }}
            >
              Compliance
            </h2>
            <p style={{ color: mutedColor, margin: 0 }}>
              GDPR, CCPA, and data protection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
