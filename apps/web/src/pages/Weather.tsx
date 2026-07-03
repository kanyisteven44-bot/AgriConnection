import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { formatDate, formatTime } from '../lib/utils';
import { Cloud, Sun, CloudRain, CloudSnow, CloudFog, Thermometer, Wind, Droplets, MapPin, Loader as Loader2, CircleAlert as AlertCircle, RefreshCw, Calendar, Umbrella, SunMedium, Moon, CloudSun } from 'lucide-react';

interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
  precipitation: number;
}

interface Forecast {
  date: string;
  temp_high: number;
  temp_low: number;
  description: string;
  icon: string;
  precipitation: number;
}

interface WeatherAlert {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  expires_at: string;
}

interface AgricultureAdvice {
  title: string;
  description: string;
  icon: string;
  type: 'planting' | 'irrigation' | 'pest' | 'harvest';
}

const weatherIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  '01d': Sun,
  '01n': Moon,
  '02d': CloudSun,
  '02n': Cloud,
  '03d': Cloud,
  '03n': Cloud,
  '04d': Cloud,
  '04n': Cloud,
  '09d': CloudRain,
  '09n': CloudRain,
  '10d': CloudRain,
  '10n': CloudRain,
  '11d': CloudRain,
  '11n': CloudRain,
  '13d': CloudSnow,
  '13n': CloudSnow,
  '50d': CloudFog,
  '50n': CloudFog,
};

const severityColors = {
  low: 'bg-yellow-50 border-yellow-300 text-yellow-800',
  moderate: 'bg-orange-50 border-orange-300 text-orange-800',
  high: 'bg-red-50 border-red-300 text-red-800',
  extreme: 'bg-red-100 border-red-400 text-red-900',
};

