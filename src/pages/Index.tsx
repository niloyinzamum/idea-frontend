
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Users, Shield, Mic, Video, Settings } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const Index = () => {
  const features = [
    {
      icon: MessageCircle,
      title: "Multi-Modal Communication",
      description: "Text, voice, and video chat all in one seamless platform",
    },
    {
      icon: Users,
      title: "Room-Based Discussions",
      description: "Join topic-specific rooms for focused conversations",
    },
    {
      icon: Shield,
      title: "Advanced Moderation",
      description: "Comprehensive tools for safe and organized discussions",
    },
    {
      icon: Mic,
      title: "Stage Management",
      description: "Hosted presentations with controlled speaking roles",
    },
    {
      icon: Video,
      title: "Interactive Controls",
      description: "Personal audio/video settings and participant management",
    },
    {
      icon: Settings,
      title: "Profile Customization",
      description: "Personalize your experience with custom settings",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 animate-fade-in">
            Idea Hub
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed animate-fade-in">
            A comprehensive chatting platform for interactive group discussions and collaborative conversations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold transition-all duration-300 transform hover:scale-105">
                Get Started
              </Button>
            </Link>
            <Link to="/signin">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-gray-300 hover:border-blue-500 px-8 py-3 text-lg font-semibold transition-all duration-300">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Powerful Features for Every Conversation
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From casual group chats to structured meetings, Idea Hub provides the tools you need for meaningful interactions
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
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

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Collaborating?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users already using Idea Hub for their conversations
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold transition-all duration-300 transform hover:scale-105">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
