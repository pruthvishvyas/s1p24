import { KPICards } from '../components/understand/KPICards.jsx';
import { ChartPanel } from '../components/understand/ChartPanel.jsx';
import { AnomalyTable } from '../components/understand/AnomalyTable.jsx';
import { SegmentExplorer } from '../components/understand/SegmentExplorer.jsx';
import { InsightCards } from '../components/decide/InsightCards.jsx';
import { RecommendationEngine } from '../components/decide/RecommendationEngine.jsx';
import { WhatIfSimulator } from '../components/decide/WhatIfSimulator.jsx';
import { GoalTracker } from '../components/decide/GoalTracker.jsx';
import { Forecaster } from '../components/monitor/Forecaster.jsx';
import { GoalProgress } from '../components/monitor/GoalProgress.jsx';
import { AlertCenter } from '../components/monitor/AlertCenter.jsx';
import { InteractiveExplorer } from '../components/explorer/InteractiveExplorer.jsx';
import { UserManual } from '../components/manual/UserManual.jsx';

export const VIEWS = [
  { id: 'overview', group: 'UNDERSTAND', label: 'Your Numbers', desc: 'The headline figures for the latest weeks, compared with the 13 weeks before.', component: KPICards },
  { id: 'charts', group: 'UNDERSTAND', label: 'Analysis Charts', desc: 'Each chart answers one business question.', component: ChartPanel },
  { id: 'anomalies', group: 'UNDERSTAND', label: 'Unusual Weeks', desc: 'Weeks that do not look like your normal pattern, with the main reason.', component: AnomalyTable },
  { id: 'segments', group: 'UNDERSTAND', label: 'Week Types', desc: 'Your weeks grouped by how efficiently the business ran.', component: SegmentExplorer },
  { id: 'insights', group: 'DECIDE', label: 'Insights', desc: 'What the data shows, ranked by how much money is at stake.', component: InsightCards },
  { id: 'recommendations', group: 'DECIDE', label: 'Recommendations', desc: 'Actions to take, based on rules that watch every week.', component: RecommendationEngine },
  { id: 'whatif', group: 'DECIDE', label: 'What-If Simulator', desc: 'Move a slider to see what a change could do to profit or cash.', component: WhatIfSimulator },
  { id: 'goals', group: 'DECIDE', label: 'Goal Tracker', desc: 'The targets this dashboard measures you against.', component: GoalTracker },
  { id: 'forecast', group: 'MONITOR', label: 'Forecast', desc: 'What the next weeks are likely to look like.', component: Forecaster },
  { id: 'progress', group: 'MONITOR', label: 'Goal Progress', desc: 'How you are doing against each target.', component: GoalProgress },
  { id: 'alerts', group: 'MONITOR', label: 'Alert Center', desc: 'Things that need attention right now.', component: AlertCenter },
  { id: 'explorer', group: 'EXPLORE', label: 'Interactive Explorer', desc: 'Filter, click and drill into your weeks.', component: InteractiveExplorer },
  { id: 'manual', group: 'HELP', label: 'User Manual', desc: 'A plain-English guide to every tab.', component: UserManual }
];
export const GROUPS = ['UNDERSTAND', 'DECIDE', 'MONITOR', 'EXPLORE', 'HELP'];
