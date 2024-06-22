// MUI Imports
import Card from '@mui/material/Card'

// Component Imports
import CalendarWrapper from '@views/apps/calendar/CalendarWrapper'

// Styled Component Imports
import AppFullCalendar from '@/libs/styles/AppFullCalendar'

import WallieChat from '@/views/WallieChat/WallieChat'

async function fetchEvents() {
  // Vars
  const res = await fetch(`${process.env.API_URL}/apps/calendar-events`)

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  return res.json()
}

const VideoTranscribePage = async () => {
  // Vars
  const res = (await fetchEvents()) || []

  return (
    <Card>
      <WallieChat />
    </Card>
  )
}

export default VideoTranscribePage
