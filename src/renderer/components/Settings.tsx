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
					class='w-full px-1.5 py-1 bg-[#333] border border-[#555] rounded text-[#e0e0e0] text-[13px]'
				/>
			</label>
			<button
				type='submit'
				class='px-2.5 py-1 bg-[#2563eb] rounded text-white text-[13px] cursor-pointer hover:bg-[#1d4ed8]'
			>
				Connect
			</button>
		</form>
	);
};

export default Settings;
