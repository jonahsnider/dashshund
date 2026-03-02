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

	function handleSubmit(e: Event) {
		e.preventDefault();
		const num = team();
		if (num > 0) {
			localStorage.setItem(TEAM_STORAGE_KEY, String(num));
			props.onTeamChange(num);
		}
	}

	return (
		<form class='flex flex-col gap-1.5' onSubmit={handleSubmit}>
			<label class='flex flex-col gap-1 text-[13px]'>
				Team #
				<input
					type='number'
					min='1'
					max='99999'
					value={team()}
					onInput={(e) => setTeam(Number(e.currentTarget.value))}
					class='w-full px-1.5 py-1 bg-surface-container-highest border border-outline rounded text-on-surface text-[13px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]'
				/>
			</label>
			<button
				type='submit'
				class='px-2.5 py-1 bg-primary rounded text-on-primary text-[13px] cursor-pointer hover:brightness-90'
			>
				Connect
			</button>
		</form>
	);
};

export default Settings;
