import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@wraith/ui/shadcn/button';

export const CreateMeetingDialog = () => {
  return (
    <Link to="/create">
      <Button className="h-11 gap-2 px-4">
        <Plus className="size-4" />
        Create Meeting
      </Button>
    </Link>
  );
};