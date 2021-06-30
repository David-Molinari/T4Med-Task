export interface IRange {
  _id?: string,
  low_bound: number,
  high_bound: number,
  color: string
}

export type RangeTuple = [number, number, string]

export interface IData {
  _id: string,
  result_id: string,
  result_dt_tm: string,
  glucose_level: number,
  glucose_level_unit: string,
  source: string
}

export interface ISelectedDates {
    start: string,
    end: string
}

export interface IData {
    _id: string,
    result_id: string,
    result_dt_tm: string,
    glucose_level: number,
    glucose_level_unit: string,
    source: string
}

export interface IModal {
  open: boolean;
  data: {
      glucoseLevelNum?: number,
      glucoseLevel: number | string,
      resultDate: string,
      source: string,
      resultId: string
  };
}

export interface IItem {
  date: string, 
  result: IData[]
}