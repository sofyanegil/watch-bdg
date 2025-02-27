'use client';

import { useState, useEffect } from 'react';
import { CCTV } from '@/types';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn, generateSlug, getCityColor } from '@/lib/utils';
import LoadingVideo from '../common/LoadingVideo';
import { Button } from '@/components/ui/button';
import { Star, StarOff } from 'lucide-react';

export default function CardCCTV({ cctv_id, cctv_name: title, cctv_stream: streamUrl, cctv_city }: CCTV) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [videoStatus, setVideoStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [videoKey, setVideoKey] = useState(0);

  useEffect(() => {
    setIsFavorite(JSON.parse(localStorage.getItem('favorites') || '[]').includes(cctv_id));
  }, [cctv_id]);

  const toggleFavorite = () => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const updatedFavorites = savedFavorites.includes(cctv_id) ? savedFavorites.filter((favId: string) => favId !== cctv_id) : [...savedFavorites, cctv_id];

    setIsFavorite(!isFavorite);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const retryVideo = () => {
    setVideoStatus('loading');
    setVideoKey((prevKey) => prevKey + 1);
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-lg rounded-xl overflow-hidden">
      <div className="aspect-video bg-black relative">
        {videoStatus === 'loading' && <LoadingVideo />}

        {videoStatus !== 'error' ? (
          <video key={videoKey} autoPlay controls muted playsInline onLoadedData={() => setVideoStatus('success')} onError={() => setVideoStatus('error')} className="w-full h-full">
            <source src={streamUrl} type="application/x-mpegURL" />
          </video>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 text-white">
            <p className="text-red-500 font-semibold">Stream Unavailable</p>
            <Button variant={'destructive'} onClick={retryVideo} className="mt-3">
              Retry
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 border-t dark:border-gray-700">
        <div className="flex justify-between items-center">
          <Link href={`/cctv/${generateSlug(title)}`} className="hover:underline">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer">{title}</h3>
          </Link>
          <Button variant="outline" size="icon" onClick={toggleFavorite} className={cn('rounded-full transition-transform hover:text-yellow-600', isFavorite ? 'text-yellow-500 scale-110' : 'text-gray-400')}>
            {isFavorite ? <Star fill="currentColor" /> : <StarOff />}
          </Button>
        </div>

        {cctv_city && (
          <div className="mt-2">
            <Badge className={`text-white ${getCityColor(cctv_city)} rounded-full`}>{cctv_city}</Badge>
          </div>
        )}
      </div>
    </div>
  );
}
