import { Injectable } from '@nestjs/common';
import { QuestionsGateway } from './questions.gateway';
import { Question } from '../schemas/question.schema';

const mockQuestions: Question[] = [
	{
		id: '1',
		classId: 'cs101',
		groupIds: ['group1', 'group2'],
		content: 'Ինչպե՞ս կարող ենք ներդնել Strategy նախագծման օրինաչափությունը Java-ում:',
		type: 'quiz',
		answers: [
			{ id: 'A', content: 'Օգտագործելով abstract կլասեր և interface-ներ' },
			{ id: 'B', content: 'Օգտագործելով միայն sealed կլասեր' },
			{ id: 'C', content: 'Օգտագործելով միայն ստատիկ մեթոդներ' },
			{ id: 'D', content: 'Բոլոր տարբերակներն էլ ճիշտ են' }
		],
		correctAnswerId: 'A',
	},
	{
		id: '2',
		classId: 'cs101',
		groupIds: ['group1'],
		content: 'Բացատրեք Observer նախագծման օրինաչափության կիրառությունը իրական կյանքից օրինակով:',
		type: 'text',
	},
	{
		id: '3',
		classId: 'cs201',
		groupIds: ['group3'],
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
		id: '4',
		classId: 'cs301',
		groupIds: ['group5'],
		content: 'Ինչպե՞ս է աշխատում էջերի փոխարինման LRU ալգորիթմը:',
		type: 'text',
	},
	{
		id: '5',
		classId: 'cs401',
		groupIds: ['group4'],
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

@Injectable()
export class QuestionsService {
	private questions = [...mockQuestions];

	constructor(private readonly questionsGateway: QuestionsGateway) { }

	async create(createQuestionDto: Omit<Question, 'id'>) {
		const newQuestion: Question = {
			id: (this.questions.length + 1).toString(),
			...createQuestionDto
		};
		this.questions.push(newQuestion);
		this.questionsGateway.emitQuestionCreated(newQuestion);
		return newQuestion;
	}

	async findAll(groupIds: string, classId: string) {
		if (groupIds && classId) {
			return this.findByGroupIdsAndClassId(groupIds, classId);
		} else if (groupIds) {
			return this.findByGroupIds(groupIds);
		} else if (classId) {
			return this.findByClassId(classId);
		}

		return this.questions;
	}

	async findOne(id: string) {
		return this.questions.find(q => q.id === id);
	}

	async findByClassId(classId: string) {
		return this.questions.filter(q => q.classId === classId);
	}

	async findByGroupIdsAndClassId(groupIds: string, classId: string) {
		const groupIdsArray = groupIds.split(',');
		return this.questions.filter(q => q.groupIds.some(groupId => groupIdsArray.includes(groupId)) && q.classId === classId);
	}

	async findByGroupIds(groupIds: string) {
		const groupIdsArray = groupIds.split(',');

		console.log(groupIdsArray);
		return this.questions.filter(q => q.groupIds.some(groupId => groupIdsArray.includes(groupId)));
	}

	async update(id: string, updateQuestionDto: Partial<Question>) {
		const index = this.questions.findIndex(q => q.id === id);
		if (index === -1) return null;

		this.questions[index] = {
			...this.questions[index],
			...updateQuestionDto
		};
		this.questionsGateway.emitQuestionUpdated(this.questions[index]);
		return this.questions[index];
	}

	async remove(id: string) {
		const index = this.questions.findIndex(q => q.id === id);
		if (index === -1) return null;

		const removedQuestion = this.questions[index];
		this.questions.splice(index, 1);
		this.questionsGateway.emitQuestionDeleted(id);
		return removedQuestion;
	}
} 