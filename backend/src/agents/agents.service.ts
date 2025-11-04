import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from './entities/agent.entity';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);

  constructor(
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(createDto: CreateAgentDto): Promise<Agent> {
    const agent = this.agentRepository.create(createDto as any);
  const saved = (await this.agentRepository.save(agent)) as unknown as Agent;
  this.logger.log(`Agent profile created: ${saved.id}`);
    // Try to index into Chroma DB if configured (best-effort)
    await this.maybeIndexToChroma(saved).catch(err => {
      this.logger.warn(`Chroma indexing skipped/failed: ${err?.message || err}`);
    });
    return saved;
  }

  async findAll(): Promise<Agent[]> {
    return this.agentRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Agent> {
    const agent = await this.agentRepository.findOne({ where: { id } });
    if (!agent) throw new NotFoundException('Agent not found');
    return agent;
  }

  async update(id: string, updateDto: UpdateAgentDto): Promise<Agent> {
    const agent = await this.findOne(id);
    Object.assign(agent, updateDto);
    const saved = await this.agentRepository.save(agent);
    await this.maybeIndexToChroma(saved).catch(err => {
      this.logger.warn(`Chroma indexing skipped/failed on update: ${err?.message || err}`);
    });
    return saved;
  }

  async remove(id: string): Promise<void> {
    const result = await this.agentRepository.delete({ id });
    if (result.affected && result.affected > 0) {
      this.logger.log(`Agent deleted: ${id}`);
      // attempt to remove from Chroma as best-effort
      await this.maybeDeleteFromChroma(id).catch(err => {
        this.logger.warn(`Chroma delete skipped/failed: ${err?.message || err}`);
      });
      return;
    }
    throw new NotFoundException('Agent not found');
  }

  private async maybeIndexToChroma(agent: Agent): Promise<void> {
    const chromaUrl = this.configService.get<string>('CHROMA_URL');
    if (!chromaUrl) return;

    const collection = 'agents';
    // Build a tolerant payload: store persona JSON in documents/metadata
    const body = {
      ids: [agent.id],
      metadatas: [agent.persona || { name: agent.name }],
      documents: [JSON.stringify(agent.persona || { description: agent.description || agent.name })],
    };

    const url = `${chromaUrl.replace(/\/$/, '')}/collections/${collection}/points`;

    const resp$ = this.httpService.post(url, body, { timeout: 5000 });
    const resp = (await firstValueFrom(resp$)) as any;
    if (resp.status >= 200 && resp.status < 300) {
      this.logger.log(`Indexed agent ${agent.id} into Chroma at ${url}`);
    } else {
      this.logger.warn(`Chroma responded with status ${resp.status}`);
    }
  }

  private async maybeDeleteFromChroma(agentId: string): Promise<void> {
    const chromaUrl = this.configService.get<string>('CHROMA_URL');
    if (!chromaUrl) return;

    const collection = 'agents';
    const url = `${chromaUrl.replace(/\/$/, '')}/collections/${collection}/points/delete`;
    const body = { ids: [agentId] };
    const resp$ = this.httpService.post(url, body, { timeout: 5000 });
    const resp = (await firstValueFrom(resp$)) as any;
    if (resp.status >= 200 && resp.status < 300) {
      this.logger.log(`Deleted agent ${agentId} from Chroma at ${url}`);
    } else {
      this.logger.warn(`Chroma delete responded with status ${resp.status}`);
    }
  }
}
