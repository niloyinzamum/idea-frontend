
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Shield, Eye, Lock, Database, Users } from "lucide-react";

const Privacy = () => {
  const sections = [
    {
      icon: Eye,
      title: "Information We Collect",
      content: [
        "Account information (username, email address, profile photo)",
        "Communication data (messages, voice, and video interactions in rooms)",
        "Usage information (rooms joined, features used, interaction patterns)",
        "Device information (browser type, operating system, IP address)",
        "Audio and video preferences and device settings"
      ]
    },
    {
      icon: Database,
      title: "How We Use Your Information",
      content: [
        "Provide and maintain the Idea Hub platform and services",
        "Enable communication features including text, voice, and video chat",
        "Personalize your experience and remember your preferences",
        "Ensure platform safety and enforce community guidelines",
        "Send important updates about your account and our services"
      ]
    },
    {
      icon: Shield,
      title: "Information Sharing",
      content: [
        "We do not sell your personal information to third parties",
        "Room participants can see your username and profile information",
        "Moderators may access additional information for safety purposes",
        "We may share data with service providers who help operate our platform",
        "Legal compliance: We may disclose information when required by law"
      ]
    },
    {
      icon: Lock,
      title: "Data Security",
      content: [
        "All communications are encrypted in transit using industry-standard protocols",
        "We implement administrative, physical, and technical safeguards",
        "Regular security audits and updates to protect your information",
        "Secure data centers with restricted access and monitoring",
        "Account protection features including secure authentication"
      ]
    },
    {
      icon: Users,
      title: "Your Rights and Choices",
      content: [
        "Access and update your profile information at any time",
        "Control your audio and video settings and device preferences",
        "Block other users and manage your privacy within rooms",
        "Delete your account and associated data upon request",
        "Opt out of non-essential communications"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information when you use Idea Hub.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: December 2024
          </p>
        </section>

        {/* Privacy Sections */}
        <section className="mb-16">
          <div className="grid grid-cols-1 gap-8 max-w-6xl mx-auto">
            {sections.map((section, index) => (
              <Card key={index} className="border-0 shadow-xl glass-card hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <section.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-800">
                      {section.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-600 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Information */}
        <section className="text-center max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl glass-card">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Questions About Privacy?
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                If you have any questions about this Privacy Policy or how we handle your personal information, 
                please don't hesitate to contact us. We're here to help ensure your privacy is protected.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 font-medium">Contact us at: privacy@ideahub.com</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;
