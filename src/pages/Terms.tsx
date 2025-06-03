
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FileText, Users, Shield, AlertTriangle, Scale } from "lucide-react";

const Terms = () => {
  const sections = [
    {
      icon: FileText,
      title: "Acceptance of Terms",
      content: [
        "By accessing or using Idea Hub, you agree to be bound by these Terms of Service",
        "These terms apply to all users, including visitors, registered users, and moderators",
        "If you do not agree to these terms, please do not use our platform",
        "We may update these terms from time to time with notice to users",
        "Continued use of the platform constitutes acceptance of updated terms"
      ]
    },
    {
      icon: Users,
      title: "User Conduct and Responsibilities",
      content: [
        "Be respectful and courteous to all other users in all interactions",
        "Do not share personal information of others without their consent",
        "Prohibited content includes hate speech, harassment, spam, or illegal material",
        "Users are responsible for their own communications and content",
        "Report inappropriate behavior to moderators or platform administrators"
      ]
    },
    {
      icon: Shield,
      title: "Platform Rules and Safety",
      content: [
        "Follow all room-specific rules set by hosts and moderators",
        "Respect moderation decisions including muting, removal, or banning",
        "Do not attempt to circumvent platform safety measures",
        "Users may be suspended or banned for violations of these terms",
        "We reserve the right to monitor communications for safety purposes"
      ]
    },
    {
      icon: AlertTriangle,
      title: "Prohibited Activities",
      content: [
        "Impersonating other users, moderators, or platform staff",
        "Sharing malicious links, viruses, or harmful software",
        "Using the platform for commercial purposes without authorization",
        "Attempting to hack, disrupt, or gain unauthorized access to the platform",
        "Creating multiple accounts to evade bans or restrictions"
      ]
    },
    {
      icon: Scale,
      title: "Limitation of Liability",
      content: [
        "Idea Hub is provided 'as is' without warranties of any kind",
        "We are not liable for user-generated content or interactions",
        "Platform availability may be interrupted for maintenance or technical issues",
        "Users are responsible for their own data backup and security",
        "Our liability is limited to the maximum extent permitted by law"
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
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            These terms govern your use of Idea Hub and outline the rights and responsibilities of all users.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: December 2024
          </p>
        </section>

        {/* Terms Sections */}
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

        {/* Community Guidelines */}
        <section className="mb-16">
          <Card className="border-0 shadow-xl glass-card max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Community Guidelines
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Building a positive environment for all users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-4">✓ Encouraged Behavior</h3>
                  <ul className="text-sm text-green-700 space-y-2">
                    <li>• Constructive and thoughtful discussions</li>
                    <li>• Helping and supporting other users</li>
                    <li>• Sharing knowledge and expertise</li>
                    <li>• Respectful disagreement and debate</li>
                    <li>• Reporting inappropriate content</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-4">✗ Prohibited Behavior</h3>
                  <ul className="text-sm text-red-700 space-y-2">
                    <li>• Personal attacks or harassment</li>
                    <li>• Discriminatory language or hate speech</li>
                    <li>• Spam or irrelevant content</li>
                    <li>• Sharing inappropriate or offensive material</li>
                    <li>• Disrupting ongoing conversations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact Information */}
        <section className="text-center max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl glass-card">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Questions About These Terms?
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                If you have any questions about these Terms of Service or need clarification about our policies, 
                please reach out to our support team.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 font-medium">Contact us at: legal@ideahub.com</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;
