
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, TrendingUp, Users, PieChart, Shield, Smartphone, Cloud, Calendar } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: FileText,
      title: "Document Sanctum",
      description: "Secure storage for all your financial documents with advanced search and categorization.",
      color: "text-collector-orange"
    },
    {
      icon: TrendingUp,
      title: "Prosperity Insights",
      description: "Real-time analytics and beautiful visualizations to track your financial growth.",
      color: "text-collector-blue"
    },
    {
      icon: Users,
      title: "Expense Sharing",
      description: "Split expenses with individuals or organizations with transparent tracking.",
      color: "text-collector-gold"
    },
    {
      icon: PieChart,
      title: "Budget Planning",
      description: "Smart budgeting tools with automatic categorization and spending alerts.",
      color: "text-collector-orange"
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Enterprise-grade encryption to keep your financial data safe and private.",
      color: "text-collector-blue"
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Access your financial empire from anywhere with our responsive design.",
      color: "text-collector-gold"
    },
    {
      icon: Cloud,
      title: "Cloud Sync",
      description: "Automatic backup and synchronization across all your devices.",
      color: "text-collector-orange"
    },
    {
      icon: Calendar,
      title: "Multi-Period Views",
      description: "Track your finances by day, week, month, quarter, or year.",
      color: "text-collector-blue"
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
              Powerful Features for
              <span className="gradient-text block">Financial Mastery</span>
            </h1>
            <p className="text-lg lg:text-xl text-collector-black/70 max-w-3xl mx-auto">
              Discover the tools that make Collector the ultimate financial management platform for both individuals and organizations.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="ancient-border hover-lift bg-white/90 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full flex items-center justify-center`}>
                    <feature.icon className={`w-8 h-8 text-white`} />
                  </div>
                  <CardTitle className="text-xl font-playfair">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-collector-black/70">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 lg:p-12 ancient-border">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-collector-black mb-4">
              Ready to Master Your Finances?
            </h2>
            <p className="text-lg text-collector-black/70 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have transformed their financial lives with Collector's powerful features.
            </p>
            <button className="bg-blue-gradient hover:bg-blue-600 text-white px-8 py-4 text-lg font-playfair rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              Start Your Journey
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Features;
