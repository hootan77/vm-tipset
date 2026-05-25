import { GROUP_NAMES } from '../data/teams';
import GroupCard from './GroupCard';

export default function GroupStage({ isAdmin }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {GROUP_NAMES.map(group => (
        <GroupCard key={group} group={group} isAdmin={isAdmin} />
      ))}
    </div>
  );
}
