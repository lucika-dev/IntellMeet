import { Navigate, useParams } from 'react-router-dom';

export const MeetingRoomPage = () => {
  const { meetingCode = '' } = useParams();

  return (
    <Navigate
      to={`/${meetingCode}`}
      replace
    />
  );
};
