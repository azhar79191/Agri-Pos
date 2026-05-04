import React, { useState } from "react";
import { Calendar, Sprout, Clock, CheckCircle2, AlertCircle, TrendingUp, Droplet, Sun, CloudRain } from "lucide-react";
import { CROPS, CROP_CALENDAR } from "../../data/cropAdvisory";

const CropCalendarPage = () => {
  const [selectedCrop, setSelectedCrop] = useState("cotton");

  const cropData = CROPS.find(c => c.id === selectedCrop);
  const calendarData = CROP_CALENDAR[selectedCrop];

  const getCurrentMonth = () => new Date().getMonth() + 1;
  const currentMonth = getCurrentMonth();

  const isSowingMonth = cropData?.sowingMonths?.includes(currentMonth);

  const getMonthName = (month) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[month - 1];
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-sm">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Crop Calendar & Growth Stages</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Plan your farming activities with seasonal guidance</p>
        </div>
      </div>

      {/* Current Season Alert */}
      {isSowingMonth && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-emerald-900 dark:text-emerald-300">Perfect Sowing Time!</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                {getMonthName(currentMonth)} is ideal for sowing {cropData?.name}. Start your preparation now.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Crop Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-5">
        <h3 className="font-bold text-slate-900 dark:text-white mb-3">Select Crop</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CROPS.filter(c => CROP_CALENDAR[c.id]).map(crop => (
            <button key={crop.id} onClick={() => setSelectedCrop(crop.id)}
              className={`p-3 rounded-lg border transition-all ${
                selectedCrop === crop.id
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}>
              <div className="text-2xl mb-1">{crop.icon}</div>
              <p className="font-semibold text-slate-900 dark:text-white text-xs">{crop.name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{crop.season}</p>
            </button>
          ))}
        </div>
      </div>

      {calendarData && (
        <>
          {/* Crop Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <p className="text-xs text-slate-500 uppercase tracking-wider">Duration</p>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{calendarData.duration} days</p>
              <p className="text-xs text-slate-500 mt-1">~{Math.round(calendarData.duration / 30)} months</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sprout className="w-4 h-4 text-emerald-500" />
                <p className="text-xs text-slate-500 uppercase tracking-wider">Growth Stages</p>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{calendarData.stages.length}</p>
              <p className="text-xs text-slate-500 mt-1">Key phases</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <p className="text-xs text-slate-500 uppercase tracking-wider">Sowing Months</p>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {cropData?.sowingMonths?.map(m => getMonthName(m)).join(", ") || "Year-round"}
              </p>
            </div>
          </div>

          {/* Critical Periods */}
          {calendarData.criticalPeriods && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="font-bold text-amber-900 dark:text-amber-300">Critical Periods - Extra Care Needed</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {calendarData.criticalPeriods.map((period, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full text-sm font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {period}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Growth Stages Timeline */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Growth Stages & Activities
            </h3>
            {calendarData.stages.map((stage, index) => (
              <div key={index} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-5 relative">
                {/* Stage Number Badge */}
                <div className="absolute -left-3 top-5 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-lg">
                  {index + 1}
                </div>

                <div className="ml-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">{stage.name}</h4>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        Days {stage.days}
                      </p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                      Stage {index + 1}/{calendarData.stages.length}
                    </div>
                  </div>

                  {/* Activities */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Key Activities</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {stage.activities.map((activity, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                        style={{ width: `${((index + 1) / calendarData.stages.length) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Seasonal Tips */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-5">
            <div className="flex items-center gap-2 mb-3">
              <CloudRain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-slate-900 dark:text-white">Seasonal Tips</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-white/50 dark:bg-slate-800/50">
                <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Irrigation</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Maintain consistent moisture during critical growth stages. Reduce water 2 weeks before harvest.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/50 dark:bg-slate-800/50">
                <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Pest Monitoring</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Scout fields weekly. Early detection prevents major outbreaks and reduces pesticide use.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/50 dark:bg-slate-800/50">
                <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Fertilizer Application</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Split nitrogen applications for better efficiency. Apply based on soil test results.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/50 dark:bg-slate-800/50">
                <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Weather Watch</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Monitor weather forecasts. Avoid spraying before rain or during high winds.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CropCalendarPage;
