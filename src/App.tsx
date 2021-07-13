import { useEffect, useState } from "react";
import './App.css';
import moment from "moment";
import Nav from "./components/Nav";
import Graph from "./components/Graph";
import {
  useQuery,
  gql
} from "@apollo/client";
import { IRange, RangeTuple, IData } from './GlobalTypes';

const GET_RANGES_AND_DATA = gql`
  query GetRangesAndData {
    ranges {
      low_bound
      high_bound
      color
    }
    data {
      result_id
      result_dt_tm
      glucose_level
      glucose_level_unit
      source
    }
  }
`;

type Data = {
  ranges: IRange[],
  data: IData[]
}


function App(): JSX.Element {

  const [glucoseData, setGlucoseData] = useState<IData[]>([])
  const [glucoseRangeTuples, setGlucoseRangeTuples] = useState<RangeTuple[]>([])
  const [selectedDates, setSelectedDates] = useState({
    start: "",
    end: ""
  })

  const { loading, error, data } = useQuery<Data>(GET_RANGES_AND_DATA);

  // On load of data, set initial state

  useEffect(()=> {
    if (!loading && data !== undefined) {
      let dataClone: IData[] = []
      data.data.forEach((e: IData): void => {
        dataClone.push(e)
      })
      dataClone.sort((a: IData, b: IData): number => {
        return (
          new Date(a.result_dt_tm.slice(0,10)).getTime() - 
          new Date(b.result_dt_tm.slice(0,10)).getTime()
        )
      })
      setGlucoseData(dataClone)
      let rangesToArrays: RangeTuple[] = []
      data.ranges.forEach((r: IRange): void => {
        rangesToArrays.push([r.low_bound, r.high_bound, r.color])
      })
      rangesToArrays.sort(function(a: RangeTuple, b: RangeTuple): number {
        return a[0] - b[0];
      });
      setGlucoseRangeTuples(rangesToArrays)
      let startDT: string = dataClone[0].result_dt_tm
      let startD:string = moment(startDT.slice(0, startDT.search(" "))).format()
      let endDT:string = dataClone[dataClone.length - 1].result_dt_tm
      let endD:string = moment(endDT.slice(0, endDT.search(" "))).format()
      setSelectedDates({
        start: startD,
        end: endD
      })
    }
  }, [data])

  if (error) {
    console.log(error)
  };

  return (
    <>
      {!loading && glucoseData.length ? 
        <div className="App">
          <Nav selectedDates={selectedDates} setSelectedDates={setSelectedDates} glucoseData={glucoseData}/>
          <Graph selectedDates={selectedDates} glucoseData={glucoseData} glucoseRangeTuples={glucoseRangeTuples}/>
        </div>
      : 
        <h1 id="Loading">
          Loading...
        </h1>
      }
    </>
  );
}

export default App;