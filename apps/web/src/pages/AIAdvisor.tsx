import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { formatDate } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { Bot, Send, Loader as Loader2, CircleAlert as AlertCircle, Trash2, Clock, User, Sparkles, Leaf, Droplets, Thermometer, Bug, Calendar, Circle as HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  metadata?: {
    intent?: string;
    confidence?: number;
  context?: string;
  crops?: string[];
  location?: string;
  urgency?: 'low' | 'medium' | 'high';
  tips?: string[];
  related_topic?: string;
  action_items?: string[];
  follow_up_question?: string;
  sources?: string[];
  disclaimers?: string[];
  warnings?: string[];
  seasonal_context_applied?: boolean;
    confidence_level?: 'high' | 'medium' | 'low';
    topic_category?: string;
    topic_subcategory?: string;
  };
}

const quickQuestions = [
  { icon: Leaf, text: 'Best crops for my region?', category: 'crops' },
  { icon: Bug, text: 'How to control aphids?', category: 'pest' },
  { icon: Droplets, text: 'Irrigation best practices', category: 'irrigation' },
  { icon: Thermometer, text: 'Protect crops from drought', category: 'weather' },
  { icon: Calendar, text: 'When to plant tomatoes?', category: 'planting' },
  { icon: HelpCircle, text: 'Improve soil fertility', category: 'soil' },
];

