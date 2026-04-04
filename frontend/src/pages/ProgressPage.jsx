import { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Activity, Target, Sparkles, Clock } from "lucide-react";

const ProgressPage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await API.get("/completed-challenges/progress");
      setData(res.data);
    } catch (error) {
      console.error("Progress fetch error:", error);
      setError(error.response?.data?.message || "Failed to load progress");
    }
  };

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
          <p className="text-red-400 text-lg">{error}</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <p className="text-lg animate-pulse">Loading your progress...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Background collage / glow layers */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-72 bg-gradient-to-b from-black via-[#140014] to-transparent opacity-90"></div>

          <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/20 blur-3xl rounded-full"></div>
          <div className="absolute top-60 right-10 w-80 h-80 bg-purple-500/20 blur-3xl rounded-full"></div>
          <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-red-500/10 blur-3xl rounded-full"></div>

          {/* paper style blocks */}
          <div className="absolute top-32 left-0 w-64 h-40 bg-white/10 rotate-[-8deg] rounded-sm"></div>
          <div className="absolute top-64 right-0 w-72 h-44 bg-zinc-200/10 rotate-[6deg] rounded-sm"></div>
          <div className="absolute bottom-40 left-10 w-60 h-36 bg-pink-200/10 rotate-[4deg] rounded-sm"></div>
          <div className="absolute bottom-10 right-20 w-72 h-40 bg-red-300/10 rotate-[-5deg] rounded-sm"></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 px-6 md:px-12 py-12 max-w-7xl mx-auto">
          {/* Hero */}
          <div className="mb-14">
            <p className="uppercase tracking-[0.3em] text-sm text-zinc-400 mb-3">
              Personal Growth Dashboard
            </p>
            <h1 className="text-4xl md:text-6xl font-black leading-tight max-w-3xl">
              Your <span className="text-pink-400">Progress</span> tells a story.
            </h1>
            <p className="text-zinc-300 mt-5 max-w-2xl text-lg">
              Every challenge completed is a small win. Keep showing up for yourself.
            </p>
          </div>

          {/* Top stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white/8 backdrop-blur-xl border border-white/10 rounded-3xl p-7 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-pink-500/20 rounded-2xl">
                  <Target className="w-6 h-6 text-pink-400" />
                </div>
                <span className="text-zinc-400 text-sm">All time</span>
              </div>
              <h3 className="text-zinc-300 text-lg mb-2">Total Completed</h3>
              <p className="text-5xl font-extrabold">{data.total}</p>
            </div>

            <div className="bg-white/8 backdrop-blur-xl border border-white/10 rounded-3xl p-7 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-2xl">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-zinc-400 text-sm">Today</span>
              </div>
              <h3 className="text-zinc-300 text-lg mb-2">Completed Today</h3>
              <p className="text-5xl font-extrabold">{data.today}</p>
            </div>
          </div>

          {/* Category + Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Category Progress */}
            <div className="bg-white/8 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-500/20 rounded-2xl">
                  <Activity className="w-6 h-6 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold">Category Progress</h2>
              </div>

              <div className="space-y-5">
                {Object.entries(data.categoryStats || {}).map(([cat, count]) => {
                  const percentage = data.total
                    ? Math.min((count / data.total) * 100, 100)
                    : 0;

                  return (
                    <div key={cat}>
                      <div className="flex justify-between mb-2">
                        <span className="text-zinc-200 font-medium">{cat}</span>
                        <span className="text-zinc-400">{count}</span>
                      </div>

                      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-red-500 transition-all duration-700"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/8 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-cyan-500/20 rounded-2xl">
                  <Clock className="w-6 h-6 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-bold">Recent Activity</h2>
              </div>

              <div className="space-y-4">
                {(data.completed || []).slice(-5).reverse().map((c) => (
                  <div
                    key={c._id}
                    className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-5 py-4 hover:bg-white/10 transition"
                  >
                    <div>
                      <p className="font-medium text-white">
                        ✅ {c.challenge?.title || "Challenge completed"}
                      </p>
                      <p className="text-sm text-zinc-400">
                        Keep going, you're building momentum.
                      </p>
                    </div>
                  </div>
                ))}

                {(!data.completed || data.completed.length === 0) && (
                  <p className="text-zinc-400">No recent activity yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom quote block */}
          <div className="mt-14 bg-gradient-to-r from-white/5 via-pink-500/10 to-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
            <p className="text-zinc-300 text-lg italic max-w-3xl leading-relaxed">
              “Progress isn’t always loud. Sometimes it looks like getting up, trying again,
              or finishing one small challenge on a hard day.”
            </p>
            <p className="mt-4 text-pink-400 font-semibold">— Zenly</p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProgressPage;