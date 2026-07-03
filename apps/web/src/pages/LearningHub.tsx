import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { formatDate } from '../lib/utils';
import { BookOpen, Play, Clock, CircleCheck as CheckCircle, Lock, Star, ChevronRight, Circle as HelpCircle, Award, Loader as Loader2, CircleAlert as AlertCircle, FileText, Video, List, Grid2x2 as Grid, Search, ListFilter as Filter, X, ArrowLeft, Bookmark, Share2 } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  lessons_count: number;
  enrolled: number;
  rating: number;
  thumbnail: string;
  instructor: string;
  modules: Module[];
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  order: number;
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'exercise';
  duration: number;
  completed: boolean;
  locked: boolean;
}

interface Quiz {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface UserProgress {
  course_id: string;
  completed_lessons: number;
  total_lessons: number;
  quiz_scores: number[];
  started_at: string;
  last_accessed: string;
  certificate_eligible: boolean;
}

const categories = ['All', 'Crop Production', 'Pest Management', 'Livestock', 'Soil Science', 'Business Skills', 'Technology'];
const levels = ['beginner', 'intermediate', 'advanced'];

const coursesData: Course[] = [
  {
    id: '1',
    title: 'Introduction to Sustainable Farming',
    description: 'Learn the fundamentals of sustainable and organic farming practices suited for Kenyan climate.',
    category: 'Crop Production',
    level: 'beginner',
    duration: 480,
    lessons_count: 24,
    enrolled: 3240,
    rating: 4.8,
    thumbnail: 'https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg?w=400&auto=format',
    instructor: 'Dr. Mary Wambui',
    modules: [
      {
        id: 'm1',
        title: 'Module 1: Soil Health Fundamentals',
        order: 1,
        lessons: [
          { id: 'l1', title: 'Understanding Soil Types', type: 'video', duration: 15, completed: true, locked: false },
          { id: 'l2', title: 'Testing Your Soil', type: 'video', duration: 12, completed: true, locked: false },
          { id: 'l3', title: 'Composting Basics', type: 'article', duration: 10, completed: false, locked: false },
          { id: 'l4', title: 'Soil Quiz', type: 'quiz', duration: 10, completed: false, locked: false },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'Tomato Growing Masterclass',
    description: 'Complete guide to growing tomatoes from seed to harvest in East Africa.',
    category: 'Crop Production',
    level: 'intermediate',
    duration: 360,
    lessons_count: 18,
    enrolled: 2150,
    rating: 4.9,
    thumbnail: 'https://images.pexels.com/photos/1327721/pexels-photo-1327721.jpeg?w=400&auto=format',
    instructor: 'Peter Kamau',
    modules: [],
  },
  {
    id: '3',
    title: 'Integrated Pest Management',
    description: 'Learn to identify, prevent, and control common pests using sustainable methods.',
    category: 'Pest Management',
    level: 'intermediate',
    duration: 420,
    lessons_count: 16,
    enrolled: 1890,
    rating: 4.7,
    thumbnail: 'https://images.pexels.com/photos/5939089/pexels-photo-5939089.jpeg?w=400&auto=format',
    instructor: 'Dr. James Ochieng',
    modules: [],
  },
  {
    id: '4',
    title: 'Dairy Farming Essentials',
    description: 'Everything you need to start and manage a profitable dairy farm.',
    category: 'Livestock',
    level: 'beginner',
    duration: 540,
    lessons_count: 28,
    enrolled: 2540,
    rating: 4.6,
    thumbnail: 'https://images.pexels.com/photos/1904105/pexels-photo-1904105.jpeg?w=400&auto=format',
    instructor: 'Sarah Wanjiku',
    modules: [],
  },
  {
    id: '5',
    title: 'Farm Business Planning',
    description: 'Create a solid business plan, manage finances, and maximize farm profitability.',
    category: 'Business Skills',
    level: 'intermediate',
    duration: 320,
    lessons_count: 14,
    enrolled: 1230,
    rating: 4.5,
    thumbnail: 'https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg?w=400&auto=format',
    instructor: 'Michael Njoroge',
    modules: [],
  },
  {
    id: '6',
    title: 'Digital Tools for Modern Farming',
    description: 'Use smartphones, apps, and online platforms to boost your farming productivity.',
    category: 'Technology',
    level: 'beginner',
    duration: 240,
    lessons_count: 12,
    enrolled: 1980,
    rating: 4.4,
    thumbnail: 'https://images.pexels.com/photos/259728/pexels-photo-259728.jpeg?w=400&auto=format',
    instructor: 'Tech Expert Team',
    modules: [],
  },
];

const quizzes: Quiz[] = [
  {
    id: 'q1',
    question: 'What is the ideal pH range for most vegetable crops?',
    options: ['4.0-5.0', '5.5-6.5', '6.0-7.0', '7.5-8.5'],
    correct: 2,
    explanation: 'Most vegetables thrive in slightly acidic to neutral soil with pH 6.0-7.0.',
  },
  {
    id: 'q2',
    question: 'Which of these is a sign of nitrogen deficiency in plants?',
    options: ['Yellowing of older leaves', 'Purple stems', 'Brown leaf tips', 'Wilting flowers'],
    correct: 0,
    explanation: 'Nitrogen is mobile in plants, so deficiency symptoms appear first on older leaves.',
  },
  {
    id: 'q3',
    question: 'What is the recommended watering time to minimize evaporation?',
    options: ['Midday', 'Early morning', 'Late afternoon', 'Evening'],
    correct: 1,
    explanation: 'Early morning watering minimizes evaporation and gives foliage time to dry before evening.',
  },
];

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export default function LearningHub() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const { data: userProgress, isLoading } = useQuery<{ results: UserProgress[] }>({
    queryKey: ['learning_progress'],
    queryFn: async () => {
      return { results: [] };
    },
  });

  const filteredCourses = coursesData.filter(course => {
    const matchesCategory = activeCategory === 'All' || course.category === activeCategory;
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (selectedCourse) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button
          onClick={() => setSelectedCourse(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Courses
        </button>

        <div className="relative h-48 md:h-64 rounded-xl overflow-hidden mb-6">
          <img
            src={selectedCourse.thumbnail}
            alt={selectedCourse.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <span className="text-xs uppercase tracking-wide bg-primary-600 px-2 py-1 rounded">
              {selectedCourse.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold mt-2">{selectedCourse.title}</h1>
            <p className="text-sm opacity-90 mt-1">by {selectedCourse.instructor}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="md:col-span-3 space-y-6">
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-4">Course Content</h2>
              {selectedCourse.modules.map(module => (
                <div key={module.id} className="mb-6 last:mb-0">
                  <h3 className="font-medium text-gray-900 mb-3">{module.title}</h3>
                  <div className="space-y-2">
                    {module.lessons.map(lesson => (
                      <button
                        key={lesson.id}
                        onClick={() => lesson.type === 'quiz' && setActiveQuiz(quizzes[0])}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          lesson.locked
                            ? 'bg-gray-50 opacity-50 cursor-not-allowed'
                            : lesson.completed
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        disabled={lesson.locked}
                      >
                        <div className="flex-shrink-0">
                          {lesson.locked ? (
                            <Lock className="h-5 w-5 text-gray-400" />
                          ) : lesson.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : lesson.type === 'video' ? (
                            <Play className="h-5 w-5 text-primary-600" />
                          ) : lesson.type === 'quiz' ? (
                            <HelpCircle className="h-5 w-5 text-orange-500" />
                          ) : (
                            <FileText className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <span className={`font-medium ${lesson.completed ? 'text-green-700' : 'text-gray-900'}`}>
                            {lesson.title}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">{formatDuration(lesson.duration)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="text-sm text-gray-500">
                {selectedCourse.modules.reduce((sum, m) => sum + m.lessons.filter(l => l.completed).length, 0)} of {selectedCourse.lessons_count} lessons completed
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-5 w-5 text-gray-400" />
                <span>{formatDuration(selectedCourse.duration)} total</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <BookOpen className="h-5 w-5 text-gray-400" />
                <span>{selectedCourse.lessons_count} lessons</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span>{selectedCourse.rating} rating</span>
              </div>
            </div>
            <button className="btn btn-primary w-full">Continue Learning</button>
          </div>
        </div>
      </div>
    );
  }

  if (activeQuiz) {
    const isCorrect = quizAnswer === activeQuiz.correct;
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => { setActiveQuiz(null); setQuizAnswer(null); setQuizSubmitted(false); }}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Course
        </button>

        <div className="card p-8">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-gray-500">Question 1 of 3</span>
            <HelpCircle className="h-5 w-5 text-gray-400" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-6">{activeQuiz.question}</h2>

          <div className="space-y-3 mb-8">
            {activeQuiz.options.map((option, i) => (
              <button
                key={i}
                onClick={() => !quizSubmitted && setQuizAnswer(i)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  quizAnswer === i
                    ? quizSubmitted
                      ? i === activeQuiz.correct
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                disabled={quizSubmitted}
              >
                <span className="font-medium">{option}</span>
              </button>
            ))}
          </div>

          {quizSubmitted && (
            <div className={`p-4 rounded-xl mb-6 ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <p className="font-medium">{isCorrect ? 'Correct!' : 'Incorrect'}</p>
              <p className="text-sm mt-1">{activeQuiz.explanation}</p>
            </div>
          )}

          <button
            onClick={() => quizSubmitted ? setActiveQuiz(null) : setQuizSubmitted(true)}
            disabled={quizAnswer === null}
            className="btn btn-primary w-full"
          >
            {quizSubmitted ? 'Continue' : 'Submit Answer'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Hub</h1>
          <p className="text-gray-600 mt-1">Master modern farming with structured courses</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="input pl-10"
            />
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">6</div>
            <div className="text-sm text-gray-600">Courses</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">2</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">12h</div>
            <div className="text-sm text-gray-600">Total Time</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
            <Award className="h-6 w-6 text-accent-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">1</div>
            <div className="text-sm text-gray-600">Certificate</div>
          </div>
        </div>
      </div>

      <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredCourses.map(course => (
          <CourseCard
            key={course.id}
            course={course}
            viewMode={viewMode}
            onSelect={() => setSelectedCourse(course)}
          />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No courses found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

function CourseCard({ course, viewMode, onSelect }: { course: Course; viewMode: 'grid' | 'list'; onSelect: () => void }) {
  const levelColors = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700',
  };

  if (viewMode === 'list') {
    return (
      <div className="card p-4 flex gap-4" onClick={onSelect}>
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500">{course.category}</span>
            <span className={`text-xs px-2 py-0.5 rounded ${levelColors[course.level]}`}>
              {course.level}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
          <p className="text-sm text-gray-600 mt-1 truncate">{course.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>{course.duration} min</span>
            <span>{course.lessons_count} lessons</span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              {course.rating}
            </span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden group cursor-pointer" onClick={onSelect}>
      <div className="relative">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded ${levelColors[course.level]}`}>
          {course.level}
        </span>
      </div>
      <div className="p-4">
        <div className="text-xs text-gray-500 mb-1">{course.category}</div>
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{course.description}</p>
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-medium text-gray-900">{course.rating}</span>
          </div>
          <div className="text-gray-500">{course.lessons_count} lessons</div>
        </div>
      </div>
    </div>
  );
}
