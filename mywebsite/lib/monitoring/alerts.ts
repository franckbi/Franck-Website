/**
 * Alert system for monitoring critical issues
 */

import { env, isProduction } from '@/lib/config/environment';

interface AlertConfig {
  webhook?: string;
  email?: string;
  slack?: string;
  discord?: string;
}

interface Alert {
  level: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  environment: string;
  metadata?: Record<string, any>;
}

class AlertManager {
  private config: AlertConfig;
  private rateLimits: Map<string, number> = new Map();

  constructor(config: AlertConfig = {}) {
    this.config = {
      webhook: process.env.ALERT_WEBHOOK_URL,
      email: process.env.ALERT_EMAIL,
      slack: process.env.SLACK_WEBHOOK_URL,
      discord: process.env.DISCORD_WEBHOOK_URL,
      ...config,
    };
  }

  /**
   * Send an alert through configured channels
   */
  async sendAlert(alert: Omit<Alert, 'timestamp' | 'environment'>) {
    if (!isProduction) {
      console.log('🚨 Alert (dev mode):', alert);
      return;
    }

    // Rate limiting to prevent spam
    const key = `${alert.level}-${alert.title}`;
    const now = Date.now();
    const lastSent = this.rateLimits.get(key) || 0;
    const cooldown = this.getCooldownPeriod(alert.level);

    if (now - lastSent < cooldown) {
      return; // Skip due to rate limiting
    }

    this.rateLimits.set(key, now);

    const fullAlert: Alert = {
      ...alert,
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL_ENV || env.NODE_ENV,
    };

    // Send to all configured channels
    const promises = [
      this.sendToWebhook(fullAlert),
      this.sendToSlack(fullAlert),
      this.sendToDiscord(fullAlert),
      this.sendToEmail(fullAlert),
    ].filter(Boolean);

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  }

  /**
   * Send alert to generic webhook
   */
  private async sendToWebhook(alert: Alert) {
    if (!this.config.webhook) return;

    try {
      await fetch(this.config.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
      });
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }

  /**
   * Send alert to Slack
   */
  private async sendToSlack(alert: Alert) {
    if (!this.config.slack) return;

    const color = this.getSlackColor(alert.level);
    const emoji = this.getEmoji(alert.level);

    const payload = {
      text: `${emoji} ${alert.title}`,
      attachments: [
        {
          color,
          fields: [
            {
              title: 'Environment',
              value: alert.environment,
              short: true,
            },
            {
              title: 'Level',
              value: alert.level.toUpperCase(),
              short: true,
            },
            {
              title: 'Message',
              value: alert.message,
              short: false,
            },
            {
              title: 'Timestamp',
              value: alert.timestamp,
              short: true,
            },
          ],
        },
      ],
    };

    if (alert.metadata) {
      payload.attachments[0].fields.push({
        title: 'Metadata',
        value: `\`\`\`${JSON.stringify(alert.metadata, null, 2)}\`\`\``,
        short: false,
      });
    }

    try {
      await fetch(this.config.slack, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  /**
   * Send alert to Discord
   */
  private async sendToDiscord(alert: Alert) {
    if (!this.config.discord) return;

    const color = this.getDiscordColor(alert.level);
    const emoji = this.getEmoji(alert.level);

    const embed = {
      title: `${emoji} ${alert.title}`,
      description: alert.message,
      color,
      timestamp: alert.timestamp,
      fields: [
        {
          name: 'Environment',
          value: alert.environment,
          inline: true,
        },
        {
          name: 'Level',
          value: alert.level.toUpperCase(),
          inline: true,
        },
      ],
    };

    if (alert.metadata) {
      embed.fields.push({
        name: 'Metadata',
        value: `\`\`\`json\n${JSON.stringify(alert.metadata, null, 2)}\n\`\`\``,
        inline: false,
      });
    }

    try {
      await fetch(this.config.discord, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] }),
      });
    } catch (error) {
      console.error('Failed to send Discord alert:', error);
    }
  }

  /**
   * Send alert via email (placeholder - implement with your email service)
   */
  private async sendToEmail(alert: Alert) {
    if (!this.config.email) return;

    // Implement email sending logic here
    // This could use the same email service as the contact form
    console.log('Email alert would be sent to:', this.config.email, alert);
  }

  /**
   * Get cooldown period based on alert level
   */
  private getCooldownPeriod(level: Alert['level']): number {
    switch (level) {
      case 'critical':
        return 5 * 60 * 1000; // 5 minutes
      case 'error':
        return 15 * 60 * 1000; // 15 minutes
      case 'warning':
        return 30 * 60 * 1000; // 30 minutes
      case 'info':
        return 60 * 60 * 1000; // 1 hour
      default:
        return 30 * 60 * 1000;
    }
  }

  /**
   * Get Slack color for alert level
   */
  private getSlackColor(level: Alert['level']): string {
    switch (level) {
      case 'critical':
        return 'danger';
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
        return 'good';
      default:
        return '#808080';
    }
  }

  /**
   * Get Discord color for alert level
   */
  private getDiscordColor(level: Alert['level']): number {
    switch (level) {
      case 'critical':
        return 0xff0000; // Red
      case 'error':
        return 0xff4444; // Light red
      case 'warning':
        return 0xffaa00; // Orange
      case 'info':
        return 0x00aa00; // Green
      default:
        return 0x808080; // Gray
    }
  }

  /**
   * Get emoji for alert level
   */
  private getEmoji(level: Alert['level']): string {
    switch (level) {
      case 'critical':
        return '🚨';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  }
}

