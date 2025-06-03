
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/Navbar";
import { User, Mail, Camera, Mic, Volume2, Settings } from "lucide-react";

const Profile = () => {
  const [profile, setProfile] = useState({
    username: "john_doe",
    email: "john@example.com",
    avatar: "",
    audioDevice: "Default Microphone",
    outputDevice: "Default Speakers",
    videoDevice: "Built-in Camera",
  });

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log("Profile saved:", profile);
    // Here you would typically save the profile data
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Profile Settings
            </h1>
            <p className="text-xl text-gray-600">
              Customize your Idea Hub experience
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Profile Information</span>
                  </CardTitle>
                  <CardDescription>
                    Update your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="username">username</Label>
                    <Input
                      id="username"
                      value={profile.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Audio/Video Settings */}
              <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Audio & Video Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Configure your input and output devices
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="audioDevice" className="flex items-center space-x-2">
                      <Mic className="w-4 h-4" />
                      <span>Microphone</span>
                    </Label>
                    <Input
                      id="audioDevice"
                      value={profile.audioDevice}
                      onChange={(e) => handleInputChange("audioDevice", e.target.value)}
                      className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="outputDevice" className="flex items-center space-x-2">
                      <Volume2 className="w-4 h-4" />
                      <span>Speakers</span>
                    </Label>
                    <Input
                      id="outputDevice"
                      value={profile.outputDevice}
                      onChange={(e) => handleInputChange("outputDevice", e.target.value)}
                      className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="videoDevice" className="flex items-center space-x-2">
                      <Camera className="w-4 h-4" />
                      <span>Camera</span>
                    </Label>
                    <Input
                      id="videoDevice"
                      value={profile.videoDevice}
                      onChange={(e) => handleInputChange("videoDevice", e.target.value)}
                      className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Picture */}
            <div className="space-y-8">
              <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>
                    Upload a photo to personalize your profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src={profile.avatar} />
                      <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {profile.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <Button 
                    onClick={handleSave}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg py-3"
                  >
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
