export interface User {
  id: string;
  email: string;
  name: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Band {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  members?: BandMember[];
}

export interface BandMember {
  id: string;
  bandId: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
  updatedAt: string;
  user?: User;
}

export interface Song {
  id: string;
  bandId: string;
  title: string;
  artist?: string;
  key?: string;
  tempo?: number;
  durationSeconds?: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  attachments?: SongAttachment[];
  tags?: Tag[];
}

export interface SongAttachment {
  id: string;
  songId: string;
  type: 'lyrics' | 'chords' | 'audio' | 'other';
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Tag {
  id: string;
  bandId: string;
  name: string;
  color?: string;
  createdAt: string;
}

export interface Setlist {
  id: string;
  bandId: string;
  name: string;
  description?: string;
  venue?: string;
  eventDate?: string;
  durationSeconds?: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  songs?: SetlistSong[];
  performances?: Performance[];
}

export interface SetlistSong {
  id: string;
  setlistId: string;
  songId: string;
  position: number;
  notes?: string;
  transitionNotes?: string;
  createdAt: string;
  updatedAt: string;
  song?: Song;
}

export interface Performance {
  id: string;
  setlistId?: string;
  date: string;
  venue?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  songs?: PerformanceSong[];
  setlist?: Setlist;
}

export interface PerformanceSong {
  id: string;
  performanceId: string;
  songId: string;
  rating?: number;
  notes?: string;
  actuallyPerformed: boolean;
  position: number;
  song?: Song;
}

export interface SharedLink {
  id: string;
  resourceType: 'setlist' | 'song';
  resourceId: string;
  accessToken: string;
  expiresAt?: string;
  createdBy: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}