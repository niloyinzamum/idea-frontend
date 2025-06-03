
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MessageCircle, Users, Shield, Mic, Video, Settings, Crown, Volume2 } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: MessageCircle,
      title: "Multi-Modal Communication",
      description: "Support for text messages, voice chat, and video calls within rooms for comprehensive communication experiences.",
    },
    {
      icon: Users,
      title: "Room-Based Discussions",
      description: "Join topic-specific rooms with contextual information about each room's purpose and dedicated hosts.",
    },
    {
      icon: Shield,
      title: "Advanced Moderation System",
      description: "Comprehensive moderation tools including user management, room control, and safety features for all participants.",
    },
    {
      icon: Crown,
      title: "Stage Management",
      description: "Special hosted room format where moderators can control presentations and manage speaking roles.",
    },
    {
      icon: Volume2,
      title: "Interactive Controls",
      description: "Personal audio/video controls, volume management, and participant management tools for optimal experience.",
    },
    {
      icon: Settings,
      title: "Profile Customization",
      description: "Dedicated settings page for profile photos, usernames, and audio/video device configuration.",
    },
  ];

  const userTypes = [
    {
      title: "Regular Users",
      features: [
        "Join and participate in rooms",
        "Text, voice, and video communication",
        "Personal audio/video controls",
        "User blocking and volume adjustment",
        "Profile customization",
      ],
    },
    {
      title: "Moderators",
      features: [
        "All regular user capabilities",
        "Room management (kick, mute all, ban)",
        "Stage control in hosted rooms",
        "Participant elevation to speaking roles",
        "Advanced safety tools",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            About Idea Hub
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Idea Hub is a comprehensive chatting application designed for interactive group discussions and collaborative conversations. 
            The platform combines traditional chat functionality with advanced moderation tools and stage-based presentations, 
            making it ideal for both casual group chats and structured meetings or events.
          </p>
        </section>

        {/* Core Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-xl bg-white/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-800">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-center leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* User Roles */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">User Roles & Capabilities</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {userTypes.map((userType, index) => (
              <Card key={index} className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-800 text-center">
                    {userType.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {userType.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Application Structure */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Application Structure</h2>
          <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    Idea Hub App
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Authentication</h4>
                      <ul className="text-sm text-blue-600 space-y-1">
                        <li>• Sign Up / Onboarding</li>
                        <li>• Sign In</li>
                      </ul>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Main Dashboard</h4>
                      <ul className="text-sm text-purple-600 space-y-1">
                        <li>• Room List</li>
                        <li>• Join Room Interface</li>
                        <li>• Navigation Menu</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Room Interface</h4>
                      <ul className="text-sm text-green-600 space-y-1">
                        <li>• Chat Area (Text/Voice/Video)</li>
                        <li>• Participant List</li>
                        <li>• Personal Controls</li>
                        <li>• Room Description Panel</li>
                        <li>• Moderation Panel</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">User Profile</h4>
                      <ul className="text-sm text-orange-600 space-y-1">
                        <li>• Profile Photo Upload</li>
                        <li>• username Management</li>
                        <li>• Account Settings</li>
                      </ul>
                    </div>
                    
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-indigo-800 mb-2">User Management</h4>
                      <ul className="text-sm text-indigo-600 space-y-1">
                        <li>• Block/Unblock Users</li>
                        <li>• Volume Controls</li>
                        <li>• Participant Details View</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default About;