const knowledgeBase = {
  crops: {
    'tomatoes': {
      planting: 'Plant tomatoes at the start of the rainy season (March-April or Oct-Nov). Spacing: 60cm between plants, 90cm between rows.',
      care: 'Water deeply 2-3 times per week. Stake indeterminate varieties. Mulch to retain moisture and prevent soil-borne diseases.',
      harvest: 'Harvest when fruits are fully colored but still firm. Vine-ripened tomatoes have the best flavor.',
      pests: 'Watch for aphids, whiteflies, and tomato leaf miners. Use neem oil or insecticidal soap for organic control.',
      diseases: 'Common: early blight, late blight, bacterial wilt. Prevent with crop rotation, proper spacing, and avoiding overhead watering.',
    },
    'maize': {
      planting: 'Plant maize at the onset of rains. Spacing: 25cm between plants, 75cm between rows. Depth: 3-5cm.',
      varieties: 'H614, H513, H520 are popular hybrids. Certified seeds recommended for best yields.',
      fertilizer: 'Apply DAP at planting (50kg/acre). Top dress with CAN when plants are knee-high.',
      harvest: 'Harvest when kernels are hard and glossy. Dry properly before storage to prevent weevils.',
    },
    'kale': {
      planting: 'Sukuma wiki: Plant in nurseries, transplant after 3-4 weeks. Spacing: 45x45cm.',
      care: 'Needs consistent moisture. Apply manure or compost. Side dress with nitrogen fertilizer.',
      harvest: 'Start harvesting outer leaves when 8-10 leaves have developed. Can harvest for 6 months.',
    },
    'beans': {
      planting: 'Plant at onset of rains. Spacing: 10-15cm between plants, 50cm between rows.',
      varieties: 'Rose coco, Mwitemania, Kenyellow are popular varieties.',
      fixation: 'Beans fix nitrogen in soil. Good for rotation with cereals.',
      harvest: 'Green beans: 45-60 days. Dry beans: 75-90 days after planting.',
    },
  },
  pests: {
    'aphids': {
      identification: 'Small, soft-bodied insects clustered on new growth. Green, black, or brown in color.',
      damage: 'Cause leaf curling, yellowing, and stunted growth. Produce honeydew that promotes sooty mold.',
      control: 'Spray with strong water stream. Neem oil, insecticidal soap, or diatomaceous earth for organic control. Encourage ladybirds and lacewings.',
      prevention: 'Remove weeds, avoid excessive nitrogen fertilizer, maintain plant health.',
    },
    'fall armyworm': {
      identification: 'Larvae with distinctive inverted Y mark on head. Light stripes along body.',
      damage: 'Feeds on leaves, stems, and reproductive parts of maize and other cereals. Can cause total crop loss.',
      control: 'Scout fields regularly. Hand-pick larvae in small gardens. Apply Bacillus thuringiensis (Bt) or spinosad. Pheromone traps for monitoring.',
      prevention: 'Early planting, crop rotation, intercropping with beans.',
    },
    'whiteflies': {
      identification: 'Tiny white insects that fly when disturbed. Found on undersides of leaves.',
      damage: 'Sap feeding causes yellowing and leaf drop. Vectors for viral diseases.',
      control: 'Yellow sticky traps. Neem oil, insecticidal soap. Encourage natural enemies like Encarsia wasps.',
      prevention: 'Remove infested plants, avoid planting next to infested crops, use reflective mulches.',
    },
    'cutworms': {
      identification: 'Fat, greasy-looking caterpillars that curl into C-shape when disturbed.',
      damage: 'Cut seedlings at soil level. Feed at night.',
      control: 'Hand-pick at night with flashlight. Collars around seedlings. Bt spray.',
      prevention: 'Clear crop residues before planting. Till soil to expose larvae.',
    },
  },
  diseases: {
    'late blight': {
      crops: 'Tomatoes, potatoes',
      symptoms: 'Water-soaked lesions on leaves, white fungal growth on leaf undersides, brown/black patches on fruits/tubers.',
      conditions: 'Cool, wet weather. Spreads rapidly in rain.',
      control: 'Remove infected plants immediately. Apply copper-based or mancozeb fungicides preventively. Use resistant varieties. Ensure good air circulation.',
      prevention: 'Crop rotation, avoid overhead irrigation, ensure good drainage.',
    },
    'bacterial wilt': {
      crops: 'Tomatoes, potatoes, peppers, eggplant',
      symptoms: 'Rapid wilting without yellowing. Stem cross-section shows brown discoloration and oozing.',
      conditions: 'Warm, moist soils. Persists in soil for years.',
      control: 'No cure. Remove and destroy infected plants. Do not compost.',
      prevention: 'Use resistant varieties, graft onto resistant rootstock, crop rotation with non-host crops for 3-4 years.',
    },
    'rust': {
      crops: 'Maize, beans, wheat',
      symptoms: 'Orange-brown pustules on leaves and stems. Spreads via wind.',
      conditions: 'Moderate temperatures, high humidity, dew.',
      control: 'Apply sulfur or triazole fungicides. Remove and destroy infected plant debris.',
      prevention: 'Use resistant varieties, ensure good air circulation, avoid overhead irrigation.',
    },
    'mosaic virus': {
      crops: 'Tomatoes, beans, peppers, cassava',
      symptoms: 'Mottled light and dark green patterns on leaves, leaf curling, stunted growth.',
      vectors: 'Aphids, whiteflies, mechanical transmission.',
      control: 'No cure. Remove infected plants. Control aphid and whitefly vectors.',
      prevention: 'Use virus-free seeds, control vectors, avoid handling healthy plants after infected ones.',
    },
  },
  practices: {
    'irrigation': {
      principles: 'Water deeply to encourage deep roots. Water early morning to reduce evaporation and disease. Avoid wetting foliage.',
      drip: 'Most efficient. Delivers water to roots. Reduces disease. Saves 30-50% water.',
      sprinkler: 'Good for lawns and large areas. Can spread foliar diseases. Risk of uneven coverage.',
      furrow: 'Traditional method. High water use. Can cause erosion and waterlogging.',
      scheduling: 'Check soil moisture 10cm deep. If dry, water. Frequency depends on weather, soil type, and crop stage.',
    },
    'soil fertility': {
      testing: 'Test soil every 2-3 years. pH should be 6.0-7.0 for most crops.',
      organic: 'Apply compost or well-rotted manure annually (2-4 kg/sq m). Improves structure, water holding, microbial activity.',
      inorganic: 'Follow soil test recommendations. Apply at planting and top-dress as needed. Split applications for better use.',
      rotation: 'Rotate crops by family. Follow heavy feeders with legumes. Prevents depletion and pest buildup.',
      conservation: 'Mulching, cover crops, minimum tillage. Prevent erosion and maintain organic matter.',
    },
    'composting': {
      materials: 'Green (fresh): grass clippings, kitchen scraps, manure. Brown (dry): leaves, straw, paper. Ratio 2:1 green to brown.',
      process: 'Layer materials 15-30cm thick. Keep moist like squeezed sponge. Turn every 2-3 weeks. Ready in 2-6 months.',
      temperature: 'Pile should heat to 55-65°C to kill pathogens and weed seeds.',
      use: 'Apply to garden 2-4 weeks before planting. Can be used as mulch or mixed into soil.',
    },
    'intercropping': {
      benefits: 'Maximizes land use, pest control, improved soil fertility, income diversification.',
      combinations: 'Maize + beans, tomatoes + basil, maize + cowpeas, cassava + groundnuts.',
      principles: 'Combine tall and short crops, different root depths, different nutrient needs.',
    },
  },
};

