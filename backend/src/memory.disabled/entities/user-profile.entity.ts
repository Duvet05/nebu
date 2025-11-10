import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum LearningStyle {
  VISUAL = 'visual',
  AUDITORY = 'auditory',
  KINESTHETIC = 'kinesthetic',
  MIXED = 'mixed',
}

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  @Column({ type: 'int', nullable: true })
  age?: number;

  @Column({ type: 'jsonb', nullable: true })
  preferences?: {
    interests?: string[];           // ['dinosaurios', 'espacio', 'música']
    favoriteTopics?: string[];      // ['ciencia', 'cuentos', 'animales']
    learningStyle?: LearningStyle;  // Estilo de aprendizaje preferido
    emotionalTendencies?: string[]; // ['curioso', 'tímido', 'energético']
    favoriteActivities?: string[];  // ['cantar', 'jugar', 'aprender']
    favoriteCharacters?: string[];  // ['dinosaurios', 'princesas', 'robots']
    avoidTopics?: string[];         // Temas a evitar
  };

  @Column({ type: 'jsonb', nullable: true })
  developmentMilestones?: {
    language?: {
      nativeLanguage?: string;
      learningLanguages?: string[];
      vocabularyLevel?: string;    // 'beginner', 'intermediate', 'advanced'
      sentenceComplexity?: string; // 'simple', 'compound', 'complex'
    };
    cognitive?: {
      problemSolving?: string;     // 'developing', 'proficient', 'advanced'
      memory?: string;
      attention?: string;
      creativity?: string;
    };
    social?: {
      empathy?: string;
      cooperation?: string;
      communication?: string;
      emotionalRegulation?: string;
    };
    motor?: {
      fineMotor?: string;
      grossMotor?: string;
      coordination?: string;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  routines?: {
    wakeTime?: string;              // 'HH:mm'
    bedTime?: string;               // 'HH:mm'
    mealTimes?: {
      breakfast?: string;
      lunch?: string;
      dinner?: string;
      snacks?: string[];
    };
    playTime?: string;
    learningTime?: string;
    screenTime?: {
      limit?: number;               // minutos por día
      currentUsage?: number;
    };
    napTime?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  familyContext?: {
    familyMembers?: {
      name: string;
      relation: string;             // 'madre', 'padre', 'hermano', 'abuela', etc.
      nickname?: string;
    }[];
    pets?: {
      name: string;
      type: string;                 // 'perro', 'gato', 'pájaro', etc.
      breed?: string;
    }[];
    languages?: string[];           // Idiomas hablados en casa
    culturalBackground?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  educationalGoals?: {
    currentGoals?: string[];
    achievedGoals?: string[];
    parentalPriorities?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  healthInfo?: {
    allergies?: string[];
    specialNeeds?: string[];
    sleepPatterns?: string;
    energyLevels?: string;          // 'low', 'medium', 'high'
  };

  @Column({ type: 'jsonb', nullable: true })
  interactionStats?: {
    totalSessions?: number;
    totalDuration?: number;         // segundos
    averageSessionLength?: number;  // segundos
    favoriteTimeOfDay?: string;     // 'morning', 'afternoon', 'evening'
    mostEngagedTopics?: string[];
    lastInteraction?: string;       // ISO timestamp
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  getAge(): number {
    return this.age || 5; // default 5 años
  }

  getPrimaryLanguage(): string {
    return this.developmentMilestones?.language?.nativeLanguage || 'es';
  }

  getInterests(): string[] {
    return this.preferences?.interests || [];
  }

  getLearningStyle(): LearningStyle {
    return this.preferences?.learningStyle || LearningStyle.MIXED;
  }

  isScreenTimeLimitReached(): boolean {
    const screenTime = this.routines?.screenTime;
    if (!screenTime) return false;
    return (screenTime.currentUsage || 0) >= (screenTime.limit || Infinity);
  }

  incrementScreenTime(minutes: number): void {
    if (!this.routines) {
      this.routines = {};
    }
    if (!this.routines.screenTime) {
      this.routines.screenTime = { limit: 60, currentUsage: 0 };
    }
    this.routines.screenTime.currentUsage =
      (this.routines.screenTime.currentUsage || 0) + minutes;
  }

  resetDailyScreenTime(): void {
    if (this.routines?.screenTime) {
      this.routines.screenTime.currentUsage = 0;
    }
  }
}
