import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MessageCircle, GraduationCap, Shield, Sparkles, Heart } from 'lucide-react';

interface HomeProps {
  onGetStarted: () => void;
}

const Home = ({ onGetStarted }: HomeProps) => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Building",
      description: "Join your college community and connect with peers from your stream",
      color: "from-purple-500 to-blue-500"
    },
    {
      icon: <GraduationCap className="h-8 w-8" />,
      title: "Mentorship Program",
      description: "Get guidance from seniors or become a mentor to help juniors",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Interactive Clubs",
      description: "Create and join clubs based on your interests and academic focus",
      color: "from-cyan-500 to-pink-500"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "AI Moderation",
      description: "Safe environment with intelligent content moderation using Gemini AI",
      color: "from-pink-500 to-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 opacity-60" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full glass-card">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Welcome to the Future of Student Networking</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-6 gradient-text float-animation">
              U-fresher <Heart className="inline h-16 w-16 md:h-20 md:w-20 text-accent" />
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Connect, learn, and grow with your college community. 
              Find mentors, join clubs, and build lasting relationships in a secure, AI-moderated environment.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={onGetStarted}
                className="btn-cosmic text-lg px-8 py-4 pulse-glow"
                size="lg"
              >
                Get Started Now
              </Button>
              <Badge variant="secondary" className="text-sm">
                Join 10,000+ students already connected
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Why Choose U-fresher?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to thrive in your academic journey, all in one platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`glass-card transition-all duration-500 cursor-pointer group ${
                hoveredFeature === index ? 'scale-105 pulse-glow' : ''
              }`}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <CardHeader className="text-center">
                <div className={`mx-auto p-4 rounded-full bg-gradient-to-r ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold gradient-text">10K+</div>
              <div className="text-muted-foreground">Active Students</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold gradient-text">500+</div>
              <div className="text-muted-foreground">College Communities</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold gradient-text">2K+</div>
              <div className="text-muted-foreground">Successful Mentorships</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <Card className="glass-card max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl gradient-text">Ready to Transform Your College Experience?</CardTitle>
            <CardDescription className="text-lg">
              Join thousands of students who are already building their future through meaningful connections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={onGetStarted}
              className="btn-cosmic text-lg px-8 py-4"
              size="lg"
            >
              Start Your Journey Today
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;