// Global alert manager instance
export const alertManager = new AlertManager();

/**
 * Predefined alert functions for common scenarios
 */
export const alerts = {
  /**
   * Deployment alerts
   */
  deploymentStarted(environment: string) {
    return alertManager.sendAlert({
      level: 'info',
      title: 'Deployment Started',
      message: `Deployment to ${environment} has started`,
      metadata: { environment },
    });
  },

  deploymentCompleted(environment: string, duration: number) {
    return alertManager.sendAlert({
      level: 'info',
      title: 'Deployment Completed',
      message: `Deployment to ${environment} completed successfully in ${duration}ms`,
      metadata: { environment, duration },
    });
  },

  deploymentFailed(environment: string, error: string) {
    return alertManager.sendAlert({
      level: 'critical',
      title: 'Deployment Failed',
      message: `Deployment to ${environment} failed: ${error}`,
      metadata: { environment, error },
    });
  },

  /**
   * Performance alerts
   */
  highErrorRate(rate: number, threshold: number) {
    return alertManager.sendAlert({
      level: 'error',
      title: 'High Error Rate Detected',
      message: `Error rate (${rate}%) exceeded threshold (${threshold}%)`,
      metadata: { rate, threshold },
    });
  },

  slowResponse(endpoint: string, responseTime: number, threshold: number) {
    return alertManager.sendAlert({
      level: 'warning',
      title: 'Slow Response Time',
      message: `${endpoint} response time (${responseTime}ms) exceeded threshold (${threshold}ms)`,
      metadata: { endpoint, responseTime, threshold },
    });
  },

  highMemoryUsage(usage: number, threshold: number) {
    return alertManager.sendAlert({
      level: 'warning',
      title: 'High Memory Usage',
      message: `Memory usage (${usage}MB) exceeded threshold (${threshold}MB)`,
      metadata: { usage, threshold },
    });
  },

  /**
   * 3D-specific alerts
   */
  webglContextLost(userAgent: string, frequency: number) {
    return alertManager.sendAlert({
      level: 'warning',
      title: 'WebGL Context Lost',
      message: `WebGL context lost detected (${frequency} times in last hour)`,
      metadata: { userAgent, frequency },
    });
  },

  lowFrameRate(fps: number, userAgent: string) {
    return alertManager.sendAlert({
      level: 'warning',
      title: 'Low Frame Rate Detected',
      message: `3D scene running at ${fps} FPS`,
      metadata: { fps, userAgent },
    });
  },

  assetLoadingFailure(asset: string, error: string) {
    return alertManager.sendAlert({
      level: 'error',
      title: 'Asset Loading Failure',
      message: `Failed to load asset: ${asset}`,
      metadata: { asset, error },
    });
  },

  /**
   * Security alerts
   */
  rateLimitExceeded(ip: string, endpoint: string, attempts: number) {
    return alertManager.sendAlert({
      level: 'warning',
      title: 'Rate Limit Exceeded',
      message: `IP ${ip} exceeded rate limit on ${endpoint} (${attempts} attempts)`,
      metadata: { ip, endpoint, attempts },
    });
  },

  suspiciousActivity(ip: string, activity: string) {
    return alertManager.sendAlert({
      level: 'error',
      title: 'Suspicious Activity Detected',
      message: `Suspicious activity from IP ${ip}: ${activity}`,
      metadata: { ip, activity },
    });
  },
};
