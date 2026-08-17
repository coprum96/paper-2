import { BaselineScreen, ConsentScreen, FillerScreen } from './components/ConsentBaseline';
import {
  CompleteScreen,
  DebriefScreen,
  ManipChecksScreen,
  ScenarioTrialScreen,
  ThoughtListingScreen,
  TrialRatingsScreen,
} from './components/TrialFlow';
import { useResearchStore } from './store';

/**
 * Paper 2 experimental shell.
 * Entry: /?research=1&study=1|2&pilot=1
 * Educational game content (lessons, red flags, paywall) is NOT loaded.
 */
export function ResearchApp() {
  const phase = useResearchStore((s) => s.phase);

  switch (phase) {
    case 'consent':
      return <ConsentScreen />;
    case 'baseline':
      return <BaselineScreen />;
    case 'filler':
      return <FillerScreen />;
    case 'trial':
      return <ScenarioTrialScreen />;
    case 'thought':
      return <ThoughtListingScreen />;
    case 'trial_ratings':
      return <TrialRatingsScreen />;
    case 'manip_checks':
      return <ManipChecksScreen />;
    case 'debrief':
      return <DebriefScreen />;
    case 'complete':
      return <CompleteScreen />;
    default:
      return <ConsentScreen />;
  }
}
