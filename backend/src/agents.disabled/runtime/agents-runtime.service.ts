import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as path from 'path';
import * as fs from 'fs';
import { AgentsService } from '../agents.service';

@Injectable()
export class AgentsRuntimeService {
  private readonly logger = new Logger(AgentsRuntimeService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
    private readonly agentsService: AgentsService,
  ) {}

  /**
   * Apply an agent profile by either calling a local embedded module or a configured webhook.
   * Local embed: set AGENT_LOCAL_PATH to a directory that exports `applyAgentProfile(agent)`.
   * Webhook: set AGENT_RUNTIME_HOOK to a URL that accepts POST { agent }.
   */
  async applyAgentProfile(agentId: string) {
    const agent = await this.agentsService.findOne(agentId);
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    // 1) Try local embed
    const localPath = this.config.get<string>('AGENT_LOCAL_PATH');
    if (localPath) {
      try {
        const resolved = path.resolve(localPath);
        // try requiring either the path or path/index.js
        const candidates = [resolved, path.join(resolved, 'index.js'), path.join(resolved, 'dist', 'index.js')];
        for (const candidate of candidates) {
          if (fs.existsSync(candidate)) {
            this.logger.log(`Using local agent runtime at ${candidate}`);
             
            const mod = require(candidate);
            if (mod && typeof mod.applyAgentProfile === 'function') {
              // allow sync or async
              const result = mod.applyAgentProfile(agent);
              return await Promise.resolve(result);
            } else if (mod && typeof mod.default === 'function') {
              const result = mod.default(agent);
              return await Promise.resolve(result);
            }
            // If module found but no expected export, log and continue to webhook fallback
            this.logger.warn(`Module at ${candidate} does not export applyAgentProfile()`);
          }
        }
      } catch (err) {
        this.logger.warn('Local agent runtime failed: ' + (err as Error).message);
      }
    }

    // 2) Try webhook
    const hook = this.config.get<string>('AGENT_RUNTIME_HOOK');
    if (hook) {
      try {
        this.logger.log(`Posting agent profile to runtime hook ${hook}`);
        const resp = await firstValueFrom(this.httpService.post(hook, { agent }));
        return resp.data;
      } catch (err) {
        this.logger.warn('Agent runtime hook failed: ' + (err as Error).message);
        throw err;
      }
    }

    // Nothing configured
    this.logger.warn('No agent runtime available (AGENT_LOCAL_PATH or AGENT_RUNTIME_HOOK not set)');
    return { ok: false, reason: 'no-runtime-configured' };
  }
}
