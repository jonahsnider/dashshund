import { createSignal, type Component } from "solid-js";

const TEAM_STORAGE_KEY = "dashshund-team-number";

interface SettingsProps {
  onTeamChange: (team: number) => void;
}

export function loadTeamNumber(): number {
  const stored = localStorage.getItem(TEAM_STORAGE_KEY);
  return stored ? Number(stored) : 581;
}

const Settings: Component<SettingsProps> = (props) => {
  const [team, setTeam] = createSignal(loadTeamNumber());

  function handleSubmit(e: Event) {
    e.preventDefault();
    const num = team();
    if (num > 0) {
      localStorage.setItem(TEAM_STORAGE_KEY, String(num));
      props.onTeamChange(num);
    }
  }

  return (
    <form class="settings" onSubmit={handleSubmit}>
      <label>
        Team #
        <input
          type="number"
          min="1"
          max="99999"
          value={team()}
          onInput={(e) => setTeam(Number(e.currentTarget.value))}
        />
      </label>
      <button type="submit">Connect</button>
    </form>
  );
};

export default Settings;
