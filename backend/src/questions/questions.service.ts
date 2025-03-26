import { Injectable } from '@nestjs/common';
import { QuestionsGateway } from './questions.gateway';
import { Question } from '../schemas/question.schema';

// const mockQuestions = [
// 	{
// 		id: '1',
// 		content: 'What is the capital of France?',
// 		type: 'text',
// 	},
// 	{
// 		id: '2',
// 		content: 'What is 2 + 2?',
// 		type: 'quiz',
// 		answers: [
// 			{
// 				id: '1',
// 				content: '1',
// 			},
// 			{
// 				id: '2',
// 				content: '2',
// 			},
// 			{
// 				id: '3',
// 				content: '3',
// 			},
// 			{
// 				id: '4',
// 				content: '4',
// 			},
// 		],
// 		correctAnswerId: '4',
// 	},
// 	{
// 		id: '3',
// 		content: 'Explain the concept of gravity.',
// 		type: 'text',
// 	}
// ];

const mockQuestions: Question[] = [];

@Injectable()
export class QuestionsService {
	private questions = [...mockQuestions];

	constructor(private readonly questionsGateway: QuestionsGateway) {}

	async create(createQuestionDto: Omit<Question, 'id'>) {
		const newQuestion: Question = {
			id: (this.questions.length + 1).toString(),
			...createQuestionDto
		};
		this.questions.push(newQuestion);
		this.questionsGateway.emitQuestionCreated(newQuestion);
		return newQuestion;
	}

	async findAll() {
		return this.questions;
	}

	async findOne(id: string) {
		return this.questions.find(q => q.id === id);
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