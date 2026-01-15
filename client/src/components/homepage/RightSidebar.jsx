import { useEffect, useState } from "react";
import api from "../../api/axios";
import { devotionalsData } from "../../data/devotionalsData";
import { CheckCircle2, Quote, Sparkles } from "lucide-react";

export default function RightSidebar() {
  const [devotional, setDevotional] = useState(null);
  const [amenClicked, setAmenClicked] = useState(false);

  // Pick random devotional ONCE
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * devotionalsData.length);
    setDevotional(devotionalsData[randomIndex]);
  }, []);

  const handleAmen = async () => {
    setAmenClicked(true);
    try {
      await api.post("/users/amen");
    } catch (err) {
      console.error("Failed to record amen", err);
    }
  };

  if (!devotional) return null;

  return (
    <div className="p-4 flex flex-col h-[calc(100vh-20px)] bg-white dark:bg-gray-900">
      {/* Suggestions Section */}
      <div className="flex flex-col gap-5 mb-8">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
            Churches for you
          </h2>
          <button className="text-[11px] font-bold text-green-600 hover:text-green-500 transition-colors uppercase tracking-wider">
            Explore
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {[
            {
              name: "Grace Community",
              loc: "St. John's",
              img: "/logo1.jpg",
              verified: true,
            },
            {
              name: "Faith Assembly",
              loc: "Nairobi",
              img: "/logo2.jpg",
              verified: false,
            },
            {
              name: "The Ark",
              loc: "London",
              img: "/logo3.jpg",
              verified: true,
            },
          ].map((church, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center group cursor-pointer p-2 -m-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700 group-hover:from-green-400 group-hover:to-emerald-500 transition-all duration-500">
                    <img
                      src={church.img}
                      onError={(e) => {
                        e.target.src = "/logo2.jpg";
                      }}
                      alt=""
                      className="w-full h-full rounded-full object-cover border-2 border-white dark:border-gray-950"
                    />
                  </div>
                  {church.verified && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-gray-950 rounded-full p-0.5 shadow-sm">
                      <CheckCircle2
                        size={13}
                        className="text-green-500 fill-green-500/10"
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {church.name}
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">
                    {church.loc}
                  </span>
                </div>
              </div>
              <button className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 hover:border-green-500 hover:bg-green-500 hover:text-white dark:hover:bg-green-500 dark:hover:border-green-500 transition-all duration-300 active:scale-90">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto px-1">
        {/* Daily Bread (Devotional) Section - Minimalistic */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-900 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-green-500">
              Daily Bread
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[14px] leading-relaxed text-gray-800 dark:text-gray-200 font-medium italic">
              "{devotional.verse}"
            </p>
            {/* <p className="text-[12px] leading-relaxed text-gray-500 dark:text-gray-400 italic">
              {devotional.prayer}
            </p> */}
          </div>

          <button
            onClick={handleAmen}
            className={`
              w-full py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200
              ${
                amenClicked
                  ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800"
                  : "bg-gray-50 dark:bg-white-900 text-gray-700 dark:text-black border border-gray-100 dark:border-gray-800 hover:bg-green-500 dark:hover:bg-green-500 cursor-pointer"
              }
            `}
          >
            {amenClicked ? "Recorded in logs" : "Amen"}
          </button>
        </div>
      </div>
    </div>
  );
}