function generateAIResponse(userMessage: string, context?: string): Partial<Message['metadata']> {
  const msg = userMessage.toLowerCase();
  let response = { content: '', intent: 'general', tips: [] as string[] };
  const tips = response.tips || [];
  let urgency: 'low' | 'medium' | 'high' = 'low';

  if (msg.includes('aphid') || msg.includes('pest') || msg.includes('insect')) {
    const data = knowledgeBase.pests.aphids;
    response.content = `### Aphid Control

**Identification:** ${data.identification}

**Damage:** ${data.damage}

**Control Methods:**
${data.control}

**Prevention:** ${data.prevention}

Would you like to know about other pests like fall armyworm, whiteflies, or cutworms?`;
    response.intent = 'pest';
    tips.push('Inspect plants regularly', 'Encourage beneficial insects');
    urgency = 'medium';
  } else if (msg.includes('blight') || msg.includes('disease')) {
    const data = knowledgeBase.diseases.late_blight;
    response.content = `### Late Blight Management

**Affected Crops:** ${data.crops}

**Symptoms:** ${data.symptoms}

**Conditions:** ${data.conditions}

**Control:** ${data.control}

**Prevention:** ${data.prevention}

Need help identifying the specific disease? Share a photo or describe symptoms.`;
    response.intent = 'disease';
    tips.push('Remove infected material', 'Use drip irrigation');
    urgency = 'high';
  } else if (msg.includes('tomato') || msg.includes('tomatoes')) {
    const data = knowledgeBase.crops.tomatoes;
    response.content = `### Growing Tomatoes

**Planting:** ${data.planting}

**Care:** ${data.care}

**Harvest:** ${data.harvest}

**Pests:** ${data.pests}

**Diseases:** ${data.diseases}

Are you growing tomatoes now? I can provide more specific guidance.`;
    response.intent = 'crop';
    tips.push('Stake indeterminate varieties', 'Mulch around plants');
  } else if (msg.includes('irrigat') || msg.includes('water') || msg.includes('drought')) {
    const data = knowledgeBase.practices.irrigation;
    response.content = `### Irrigation Best Practices

**Principles:** ${data.principles}

**Methods:**
- Drip: ${data.drip}
- Sprinkler: ${data.sprinkler}

**Scheduling:** ${data.scheduling}

What crops are you watering? I can recommend specific schedules.`;
    response.intent = 'irrigation';
    tips.push('Water early morning', 'Check soil moisture before watering');
  } else if (msg.includes('soil') || msg.includes('fertil') || msg.includes('compost')) {
    const data = knowledgeBase.practices.soil_fertility;
    const compost = knowledgeBase.practices.composting;
    response.content = `### Soil Fertility Management

**Testing:** ${data.testing}

**Organic Matter:** ${data.organic}

**Inorganic Fertilizers:** ${data.inorganic}

**Crop Rotation:** ${data.rotation}

**Conservation:** ${data.conservation}

### Composting:${compost.materials}

Would you like help interpreting soil test results?`;
    response.intent = 'soil';
    tips.push('Test soil every 2-3 years', 'Add compost annually');
  } else if (msg.includes('maize') || msg.includes('corn')) {
    const data = knowledgeBase.crops.maize;
    response.content = `### Growing Maize

**Planting:** ${data.planting}

**Varieties:** ${data.varieties}

**Fertilizer:** ${data.fertilizer}

**Harvest:** ${data.harvest}

Common issues: Fall armyworm, stalk borer, leaf blight. Let me know if you need help with any.`;
    response.intent = 'crop';
    tips.push('Use certified seeds', 'Scout for armyworm regularly');
  } else if (msg.includes('intercrop') || msg.includes('companion')) {
    const data = knowledgeBase.practices.intercropping;
    response.content = `### Intercropping Guide

**Benefits:** ${data.benefits}

**Combinations:** ${data.combinations}

**Principles:** ${data.principles}

Which crops are you considering?`;
    response.intent = 'practice';
    tips.push('Combine different heights', 'Consider root depths');
  } else {
    response.content = `I can help you with:

**Crop Guidance:** Best practices for growing tomatoes, maize, beans, kale, and more

**Pest Control:** Aphids, fall armyworm, whiteflies, and other common pests

**Disease Management:** Late blight, bacterial wilt, rust, and prevention strategies

**Farming Practices:** Irrigation, soil fertility, composting, intercropping

**Seasonal Advice:** Planting calendars, harvest timing, weather considerations

What would you like to know? Be specific about your crop, problem, or location for tailored advice.

*Tip: You can describe symptoms, ask about specific crops, or request seasonal guidance.*`;
    response.intent = 'general';
  }

  response.tips = tips.length > 0 ? tips : undefined;
  return { ...response, urgency } as any;
}

