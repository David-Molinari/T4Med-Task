export interface IRange {
  _id?: string,
  low_bound: number,
  high_bound: number,
  color: string
}

export type RangeTuple = [number, number, string]

export interface ISelectedDates {
    start: string,
    end: string
}

export interface IData {
    _id: string,
    index: number,
    result_id: string,
    result_dt_tm: string,
    glucose_level: number,
    glucose_level_unit: string,
    source: string
}

export interface IEdge {
  cursor: String
  node: IData
}

export interface PageInfo {
  endCursor: String
  hasNextPage: Boolean
}

export interface IDataResponse {
  data: {
    edges: [IEdge]
    pageInfo: PageInfo
  }
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