import { Link } from 'react-router-dom';
import { Sprout, ShoppingCart, Cloud, Bot, BookOpen, Users, MapPin, Star, ChevronRight, Phone, Shield, Truck, Leaf, Award, MessageCircle } from 'lucide-react';

export default function Home() {
  const stats = [
    { value: '15,000+', label: 'Farmers' },
    { value: '5,000+', label: 'Products' },
    { value: '47', label: 'Counties' },
    { value: 'KSh 50M+', label: 'Transactions' },
  ];

  const features = [
    { icon: Bot, title: 'AI Farm Advisor', desc: 'Get instant answers about crops, diseases, and best practices.' },
    { icon: ShoppingCart, title: 'Live Marketplace', desc: 'Buy and sell produce with secure M-Pesa payments.' },
    { icon: Cloud, title: 'GPS Weather', desc: 'Accurate weather forecasts for your farm location.' },
    { icon: MapPin, title: 'Farmers Map', desc: 'Find nearby farmers, buyers, and suppliers.' },
    { icon: Truck, title: 'Transport Services', desc: 'Connect with drivers for crop delivery.' },
    { icon: Award, title: 'Expert Consultations', desc: 'Book consultations with agricultural experts.' },
    { icon: BookOpen, title: 'Learning Hub', desc: 'Access courses, guides, and tutorials.' },
    { icon: Users, title: 'Community', desc: 'Connect with thousands of Kenyan farmers.' },
  ];

  const testimonials = [
    { name: 'John Kamau', role: 'Tomato Farmer, Nakuru', text: 'AgriConnection helped me increase my yield by 40%. The AI advisor detected a disease early!', rating: 5 },
    { name: 'Mary Wanjiku', role: 'Vegetable Seller, Nairobi', text: 'I now sell directly to buyers and get better prices. M-Pesa integration is seamless.', rating: 5 },
    { name: 'Peter Ochieng', role: 'Maize Farmer, Eldoret', text: 'The weather alerts have saved my harvest twice. Highly recommend!', rating: 5 },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-primary-600/50 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sprout className="h-4 w-4" />
                Kenya's #1 Agriculture Platform
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Smart Farming Starts Here
                <span className="text-accent-400 block mt-2">Connect. Grow. Prosper.</span>
              </h1>
              <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-xl">
                Join 15,000+ Kenyan farmers using AI-powered tools, real-time weather, and direct market access.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <Link to="/register" className="btn bg-accent-500 text-gray-900 hover:bg-accent-400 text-lg px-8 py-4">
                  Get Started Free
                  <ChevronRight className="h-5 w-5" />
                </Link>
                <Link to="/marketplace" className="btn border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4">
                  Explore Marketplace
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-2 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <img
                    src="https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg?w=600&auto=format"
                    alt="Kenyan farmer using smartphone"
                    className="rounded-2xl w-full shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary-900 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
            {stats.map((stat, i) => (
              <div key={i}>
                <div className="text-2xl md:text-4xl font-bold text-accent-400">{stat.value}</div>
                <div className="text-primary-200 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              From AI-powered advice to direct market access, we've built tools for Kenyan farmers.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="card p-6 hover:shadow-xl transition-shadow group">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-600 transition-colors">
                    <Icon className="h-6 w-6 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Trusted Across Kenya</h2>
            <p className="text-gray-600">Real stories from real farmers</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="card p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className={`h-4 w-4 ${j < t.rating ? 'fill-accent-400 text-accent-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-200 rounded-full flex items-center justify-center font-bold text-primary-800">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Farm?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of farmers already growing smarter.
          </p>
          <Link to="/register" className="btn bg-accent-500 text-gray-900 hover:bg-accent-400 text-lg px-8 py-4">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Trust */}
      <section className="py-8 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center items-center gap-8 text-gray-400">
          <div className="flex items-center gap-2"><Shield className="h-5 w-5" /><span className="text-sm">Secure</span></div>
          <div className="flex items-center gap-2"><Truck className="h-5 w-5" /><span className="text-sm">Delivery</span></div>
          <div className="flex items-center gap-2"><Phone className="h-5 w-5" /><span className="text-sm">M-Pesa</span></div>
          <div className="flex items-center gap-2"><Leaf className="h-5 w-5" /><span className="text-sm">Verified Sellers</span></div>
        </div>
      </section>
    </div>
  );
}
