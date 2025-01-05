import React from 'react';
import { Link } from 'react-router-dom';
import { FaCamera, FaShare, FaUserFriends } from 'react-icons/fa';
import { Button } from "@/components/ui/button";

const Home: React.FC = () => {
  
  const features = [
    {
      icon: <FaCamera className="text-4xl mb-4 text-purple-200" />,
      title: "Create Events",
      description: "Organize your photos into beautiful, shareable events.",
    },
    {
      icon: <FaShare className="text-4xl mb-4 text-purple-200" />,
      title: "Easy Sharing",
      description: "Share your events with a simple link, no account required.",
    },
    {
      icon: <FaUserFriends className="text-4xl mb-4 text-purple-200" />,
      title: "Collaborate",
      description: "Invite friends to add their photos to your events.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
            Share Your Moments
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8">
            Create, share, and relive your favorite memories with friends and family.
          </p>
          <div className="flex justify-center space-x-4">
            <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-purple-100">
              <Link to="/register">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-purple-600">
              <Link to="/login">Log In</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {features.map((feature, index) => (
            <FeatureCard
              key={index}  
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-6 text-center">
      {icon}
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-purple-100">{description}</p>
    </div>
  );
};

export default Home;
