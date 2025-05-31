
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, TrendingUp, Star, Calendar } from "lucide-react";

const Forum = () => {
  const categories = [
    {
      name: "General Discussion",
      description: "Talk about anything related to personal finance",
      posts: 1247,
      members: 3420,
      icon: MessageCircle
    },
    {
      name: "Investment Strategies",
      description: "Share and discuss investment approaches",
      posts: 856,
      members: 2103,
      icon: TrendingUp
    },
    {
      name: "Budgeting Tips",
      description: "Learn and share budgeting techniques",
      posts: 2341,
      members: 4567,
      icon: Star
    },
    {
      name: "Collector Support",
      description: "Get help with using the Collector app",
      posts: 423,
      members: 1890,
      icon: Users
    }
  ];

  const recentPosts = [
    {
      title: "How to set up automatic savings with Collector?",
      author: "FinanceGuru",
      replies: 23,
      time: "2 hours ago",
      category: "Collector Support"
    },
    {
      title: "Best practices for expense categorization",
      author: "BudgetMaster",
      replies: 45,
      time: "5 hours ago",
      category: "Budgeting Tips"
    },
    {
      title: "Monthly budget review - sharing my results",
      author: "SmartSaver",
      replies: 12,
      time: "1 day ago",
      category: "General Discussion"
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
              Community
              <span className="gradient-text block">Forum</span>
            </h1>
            <p className="text-lg lg:text-xl text-collector-black/70 max-w-3xl mx-auto mb-8">
              Connect with fellow financial enthusiasts, share insights, and learn from the community.
            </p>
            <Button className="bg-blue-gradient hover:bg-blue-600 text-white px-8 py-4 text-lg font-playfair rounded-xl">
              Join the Discussion
            </Button>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {categories.map((category, index) => (
              <Card key={index} className="ancient-border hover-lift bg-white/90 backdrop-blur-sm cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full flex items-center justify-center">
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl font-playfair">{category.name}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-collector-black/60">
                    <span>{category.posts} posts</span>
                    <span>{category.members} members</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Posts */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-playfair font-bold text-collector-black mb-8 text-center">
              Recent Discussions
            </h2>
            
            <div className="space-y-4">
              {recentPosts.map((post, index) => (
                <Card key={index} className="ancient-border hover-lift bg-white/90 backdrop-blur-sm cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-collector-black mb-2">
                          {post.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-collector-black/60">
                          <span>by {post.author}</span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {post.replies} replies
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {post.time}
                          </span>
                          <span className="bg-collector-gold/20 text-collector-gold px-2 py-1 rounded text-xs">
                            {post.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Forum;
