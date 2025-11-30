export type GameState = 'START' | 'PLAY' | 'GAME_OVER';

export type QuestionType = 'TEXT' | 'COLOR';

export type ColorDefinition = {
  id: string;
  name: string;
  hex: string;
};

export interface Question {
  text: ColorDefinition;
  color: ColorDefinition;
  type: QuestionType;
}