export default function Weather() {
  const [location, setLocation] = useState<string>('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const getWeatherIcon = (iconCode: string) => {
    return weatherIcons[iconCode] || Cloud;
  };

  const { data: weather, isLoading, error, refetch } = useQuery({
    queryKey: ['weather', coords],
    queryFn: async (): Promise<{ current: WeatherData; forecast: Forecast[]; alerts: WeatherAlert[]; advice: AgricultureAdvice[] }> => {
      if (!coords) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('auth_users')
            .select('location, latitude, longitude')
            .eq('id', user.id)
            .single();
          if (profile?.latitude && profile?.longitude) {
            setCoords({ lat: profile.latitude, lng: profile.longitude });
            setLocation(profile.location || '');
          }
        }
      }

      const lat = coords?.lat || -1.2864;
      const lng = coords?.lng || 36.8172;
      setLocation(coords ? location : 'Nairobi, Kenya');

      const current: WeatherData = {
        temp: Math.round(22 + Math.random() * 8),
        feels_like: Math.round(20 + Math.random() * 6),
        humidity: Math.round(50 + Math.random() * 30),
        wind_speed: Math.round(5 + Math.random() * 15),
        description: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Scattered Showers'][Math.floor(Math.random() * 5)],
        icon: ['01d', '02d', '03d', '04d', '10d'][Math.floor(Math.random() * 5)],
        precipitation: Math.round(Math.random() * 30),
      };

      const forecast: Forecast[] = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
        temp_high: Math.round(24 + Math.random() * 8),
        temp_low: Math.round(12 + Math.random() * 6),
        description: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rain', 'Showers'][Math.floor(Math.random() * 5)],
        icon: ['01d', '02d', '03d', '10d', '02d'][Math.floor(Math.random() * 5)],
        precipitation: Math.round(Math.random() * 50),
      }));

      const alerts: WeatherAlert[] = current.precipitation > 60 ? [{
        id: '1',
        type: 'rain',
        title: 'Heavy Rain Expected',
        description: 'Heavy rainfall expected in your area. Consider protecting sensitive crops and ensuring proper drainage.',
        severity: 'moderate',
        expires_at: new Date(Date.now() + 12 * 3600000).toISOString(),
      }] : [];

      const advice = generateAdvice(current, forecast[0]);

      return { current, forecast, alerts, advice };
    },
    staleTime: 10 * 60 * 1000,
  });

  function generateAdvice(current: WeatherData, tomorrow: Forecast): AgricultureAdvice[] {
    const advices: AgricultureAdvice[] = [];

    if (current.precipitation < 20 && current.temp > 25) {
      advices.push({
        title: 'Irrigation Recommended',
        description: 'Low precipitation expected. Consider irrigating crops early morning or late evening.',
        icon: 'droplets',
        type: 'irrigation',
      });
    }

    if (tomorrow.precipitation > 50) {
      advices.push({
        title: 'Postpone Spraying',
        description: 'Rain expected tomorrow. Avoid pesticide/fertilizer spraying that could be washed away.',
        icon: 'pest',
        type: 'pest',
      });
    }

    if (current.humidity > 70 && current.temp > 20) {
      advices.push({
        title: 'Watch for Fungal Diseases',
        description: 'High humidity creates favorable conditions for fungal growth. Monitor crops closely.',
        icon: 'pest',
        type: 'pest',
      });
    }

    if (current.temp > 30) {
      advices.push({
        title: 'Protect from Heat',
        description: 'High temperatures may stress plants. Consider mulching and providing shade for seedlings.',
        icon: 'sun',
        type: 'planting',
      });
    }

    return advices;
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocation('Current Location');
        setGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setGettingLocation(false);
      }
    );
  };

  const Icon = weather?.current ? getWeatherIcon(weather.current.icon) : Cloud;

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load weather data</h2>
          <button onClick={() => refetch()} className="btn btn-primary mt-4">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Weather & Climate</h1>
          <p className="text-gray-600 mt-1 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {location || 'Nairobi, Kenya'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={getCurrentLocation}
            disabled={gettingLocation}
            className="btn btn-secondary"
          >
            {gettingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            {gettingLocation ? 'Getting...' : 'My Location'}
          </button>
          <button onClick={() => refetch()} className="btn btn-secondary">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {weather?.alerts && weather.alerts.length > 0 && (
        <div className="mb-6 space-y-3">
          {weather.alerts.map(alert => (
            <div
              key={alert.id}
              className={`border rounded-xl p-4 ${severityColors[alert.severity]}`}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">{alert.title}</h3>
                  <p className="text-sm mt-1">{alert.description}</p>
                  <p className="text-xs mt-2 opacity-75">Expires: {formatDate(alert.expires_at)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : weather && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card p-6 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm opacity-80">Current Weather</div>
                  <div className="text-6xl font-bold mt-2">{weather.current.temp}°C</div>
                  <div className="text-lg mt-2">{weather.current.description}</div>
                  <div className="text-sm opacity-80 mt-1">Feels like {weather.current.feels_like}°C</div>
                </div>
                <Icon className="h-24 w-24 opacity-80" />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
                <div className="text-center">
                  <Droplets className="h-6 w-6 mx-auto mb-2 opacity-80" />
                  <div className="text-2xl font-bold">{weather.current.humidity}%</div>
                  <div className="text-xs opacity-80">Humidity</div>
                </div>
                <div className="text-center">
                  <Wind className="h-6 w-6 mx-auto mb-2 opacity-80" />
                  <div className="text-2xl font-bold">{weather.current.wind_speed} km/h</div>
                  <div className="text-xs opacity-80">Wind Speed</div>
                </div>
                <div className="text-center">
                  <Umbrella className="h-6 w-6 mx-auto mb-2 opacity-80" />
                  <div className="text-2xl font-bold">{weather.current.precipitation}%</div>
                  <div className="text-xs opacity-80">Precipitation</div>
                </div>
              </div>
            </div>

            <div className="card p-6 mt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-600" />
                7-Day Forecast
              </h2>
              <div className="grid grid-cols-7 gap-2">
                {weather.forecast.map((day, i) => {
                  const DayIcon = getWeatherIcon(day.icon);
                  const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : new Date(day.date).toLocaleDateString('en-KE', { weekday: 'short' });
                  return (
                    <div key={day.date} className="text-center p-3 rounded-xl bg-gray-50">
                      <div className="text-xs font-medium text-gray-600">{dayName}</div>
                      <DayIcon className="h-8 w-8 mx-auto my-2 text-primary-600" />
                      <div className="text-sm font-bold">{day.temp_high}°</div>
                      <div className="text-xs text-gray-500">{day.temp_low}°</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <SunMedium className="h-5 w-5 text-primary-600" />
                Farming Advice
              </h2>
              {weather.advice.length === 0 ? (
                <p className="text-gray-500 text-sm">No special advice at this time.</p>
              ) : (
                <div className="space-y-4">
                  {weather.advice.map((advice, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-xl">
                      <h3 className="font-medium text-gray-900">{advice.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{advice.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-6 bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Sun Schedule</h2>
              <div className="flex justify-around">
                <div className="text-center">
                  <SunMedium className="h-8 w-8 mx-auto text-orange-500" />
                  <div className="text-sm font-medium mt-2">Sunrise</div>
                  <div className="text-lg font-bold">6:23 AM</div>
                </div>
                <div className="text-center">
                  <Moon className="h-8 w-8 mx-auto text-indigo-500" />
                  <div className="text-sm font-medium mt-2">Sunset</div>
                  <div className="text-lg font-bold">6:45 PM</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
