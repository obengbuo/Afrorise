import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Calendar, TrendingUp, Search, Briefcase } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const stats = {
    mentors: "500+",
    sessions: "2,000+", 
    placements: "85%"
  };

  const features = [
    {
      icon: Users,
      title: "Expert Mentorship",
      description: "Get personalized guidance from industry leaders through one-on-one sessions, resume reviews, and mock interviews.",
      benefits: ["Personalized career advice", "Industry-specific insights", "Flexible scheduling"]
    },
    {
      icon: Briefcase,
      title: "Collaborative Projects", 
      description: "Join real-world projects to build your portfolio and gain hands-on experience while working with peers.",
      benefits: ["Portfolio building", "Team collaboration", "Project management tools"]
    },
    {
      icon: Search,
      title: "Job Opportunities",
      description: "Access exclusive job postings and freelance opportunities tailored to your skills and career goals.",
      benefits: ["Curated job listings", "Freelance projects", "Direct employer connections"]
    }
  ];

  const mentors = [
    {
      name: "Sarah Johnson",
      title: "Senior VP Engineering at Google",
      experience: "12 years experience",
      rating: 4.9,
      reviews: 67,
      specialties: ["Tech Leadership", "AI/ML"],
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200"
    },
    {
      name: "Marcus Williams", 
      title: "Investment Director at Goldman Sachs",
      experience: "15 years experience",
      rating: 4.8,
      reviews: 43,
      specialties: ["Investment Banking", "Finance"],
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200"
    },
    {
      name: "Dr. Aisha Patel",
      title: "Chief Medical Officer at Kaiser", 
      experience: "18 years experience",
      rating: 5.0,
      reviews: 89,
      specialties: ["Healthcare", "Leadership"],
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200"
    },
    {
      name: "James Thompson",
      title: "Startup Founder & CEO",
      experience: "10 years experience", 
      rating: 4.7,
      reviews: 34,
      specialties: ["Entrepreneurship", "Product"],
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200"
    }
  ];

  const testimonials = [
    {
      name: "Maya Rodriguez",
      title: "Software Engineer at Meta",
      content: "The mentorship I received through Afrorise was instrumental in landing my dream job at Meta. My mentor helped me prepare for technical interviews and provided invaluable career guidance.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100"
    },
    {
      name: "David Chen", 
      title: "Product Manager at Stripe",
      content: "Transitioning from engineering to product management seemed impossible until I found my mentor on Afrorise. They guided me through the transition and helped me build the right skills.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100"
    },
    {
      name: "Zara Johnson",
      title: "Startup Founder", 
      content: "My mentor helped me refine my business idea and connected me with investors. I successfully raised $2M in seed funding and launched my startup thanks to their guidance.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <span className="ml-2 text-xl font-bold text-slate-900">Afrorise</span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#mentors" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Find Mentors</a>
              <a href="#projects" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Projects</a>
              <a href="#opportunities" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Opportunities</a>
              <a href="#about" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">About</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleLogin} data-testid="button-signin">
                Sign In
              </Button>
              <Button onClick={handleLogin} data-testid="button-get-started">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="lg:col-span-6">
              <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Accelerate Your 
                <span className="text-primary"> Career Growth</span> 
                with Expert Mentorship
              </h1>
              <p className="mt-6 text-xl text-slate-600 leading-relaxed">
                Connect with experienced professionals, collaborate on impactful projects, and unlock opportunities that propel your career forward.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={handleLogin} className="text-lg" data-testid="button-find-mentor">
                  <Search className="mr-2 h-5 w-5" />
                  Find a Mentor
                </Button>
                <Button variant="outline" size="lg" onClick={handleLogin} className="text-lg" data-testid="button-become-mentor">
                  Become a Mentor
                </Button>
              </div>
              
              <div className="mt-12 grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900" data-testid="stat-mentors">{stats.mentors}</div>
                  <div className="text-sm text-slate-600">Expert Mentors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900" data-testid="stat-sessions">{stats.sessions}</div>
                  <div className="text-sm text-slate-600">Sessions Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900" data-testid="stat-success">{stats.placements}</div>
                  <div className="text-sm text-slate-600">Success Rate</div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 lg:mt-0 lg:col-span-6">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600" 
                alt="Diverse professionals collaborating in modern office" 
                className="rounded-2xl shadow-2xl w-full h-auto object-cover" 
                data-testid="img-hero"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 bg-slate-50" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools and connections you need to advance your career and achieve your professional goals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 hover:shadow-md transition-shadow" data-testid={`card-feature-${index}`}>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-slate-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mentor Showcase */}
      <section className="py-16 bg-white" id="mentors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Meet Our Expert Mentors
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Learn from industry leaders across technology, finance, healthcare, and more. Our mentors are committed to helping you succeed.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {mentors.map((mentor, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow" data-testid={`card-mentor-${index}`}>
                <img 
                  src={mentor.avatar} 
                  alt={`${mentor.name} - ${mentor.title}`} 
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover" 
                  data-testid={`img-mentor-${index}`}
                />
                <h3 className="font-semibold text-slate-900" data-testid={`text-mentor-name-${index}`}>{mentor.name}</h3>
                <p className="text-sm text-slate-600 mb-2" data-testid={`text-mentor-title-${index}`}>{mentor.title}</p>
                <p className="text-xs text-slate-500 mb-3" data-testid={`text-mentor-experience-${index}`}>{mentor.experience}</p>
                <div className="flex flex-wrap gap-1 justify-center mb-3">
                  {mentor.specialties.map((specialty, specialtyIndex) => (
                    <Badge key={specialtyIndex} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-center mb-3">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, starIndex) => (
                      <Star key={starIndex} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-slate-600">{mentor.rating} ({mentor.reviews})</span>
                </div>
                <Button size="sm" className="w-full" onClick={handleLogin} data-testid={`button-book-session-${index}`}>
                  Book Session
                </Button>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button onClick={handleLogin} data-testid="button-view-all-mentors">
              View All Mentors
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              How Afrorise Works
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Getting started is simple. Follow these steps to connect with mentors and accelerate your career growth.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Create Your Profile",
                description: "Sign up and complete your profile with your career goals, skills, and interests to get matched with the right mentors."
              },
              {
                step: "2", 
                title: "Find Your Mentor",
                description: "Browse our mentor directory or use our smart matching algorithm to find mentors who align with your career aspirations."
              },
              {
                step: "3",
                title: "Book Sessions", 
                description: "Schedule mentorship sessions, resume reviews, or mock interviews directly through our platform at your convenience."
              },
              {
                step: "4",
                title: "Grow & Succeed",
                description: "Apply the insights and feedback from your mentors to accelerate your career growth and achieve your professional goals."
              }
            ].map((step, index) => (
              <div key={index} className="text-center" data-testid={`step-${index}`}>
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-2xl">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Hear from professionals who have transformed their careers through Afrorise mentorship.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-8" data-testid={`testimonial-${index}`}>
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={`${testimonial.name} - ${testimonial.title}`} 
                    className="w-12 h-12 rounded-full object-cover" 
                    data-testid={`img-testimonial-${index}`}
                  />
                  <div className="ml-4">
                    <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                    <p className="text-sm text-slate-600">{testimonial.title}</p>
                  </div>
                </div>
                <p className="text-slate-600 mb-4">{testimonial.content}</p>
                <div className="flex text-yellow-400">
                  {[...Array(testimonial.rating)].map((_, starIndex) => (
                    <Star key={starIndex} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who are accelerating their careers through expert mentorship and collaborative opportunities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" onClick={handleLogin} data-testid="button-start-mentee">
              Start as a Mentee
            </Button>
            <Button variant="outline" size="lg" onClick={handleLogin} className="border-white text-white hover:bg-white hover:text-primary" data-testid="button-become-mentor-cta">
              Become a Mentor
            </Button>
          </div>
          
          <div className="mt-8 text-primary-foreground/80">
            <p>✓ Free to join  ✓ Verified mentors  ✓ Flexible scheduling</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <span className="ml-2 text-xl font-bold">Afrorise</span>
              </div>
              <p className="text-slate-300 mb-4">Empowering career growth through mentorship and collaboration.</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors">Find Mentors</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Become a Mentor</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Projects</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Opportunities</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors">Career Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Interview Prep</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Resume Tips</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Afrorise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
