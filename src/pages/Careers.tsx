
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Code, Briefcase, Heart } from "lucide-react";

const Careers = () => {
  const positions = [
    {
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time",
      description: "Build beautiful and responsive user interfaces for our financial platform.",
      requirements: ["5+ years React experience", "TypeScript proficiency", "UI/UX sensibility"]
    },
    {
      title: "Product Manager",
      department: "Product",
      location: "Remote",
      type: "Full-time",
      description: "Drive product strategy and roadmap for our financial management features.",
      requirements: ["3+ years product management", "Fintech experience", "Data-driven mindset"]
    },
    {
      title: "Financial Analyst",
      department: "Finance",
      location: "New York, NY",
      type: "Full-time",
      description: "Support our growth with financial planning and analysis.",
      requirements: ["CPA or CFA preferred", "Excel/SQL skills", "Financial modeling experience"]
    }
  ];

  const benefits = [
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Comprehensive health insurance and wellness programs"
    },
    {
      icon: Users,
      title: "Great Team",
      description: "Work with passionate people who care about financial literacy"
    },
    {
      icon: Code,
      title: "Learning Budget",
      description: "$2,000 annual budget for conferences, courses, and books"
    },
    {
      icon: Briefcase,
      title: "Flexible Work",
      description: "Remote-first culture with flexible hours and unlimited PTO"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50 flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-playfair font-bold text-collector-black mb-6">
              Join Our
              <span className="gradient-text block">Financial Revolution</span>
            </h1>
            <p className="text-lg lg:text-xl text-collector-black/70 max-w-3xl mx-auto">
              Help us build the future of financial management. We're looking for passionate people who want to make finance accessible to everyone.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {benefits.map((benefit, index) => (
              <Card key={index} className="ancient-border bg-white/90 backdrop-blur-sm text-center">
                <CardHeader>
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-playfair">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-collector-black/70">
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Open Positions */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-playfair font-bold text-collector-black mb-8 text-center">
              Open Positions
            </h2>
            
            <div className="space-y-6">
              {positions.map((position, index) => (
                <Card key={index} className="ancient-border hover-lift bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-playfair mb-2">
                          {position.title}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-collector-black/60 mb-4">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {position.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {position.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {position.type}
                          </span>
                        </div>
                        <CardDescription className="mb-4">
                          {position.description}
                        </CardDescription>
                        <div>
                          <h4 className="font-medium text-collector-black mb-2">Requirements:</h4>
                          <ul className="list-disc list-inside text-sm text-collector-black/70 space-y-1">
                            {position.requirements.map((req, reqIndex) => (
                              <li key={reqIndex}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <Button className="bg-blue-gradient hover:bg-blue-600 text-white shrink-0">
                        Apply Now
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <section className="text-center mt-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 lg:p-12 ancient-border max-w-4xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-collector-black mb-4">
                Don't See Your Role?
              </h2>
              <p className="text-lg text-collector-black/70 mb-8">
                We're always looking for talented people. Send us your resume and tell us how you'd like to contribute.
              </p>
              <Button className="bg-orange-gradient hover:bg-orange-600 text-white px-8 py-4 text-lg font-playfair rounded-xl">
                Send Us Your Resume
              </Button>
            </div>
          </section>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Careers;
