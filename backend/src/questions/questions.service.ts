import { Injectable } from '@nestjs/common';
import { QuestionsGateway } from './questions.gateway';
import { Question } from './interfaces/question.interface';

@Injectable()
export class QuestionsService {
	private readonly questions: Question[] = [
		{
			id: '1',
			content: 'The capital of France is ____.',
			type: 'quiz',
			answers: [
				{ id: '1', content: 'Paris' },
				{ id: '2', content: 'London' },
				{ id: '3', content: 'Berlin' },
				{ id: '4', content: 'Madrid' }
			],
			correctAnswerId: '1',
			groupIds: ['group1', 'group2'],
			topicIds: ['Programming'],
		},
		{
			id: '2',
			content: 'The largest planet in our solar system is ____.',
			type: 'quiz',
			answers: [
				{ id: '1', content: 'Jupiter' },
				{ id: '2', content: 'Saturn' },
				{ id: '3', content: 'Mars' },
				{ id: '4', content: 'Earth' }
			],
			correctAnswerId: '1',
			groupIds: ['group1', 'group2'],
			topicIds: ['Algorithms']
		},
		{
			id: '3',
			content: 'What is the capital of France?',
			type: 'quiz',
			answers: [
				{ id: '1', content: 'Paris' },
				{ id: '2', content: 'London' },
				{ id: '3', content: 'Berlin' },
				{ id: '4', content: 'Madrid' }
			],
			correctAnswerId: '1',
			groupIds: ['group3', 'group4'],
			topicIds: ['Algorithms']
		},
		{
			id: '5',
			groupIds: ['group3', 'group4'],
			topicIds: ['Algorithms'],
			content: 'Ինչպե՞ս է աշխատում Quick Sort ալգորիթմը:',
			type: 'quiz',
			answers: [
				{ id: 'A', content: 'Օգտագործում է բաժանում և նվաճում մոտեցում' },
				{ id: 'B', content: 'Օգտագործում է դինամիկ ծրագրավորում' },
				{ id: 'C', content: 'Օգտագործում է greedy մոտեցում' },
				{ id: 'D', content: 'Օգտագործում է backtracking մոտեցում' }
			],
			correctAnswerId: 'A',
		},
		{
			id: '7',
			groupIds: ['group4', 'group5'],
			topicIds: ['Data Structures'],
			content: 'Ինչպե՞ս է աշխատում B-tree ինդեքսը տվյալների բազաներում:',
			type: 'quiz',
			answers: [
				{ id: 'A', content: 'Օգտագործում է հավասարակշռված ծառ' },
				{ id: 'B', content: 'Օգտագործում է հեշավորման ֆունկցիա' },
				{ id: 'C', content: 'Օգտագործում է գծային որոնում' },
				{ id: 'D', content: 'Օգտագործում է բինար որոնում' }
			],
			correctAnswerId: 'A',
		}
	];

	constructor(private readonly questionsGateway: QuestionsGateway) { }

	create(createQuestionDto: Omit<Question, 'id'>): Question {
		const newQuestion: Question = {
			id: (this.questions.length + 1).toString(),
			...createQuestionDto
		};
		this.questions.push(newQuestion);
		this.questionsGateway.emitQuestionCreated(newQuestion);
		return newQuestion;
	}

	findAll(groupId?: string, topicId?: string): Question[] {
		const groupIds = groupId ? groupId.split(',') : [];

		return this.questions.filter(question => {
			const matchesGroup = question.groupIds.some(id => groupIds.includes(id));
			const matchesTopic = !topicId || question.topicIds.includes(topicId);
			return matchesGroup && matchesTopic;
		});
	}

	findOne(id: string): Question | undefined {
		return this.questions.find(q => q.id === id);
	}

	findByGroupIds(groupIds: string, questions = this.questions): Question[] {
		const groupIdsArray = groupIds.split(',');
		return questions.filter(q => q.groupIds.some(groupId => groupIdsArray.includes(groupId)));
	}

	update(id: string, updateQuestionDto: Partial<Question>): Question | undefined {
		const index = this.questions.findIndex(q => q.id === id);
		if (index === -1) return undefined;

		this.questions[index] = {
			...this.questions[index],
			...updateQuestionDto
		};
		this.questionsGateway.emitQuestionUpdated(this.questions[index]);
		return this.questions[index];
	}

	remove(id: string): Question | undefined {
		const index = this.questions.findIndex(q => q.id === id);
		if (index === -1) return undefined;

		const removedQuestion = this.questions[index];
		this.questions.splice(index, 1);
		this.questionsGateway.emitQuestionDeleted(id);
		return removedQuestion;
	}
} 