import { logger } from './logger';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: any;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private memoryUsage: number[] = [];
  private frameRates: number[] = [];

  startTimer(name: string, metadata?: any) {
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata
    };
    
    this.metrics.set(name, metric);
    logger.debug('performance', `Timer started: ${name}`, metadata);
  }

  endTimer(name: string) {
    const metric = this.metrics.get(name);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      
      logger.info('performance', `Timer completed: ${name}`, {
        duration: metric.duration,
        metadata: metric.metadata
      });
      
      return metric.duration;
    }
    
    logger.warn('performance', `Timer not found: ${name}`);
    return null;
  }

  trackMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usage = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        timestamp: Date.now()
      };
      
      this.memoryUsage.push(usage.used);
      
      // Keep only last 100 measurements
      if (this.memoryUsage.length > 100) {
        this.memoryUsage = this.memoryUsage.slice(-100);
      }
      
      logger.debug('performance', 'Memory usage tracked', usage);
      return usage;
    }
    return null;
  }

  trackFrameRate() {
    let lastTime = performance.now();
    let frameCount = 0;
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        this.frameRates.push(fps);
        
        // Keep only last 60 measurements (1 minute at 1 FPS measurement)
        if (this.frameRates.length > 60) {
          this.frameRates = this.frameRates.slice(-60);
        }
        
        logger.debug('performance', 'Frame rate measured', { fps });
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  getMetrics() {
    const completedMetrics = Array.from(this.metrics.values())
      .filter(m => m.duration !== undefined);
    
    const avgMemory = this.memoryUsage.length > 0 
      ? this.memoryUsage.reduce((a, b) => a + b, 0) / this.memoryUsage.length 
      : 0;
    
    const avgFrameRate = this.frameRates.length > 0 
      ? this.frameRates.reduce((a, b) => a + b, 0) / this.frameRates.length 
      : 0;
    
    return {
      timers: completedMetrics,
      averageMemoryUsage: avgMemory,
      averageFrameRate: avgFrameRate,
      currentMemoryUsage: this.memoryUsage.slice(-1)[0] || 0,
      currentFrameRate: this.frameRates.slice(-1)[0] || 0
    };
  }

  clearMetrics() {
    this.metrics.clear();
    this.memoryUsage = [];
    this.frameRates = [];
    logger.info('performance', 'Performance metrics cleared');
  }
}

export const performanceMonitor = new PerformanceMonitor();