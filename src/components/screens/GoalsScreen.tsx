import React, { useState } from 'react';
import {
  Target,
  Plus,
  Car,
  Laptop,
  ShieldCheck,
  Store,
  GraduationCap,
  Plane,
  Home,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { CurrencyWaveVector, SecurityPatternVector, CardFlowVector } from '../common/UiVectors';

export const GoalsScreen: React.FC = () => {
  const { goals, addGoal, openDetail } = useFinancial();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Safety');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('Dec 2027');
  const [iconName, setIconName] = useState('ShieldCheck');

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const t = parseFloat(targetAmount);
    if (!name || isNaN(t)) return;

    addGoal({
      name,
      category,
      targetAmount: t,
      targetDate,
      iconName,
      color: '#047857'
    });

    setName('');
    setTargetAmount('');
    setShowAddModal(false);
  };

  const getGoalIcon = (icon: string) => {
    switch (icon) {
      case 'Car':
        return <Car className="w-5 h-5 text-emerald-700" />;
      case 'Laptop':
        return <Laptop className="w-5 h-5 text-emerald-700" />;
      case 'Store':
        return <Store className="w-5 h-5 text-purple-700" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-sky-700" />;
      case 'Plane':
        return <Plane className="w-5 h-5 text-amber-700" />;
      case 'Home':
        return <Home className="w-5 h-5 text-rose-700" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-emerald-700" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Financial Goals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build discipline towards large life milestones, assets, and emergency reserves.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* KPI Cards & Hero Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#065f46] to-[#047857] text-white rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="absolute right-0 bottom-0 w-44 h-24 pointer-events-none opacity-30">
            <CurrencyWaveVector className="text-emerald-200" />
          </div>
          <div className="relative z-10">
            <span className="text-xs text-emerald-100 font-medium">Total Saved Toward Goals</span>
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
              ₦{totalSaved.toLocaleString()}
            </p>
          </div>
          <span className="relative z-10 text-[11px] text-emerald-200 mt-2 block">
            Across {goals.length} active financial targets
          </span>
        </div>

        <div className="relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div className="absolute -right-4 -top-4 w-24 h-24 pointer-events-none opacity-20">
            <SecurityPatternVector className="text-slate-400" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Combined Target Sum</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              ₦{totalTarget.toLocaleString()}
            </p>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Total future capital required
          </span>
        </div>

        <div className="relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div className="absolute right-0 bottom-0 w-32 h-16 pointer-events-none opacity-25">
            <CardFlowVector className="text-emerald-600" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Overall Progress</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight mt-1">
              {Math.round((totalSaved / totalTarget) * 100)}%
            </p>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-2 block">
            Consistent monthly deposits active
          </span>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map(goal => {
          const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div
              key={goal.id}
              onClick={() => openDetail('goal', goal)}
              className="bg-white rounded-2xl p-5 border border-slate-200/70 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                      {getGoalIcon(goal.iconName)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                        {goal.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">{goal.category}</p>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold text-slate-800">
                    {progress}%
                  </span>
                </div>

                <div className="mt-4 flex items-baseline justify-between text-xs">
                  <div>
                    <span className="text-slate-400 font-medium text-[11px]">Saved</span>
                    <p className="text-xl font-bold text-emerald-800">
                      ₦{goal.currentAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 font-medium text-[11px]">Target</span>
                    <p className="text-base font-bold text-slate-900">
                      ₦{goal.targetAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, backgroundColor: goal.color }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Target Date: {goal.targetDate}</span>
                <span className="text-emerald-700 font-semibold group-hover:underline flex items-center gap-1">
                  <span>Add Money</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Create Financial Goal</h3>
            <form onSubmit={handleCreateGoal} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master's Degree School Fees, Toyota Land Cruiser"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Amount (₦)</label>
                  <input
                    type="number"
                    required
                    placeholder="3000000"
                    value={targetAmount}
                    onChange={e => setTargetAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Date</label>
                  <input
                    type="text"
                    placeholder="Dec 2027"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Safety">Safety & Emergency</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Education">Education</option>
                    <option value="Housing">Housing</option>
                    <option value="Gadgets">Gadgets</option>
                    <option value="Business">Business</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Icon Style</label>
                  <select
                    value={iconName}
                    onChange={e => setIconName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="ShieldCheck">Safety Shield</option>
                    <option value="Car">Car</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Store">Store / Business</option>
                    <option value="GraduationCap">School</option>
                    <option value="Plane">Travel</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#047857] hover:bg-emerald-800 text-white font-bold rounded-xl"
                >
                  Save Goal
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
