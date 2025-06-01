
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown, Gem } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Individual",
      price: "Free",
      description: "Perfect for personal financial management",
      icon: Gem,
      features: [
        "Unlimited transactions",
        "Basic document storage (100MB)",
        "Monthly/Yearly reports",
        "Mobile app access",
        "Email support"
      ],
      cta: "Get Started",
      popular: false,
      trial: false
    },
    {
      name: "Premium",
      price: "$9.99/month",
      description: "Advanced features for serious users",
      icon: Crown,
      features: [
        "Everything in Individual",
        "Unlimited document storage",
        "Day/Week/Month/Year views",
        "Advanced analytics",
        "Expense sharing",
        "Priority support",
        "Export to PDF/CSV"
      ],
      cta: "Start 7-Day Free Trial",
      popular: true,
      trial: true
    },
    {
      name: "Organization",
      price: "$29.99/month",
      description: "Complete solution for businesses",
      icon: Crown,
      features: [
        "Everything in Premium",
        "Multi-user access",
        "Team collaboration",
        "Advanced security",
        "Custom branding",
        "API access",
        "Dedicated support"
      ],
      cta: "Contact Sales",
      popular: false,
      trial: false
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-playfair font-bold text-collector-black mb-6">
              Choose Your
              <span className="gradient-text block">Financial Plan</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto">
              From individual users to large organizations, we have the perfect plan to help you master your finances.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`border-2 border-collector-gold/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-white relative ${plan.popular ? 'ring-2 ring-collector-orange' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-orange-gradient text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center pb-6 sm:pb-8">
                  <div className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full flex items-center justify-center">
                    <plan.icon className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl font-playfair text-collector-black">{plan.name}</CardTitle>
                  <div className="text-2xl sm:text-3xl font-bold text-collector-black mt-4">
                    {plan.price}
                  </div>
                  {plan.trial && (
                    <div className="text-sm text-green-600 font-medium mt-2">
                      7-day free trial included
                    </div>
                  )}
                  <CardDescription className="text-gray-700 mt-2 text-sm sm:text-base">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <Check className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full text-sm sm:text-base ${plan.popular ? 'bg-orange-gradient hover:bg-orange-600' : 'bg-blue-gradient hover:bg-blue-600'} text-white`}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-playfair font-bold text-collector-black mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            {[
              {
                question: "Can I switch plans anytime?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
              },
              {
                question: "What happens after my 7-day free trial?",
                answer: "After your 7-day Premium trial ends, you'll be automatically billed monthly unless you cancel before the trial period expires."
              },
              {
                question: "Is my data secure?",
                answer: "Absolutely. We use bank-level encryption and security measures to protect your financial data."
              },
              {
                question: "Do you offer refunds?",
                answer: "We offer a 30-day money-back guarantee for all paid plans. No questions asked."
              }
            ].map((faq, index) => (
              <Card key={index} className="border-2 border-collector-gold/20 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg text-collector-black">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm sm:text-base">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