export default function AIAdvisor() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const { isLoading } = useQuery({
    queryKey: ['chat_history'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: true })
          .limit(50);
        if (data) setMessages(data.map(m => ({
          id: m.id.toString(),
          role: m.sender_id === 'ai-advisor' ? 'assistant' : 'user',
          content: m.content,
          created_at: m.created_at,
        })));
      }
      return [];
    },
  });

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

    const aiMetadata = generateAIResponse(content);
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: (aiMetadata as any).content || 'I understand. Let me help you with that.',
      created_at: new Date().toISOString(),
      metadata: {
        intent: aiMetadata.intent,
        tips: aiMetadata.tips,
        urgency: (aiMetadata as any).urgency,
        confidence_level: 'high',
        topic_category: aiMetadata.intent,
      },
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.success('Chat cleared');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4">
          <Bot className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">AI Farm Advisor</h1>
        <p className="text-gray-600 mt-2">Your intelligent assistant for smart farming decisions</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        {quickQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => sendMessage(q.text)}
            className="card p-4 hover:shadow-lg transition-shadow text-left group"
          >
            <q.icon className="h-6 w-6 text-primary-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">{q.text}</span>
          </button>
        ))}
      </div>

      <div className="card flex flex-col h-[60vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-600" />
            <span className="font-medium text-gray-900">Chat Session</span>
          </div>
          <button onClick={clearChat} className="text-gray-400 hover:text-gray-600" title="Clear chat">
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Ask me anything about farming, crops, pests, or best practices.</p>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gradient-to-br from-primary-500 to-primary-700 text-white'
                  }`}
                >
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className={`${msg.role === 'assistant' ? 'prose prose-sm' : ''}`}>
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown
                        components={{
                          h3: ({ children }) => <h3 className="font-bold mb-2">{children}</h3>,
                          p: ({ children }) => <p className="mb-2">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                  {msg.metadata?.tips && msg.metadata.tips.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                      {msg.metadata.tips.map((tip, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          {tip}
                        </div>
                      ))}
                    </div>
                  )}
                  <div
                    className={`text-xs mt-2 ${
                      msg.role === 'user' ? 'text-primary-200' : 'text-gray-400'
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about crops, pests, diseases, or best practices..."
              className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={1}
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="btn btn-primary px-6"
            >
              {isTyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
