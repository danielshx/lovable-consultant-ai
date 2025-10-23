// Mock User
export const mockUser = {
  name: 'Dr. Anna Schmidt',
  email: 'anna.schmidt@consulting.eu',
};

// Mock Projects & Teams
export const mockProjects = [
  {
    id: 'p1',
    name: 'Project Alpha (Client X)',
    team: [
      { name: 'Dr. Anna Schmidt', role: 'Project Lead', email: 'anna.schmidt@consulting.eu' },
      { name: 'Max Mustermann', role: 'Analyst', email: 'max.mustermann@consulting.eu' },
      { name: 'Sarah Connor', role: 'Senior Consultant', email: 'sarah.connor@consulting.eu' },
    ],
  },
  {
    id: 'p2',
    name: 'Project Beta (Client Y)',
    team: [
      { name: 'Dr. Anna Schmidt', role: 'Project Lead', email: 'anna.schmidt@consulting.eu' },
      { name: 'John Doe', role: 'Analyst', email: 'john.doe@consulting.eu' },
    ],
  },
];

// Mock Calendar & Meetings
export const mockMeetings: Record<string, Meeting[]> = {
  p1: [
    {
      id: 'm1a',
      date: '2025-10-22',
      topic: 'Weekly Sync - Client X',
      attendees: ['Anna Schmidt', 'Max Mustermann', 'Client CEO'],
      transcript: 'Okay team, let\'s start. Max, you need to update the slides for tomorrow. Anna, please follow up with the client on the budget question by Friday. We also need someone to schedule the next steering committee meeting.',
      attachedFiles: [
        { name: 'meeting_recording.mp3', type: 'audio', size: 2458624 }
      ]
    },
    {
      id: 'm2a',
      date: '2025-10-20',
      topic: 'Workshop Debrief',
      attendees: ['Anna Schmidt', 'Sarah Connor'],
      transcript: 'That was a good workshop. Sarah, can you summarize the findings for the internal knowledge base? I will handle the client follow-up mail myself before end of day.',
    },
  ],
  p2: [
    {
      id: 'm3b',
      date: '2025-10-21',
      topic: 'Kick-off - Client Y',
      attendees: ['Anna Schmidt', 'John Doe'],
      transcript: 'Welcome, Client Y. John, your task is to conduct the initial market research by next Monday. I will set up the project structure.',
    },
  ],
};

// Types
export interface TeamMember {
  name: string;
  role: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  team: TeamMember[];
}

export interface AttachedFile {
  name: string;
  type: 'audio' | 'text';
  size: number;
}

export interface Meeting {
  id: string;
  date: string;
  topic: string;
  attendees: string[];
  transcript: string;
  attachedFiles?: AttachedFile[];
}
