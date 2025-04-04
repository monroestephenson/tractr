import React, { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";
import { EffectCards } from 'swiper/modules';
import { tractorProfiles, TractorProfile } from "../data/tractorProfiles";
import TractorCard from "./TractorCard";
import SwipeButtons from "./SwipeButtons";
import MatchPopup from "./MatchPopup";
import { toast } from "sonner";
import { MessageCircle, Tractor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-cards";

// Type for storing matches
interface StoredMatch {
  tractor: TractorProfile;
  timestamp: number;
  messages: { text: string; fromUser: boolean; timestamp: number; }[];
}

const TractorSwiper: React.FC = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedTractor, setMatchedTractor] = useState<TractorProfile | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const [matches, setMatches] = useState<StoredMatch[]>(() => {
    const stored = localStorage.getItem('tractorMatches');
    return stored ? JSON.parse(stored) : [];
  });

  // Save matches to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tractorMatches', JSON.stringify(matches));
  }, [matches]);
  
  // Shuffle the tractor profiles to get a random order
  const shuffledProfiles = useRef([...tractorProfiles].sort(() => Math.random() - 0.5));

  // Debug on mount
  useEffect(() => {
    console.log("TractorSwiper mounted");
    console.log("Number of profiles:", shuffledProfiles.current.length);
    console.log("First profile:", shuffledProfiles.current[0]);
  }, []);

  const handleSwipeLeft = () => {
    swiperRef.current?.slideNext();
    toast.error("Not your type of tractor!");
  };

  const handleSwipeRight = () => {
    const currentTractor = shuffledProfiles.current[currentIndex];
    if (Math.random() < 0.8) {
      // Create new match
      const newMatch: StoredMatch = {
        tractor: currentTractor,
        timestamp: Date.now(),
        messages: []
      };
      setMatches(prev => [...prev, newMatch]);
      setMatchedTractor(currentTractor);
      setShowMatch(true);
    } else {
      toast.info("They didn't swipe right on you. Keep looking!");
    }
    swiperRef.current?.slideNext();
  };

  const handleSwiperSlideChange = (swiper: SwiperType) => {
    setCurrentIndex(swiper.activeIndex);
  };

  const handleSwipe = (swiper: SwiperType) => {
    const swipeDirection = swiper.swipeDirection;
    if (swipeDirection === 'next') {
      handleSwipeLeft();
    } else if (swipeDirection === 'prev') {
      handleSwipeRight();
    }
  };

  const handleMessagesClick = () => {
    navigate('/messages');
  };

  return (
    <div className="h-full w-full relative flex flex-col bg-white">
      {/* Tractr Header */}
      <div className="p-4 flex items-center">
        <div className="flex items-center text-green-600 font-bold text-xl">
          <Tractor className="h-6 w-6 mr-2" />
          Tractr
        </div>
      </div>

      {/* Messages Button */}
      <div className="absolute top-4 right-4 z-30">
        <Button
          onClick={handleMessagesClick}
          variant="outline"
          size="icon"
          className="bg-white/90 backdrop-blur-sm hover:bg-white rounded-full w-12 h-12 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
          {matches.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {matches.length}
            </span>
          )}
        </Button>
      </div>

      <div className="flex-1 w-full overflow-hidden px-2">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            console.log("Swiper initialized");
          }}
          onSlideChange={handleSwiperSlideChange}
          onTouchEnd={handleSwipe}
          effect={'cards'}
          modules={[EffectCards]}
          cardsEffect={{
            slideShadows: false,
            perSlideRotate: 4,
            perSlideOffset: 8,
          }}
          grabCursor={true}
          className="w-full h-[calc(100vh-160px)] max-w-[95%] mx-auto"
          allowTouchMove={true}
          resistance={true}
          resistanceRatio={0.85}
          touchRatio={1.5}
          touchAngle={45}
          followFinger={true}
          threshold={5}
        >
          {shuffledProfiles.current.map((tractor, idx) => (
            <SwiperSlide key={tractor.id || idx} className="rounded-xl overflow-hidden">
              <TractorCard tractor={tractor} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      
      <div className="-mt-6 pb-2">
        <SwipeButtons
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />
      </div>
      
      {showMatch && matchedTractor && (
        <MatchPopup
          tractor={matchedTractor}
          onClose={() => setShowMatch(false)}
        />
      )}
    </div>
  );
};

export default TractorSwiper;
