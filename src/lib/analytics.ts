import { logger } from './logger';

export interface BreathingMetrics {
  breathsCompleted: number;
  averageBreathDuration: number;
  holdDuration: number;
  roundNumber: number;
  timestamp: string;
}

export interface SessionMetrics {
  sessionId: string;
  startTime: string;
  endTime?: string;
  totalRounds: number;
  completedRounds: number;
  totalBreaths: number;
  totalHoldTime: number;
  averageHoldTime: number;
  sessionDuration?: number;
}

class Analytics {
  private currentSession: SessionMetrics | null = null;
  private breathStartTime: number | null = null;
  private breathDurations: number[] = [];

  startSession(sessionId: string, plannedRounds: number = 4) {
    this.currentSession = {
      sessionId,
      startTime: new Date().toISOString(),
      totalRounds: plannedRounds,
      completedRounds: 0,
      totalBreaths: 0,
      totalHoldTime: 0,
      averageHoldTime: 0
    };

    logger.setSessionId(sessionId);
    logger.info('analytics', 'Session analytics started', {
      sessionId,
      plannedRounds
    });
  }

  trackBreathStart() {
    this.breathStartTime = Date.now();
    logger.debug('breathing', 'Breath started');
  }

  trackBreathEnd() {
    if (this.breathStartTime && this.currentSession) {
      const duration = Date.now() - this.breathStartTime;
      this.breathDurations.push(duration);
      this.currentSession.totalBreaths++;
      
      logger.debug('breathing', 'Breath completed', {
        duration,
        totalBreaths: this.currentSession.totalBreaths
      });
    }
  }

  trackHoldStart(roundNumber: number) {
    logger.info('breathing', 'Hold phase started', { roundNumber });
  }

  trackHoldEnd(holdDuration: number, roundNumber: number) {
    if (this.currentSession) {
      this.currentSession.totalHoldTime += holdDuration;
      this.currentSession.completedRounds++;
      
      const averageBreathDuration = this.breathDurations.length > 0 
        ? this.breathDurations.reduce((a, b) => a + b, 0) / this.breathDurations.length 
        : 0;

      const metrics: BreathingMetrics = {
        breathsCompleted: this.breathDurations.length,
        averageBreathDuration,
        holdDuration,
        roundNumber,
        timestamp: new Date().toISOString()
      };

      logger.info('breathing', 'Round completed', metrics);
      
      // Reset breath tracking for next round
      this.breathDurations = [];
    }
  }

  trackPhaseChange(from: string, to: string, context?: any) {
    logger.info('phase', `Phase changed: ${from} → ${to}`, context);
  }

  trackError(error: Error, context?: any) {
    logger.error('app', 'Application error occurred', {
      message: error.message,
      stack: error.stack,
      context
    });
  }

  trackUserAction(action: string, data?: any) {
    logger.info('user', `User action: ${action}`, data);
  }

  endSession() {
    if (this.currentSession) {
      const endTime = new Date().toISOString();
      const sessionDuration = new Date(endTime).getTime() - new Date(this.currentSession.startTime).getTime();
      
      this.currentSession.endTime = endTime;
      this.currentSession.sessionDuration = sessionDuration;
      this.currentSession.averageHoldTime = this.currentSession.completedRounds > 0 
        ? this.currentSession.totalHoldTime / this.currentSession.completedRounds 
        : 0;

      logger.info('analytics', 'Session completed', this.currentSession);
      logger.clearSessionId();
      
      const sessionData = { ...this.currentSession };
      this.currentSession = null;
      return sessionData;
    }
    return null;
  }

  getCurrentSession(): SessionMetrics | null {
    return this.currentSession ? { ...this.currentSession } : null;
  }
}

export const analytics = new Analytics();