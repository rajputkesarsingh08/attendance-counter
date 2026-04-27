/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Subject {
  id: string;
  name: string;
  attended: number;
  total: number;
}

export interface AttendanceStats {
  percentage: number;
  totalAttended: number;
  totalPossible: number;
  canSkip: number;
  requiredForImprovement: number;
}

export type View = 'timetable' | 'subjects' | 'attendance' | 'about' | 'support' | 'settings';
