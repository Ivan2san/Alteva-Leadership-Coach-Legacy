export interface TopicPrompt {
  text: string;
  category: string;
}

export interface TopicConfiguration {
  title: string;
  icon: string;
  prompts: TopicPrompt[];
}

export const topicConfigurations: Record<string, TopicConfiguration> = {
  'growth-profile': {
    title: 'Leadership Growth Profile',
    icon: 'fa-user-chart',
    prompts: [
      {
        text: "Help me assess my current leadership strengths and identify key areas for development",
        category: "Assessment"
      },
      {
        text: "What leadership style best fits my personality and how can I leverage it more effectively?",
        category: "Style Discovery"
      },
      {
        text: "Guide me through a comprehensive leadership self-evaluation process",
        category: "Self-Evaluation"
      },
      {
        text: "How do I create a personalized leadership development plan?",
        category: "Development Planning"
      }
    ]
  },
  'red-green-zones': {
    title: 'Red & Green Zone Behaviors',
    icon: 'fa-traffic-light',
    prompts: [
      {
        text: "Help me identify behaviors that serve me well (green zone) and those that limit my effectiveness (red zone)",
        category: "Behavior Mapping"
      },
      {
        text: "What triggers cause me to slip into red zone behaviors and how can I manage them?",
        category: "Trigger Management"
      },
      {
        text: "Guide me in developing strategies to operate more consistently in my green zone",
        category: "Green Zone Optimization"
      },
      {
        text: "How do I recover quickly when I notice I'm in my red zone?",
        category: "Recovery Strategies"
      }
    ]
  },
  'big-practice': {
    title: 'One Big Practice',
    icon: 'fa-target',
    prompts: [
      {
        text: "Help me identify the one leadership practice that would have the biggest impact on my effectiveness",
        category: "Impact Assessment"
      },
      {
        text: "How do I design and implement my One Big Practice for sustained growth?",
        category: "Implementation"
      },
      {
        text: "Guide me in creating accountability systems for my One Big Practice",
        category: "Accountability"
      },
      {
        text: "How do I measure progress and adjust my One Big Practice over time?",
        category: "Progress Tracking"
      }
    ]
  },
  '360-report': {
    title: '360 Feedback Report',
    icon: 'fa-chart-pie',
    prompts: [
      {
        text: "Help me interpret my 360 feedback results and create an action plan",
        category: "Report Analysis"
      },
      {
        text: "How do I address the gaps between my self-perception and others' feedback?",
        category: "Gap Analysis"
      },
      {
        text: "Guide me in having effective conversations about my 360 feedback with my team",
        category: "Feedback Discussions"
      },
      {
        text: "What are the most effective ways to act on 360 feedback insights?",
        category: "Action Planning"
      }
    ]
  },
  'growth-values': {
    title: 'Leadership Growth Values',
    icon: 'fa-heart',
    prompts: [
      {
        text: "Help me identify my core values and how they should guide my leadership growth",
        category: "Values Discovery"
      },
      {
        text: "How do I align my daily leadership actions with my growth values?",
        category: "Values Alignment"
      },
      {
        text: "Guide me in resolving conflicts between my values and organizational expectations",
        category: "Values Integration"
      },
      {
        text: "How can my values become a source of authentic leadership strength?",
        category: "Values-Based Leadership"
      }
    ]
  },
  'growth-matrix': {
    title: 'Leadership Growth Matrix',
    icon: 'fa-th',
    prompts: [
      {
        text: "Help me create a comprehensive leadership growth matrix that integrates all my development areas",
        category: "Matrix Creation"
      },
      {
        text: "How do I prioritize the different elements of my growth matrix for maximum impact?",
        category: "Prioritization"
      },
      {
        text: "Guide me in making my leadership growth matrix actionable and measurable",
        category: "Implementation Strategy"
      },
      {
        text: "How do I review and evolve my growth matrix over time?",
        category: "Matrix Evolution"
      }
    ]
  },
  'oora-conversation': {
    title: 'OORA Conversation Prep',
    icon: 'fa-comments',
    prompts: [
      {
        text: "Guide me through preparing for a difficult conversation using the OORA framework",
        category: "Difficult Conversations"
      },
      {
        text: "How do I use OORA to structure feedback conversations with team members?",
        category: "Feedback Conversations"
      },
      {
        text: "Help me prepare for a performance discussion using OORA principles",
        category: "Performance Discussions"
      },
      {
        text: "How can I use OORA to facilitate better team meetings and discussions?",
        category: "Team Facilitation"
      }
    ]
  },
  'daily-checkin': {
    title: 'Daily Check-In',
    icon: 'fa-calendar-check',
    prompts: [
      {
        text: "Guide me through a daily reflection on my One Big Practice and values alignment",
        category: "Daily Reflection"
      },
      {
        text: "Help me assess today's leadership moments and learning opportunities",
        category: "Moment Assessment"
      },
      {
        text: "How can I end today with intentional planning for tomorrow's leadership growth?",
        category: "Forward Planning"
      },
      {
        text: "What daily practices will accelerate my leadership development?",
        category: "Practice Development"
      }
    ]
  }
};
