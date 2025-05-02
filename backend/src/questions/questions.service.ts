import { Injectable } from '@nestjs/common';
import { QuestionsGateway } from './questions.gateway';
import { Question, QuestionType } from '../types';

@Injectable()
export class QuestionsService {
	private questions: Question[] = [
		{
			id: '1',
			content: 'The capital of France is ____.',
			type: QuestionType.QUIZ,
			answers: [
				{ id: '1', content: 'Paris', isCorrect: true },
				{ id: '2', content: 'London', isCorrect: false },
				{ id: '3', content: 'Berlin', isCorrect: false },
				{ id: '4', content: 'Madrid', isCorrect: false }
			],
			correctAnswerId: '1',
			groupIds: ['group1', 'group2'],
			topicIds: ['Programming'],
			points: 0.25
		},
		{
			id: '2',
			content: 'The largest planet in our solar system is ____.',
			type: QuestionType.QUIZ,
			answers: [
				{ id: '1', content: 'Jupiter', isCorrect: true },
				{ id: '2', content: 'Saturn', isCorrect: false },
				{ id: '3', content: 'Mars', isCorrect: false },
				{ id: '4', content: 'Earth', isCorrect: false }
			],
			correctAnswerId: '1',
			groupIds: ['group1', 'group2'],
			topicIds: ['Algorithms'],
			points: 0.25
		},
		{
			id: '3',
			content: 'What is the capital of France?',
			type: QuestionType.QUIZ,
			answers: [
				{ id: '1', content: 'Paris' },
				{ id: '2', content: 'London' },
				{ id: '3', content: 'Berlin' },
				{ id: '4', content: 'Madrid' }
			],
			correctAnswerId: '1',
			groupIds: ['group3', 'group4'],
			topicIds: ['Algorithms'],
			points: 0.25
		},
		{
			id: '5',
			groupIds: ['group3', 'group4'],
			topicIds: ['Algorithms'],
			content: 'Ինչպե՞ս է աշխատում Quick Sort ալգորիթմը:',
			type: QuestionType.QUIZ,
			answers: [
				{ id: 'A', content: 'Օգտագործում է բաժանում և նվաճում մոտեցում' },
				{ id: 'B', content: 'Օգտագործում է դինամիկ ծրագրավորում' },
				{ id: 'C', content: 'Օգտագործում է greedy մոտեցում' },
				{ id: 'D', content: 'Օգտագործում է backtracking մոտեցում' }
			],
			correctAnswerId: 'A',
			points: 0.25
		},
		{
			id: '7',
			groupIds: ['group4', 'group5'],
			topicIds: ['Data Structures'],
			content: 'Ինչպե՞ս է աշխատում B-tree ինդեքսը տվյալների բազաներում:',
			type: QuestionType.QUIZ,
			answers: [
				{ id: 'A', content: 'Օգտագործում է հավասարակշռված ծառ' },
				{ id: 'B', content: 'Օգտագործում է հեշավորման ֆունկցիա' },
				{ id: 'C', content: 'Օգտագործում է գծային որոնում' },
				{ id: 'D', content: 'Օգտագործում է բինար որոնում' }
			],
			correctAnswerId: 'A',
			points: 0.25
		}
	];

	constructor(private readonly questionsGateway: QuestionsGateway) { }

	async getQuestion(id: string): Promise<Question | null> {
		return this.questions.find(q => q.id === id) || null;
	}

	async findAll(groupId?: string, topicId?: string): Promise<Question[]> {
		const groupIds = groupId ? groupId.split(',') : [];
		return this.questions.filter(question => {
			const matchesGroup = groupIds.length === 0 || question.groupIds.some(id => groupIds.includes(id));
			const matchesTopic = !topicId || question.topicIds.includes(topicId);
			return matchesGroup && matchesTopic;
		});
	}

	async create(createQuestionDto: Omit<Question, 'id'>): Promise<Question> {
		const newQuestion: Question = {
			id: (this.questions.length + 1).toString(),
			...createQuestionDto
		};
		this.questions.push(newQuestion);
		this.questionsGateway.emitQuestionCreated(newQuestion);
		return newQuestion;
	}

	async update(id: string, updateQuestionDto: Partial<Question>): Promise<Question | null> {
		const index = this.questions.findIndex(q => q.id === id);
		if (index === -1) return null;

		this.questions[index] = {
			...this.questions[index],
			...updateQuestionDto
		};
		this.questionsGateway.emitQuestionUpdated(this.questions[index]);
		return this.questions[index];
	}

	async remove(id: string): Promise<Question | null> {
		const index = this.questions.findIndex(q => q.id === id);
		if (index === -1) return null;

		const removedQuestion = this.questions[index];
		this.questions.splice(index, 1);
		this.questionsGateway.emitQuestionDeleted(id);
		return removedQuestion;
	}
} 