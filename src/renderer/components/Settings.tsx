import { type Component, createSignal } from 'solid-js';

const TEAM_STORAGE_KEY = 'dashshund-team-number';

interface SettingsProps {
	onTeamChange: (team: number) => void;
}

export function loadTeamNumber(): number {
	const stored = localStorage.getItem(TEAM_STORAGE_KEY);
	return stored ? Number(stored) : 581;
}

const Settings: Component<SettingsProps> = (props) => {
	const [team, setTeam] = createSignal(loadTeamNumber());

	function handleInput(e: InputEvent & { currentTarget: HTMLInputElement }) {
		const num = Number(e.currentTarget.value);
		setTeam(num);
		if (num > 0) {
			localStorage.setItem(TEAM_STORAGE_KEY, String(num));
			props.onTeamChange(num);
		}
	}

	return (
		<label class='flex flex-col gap-1'>
			<span class='text-[10px] uppercase tracking-wider text-on-surface-variant'>Team Number</span>
			<input
				type='number'
				min='1'
				max='99999'
				value={team()}
				onInput={handleInput}
				class='w-full bg-transparent border-b border-outline py-2 text-sm text-on-surface outline-none focus:opacity-60 transition-opacity [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]'
			/>
		</label>
	);
};

export default Settings;
