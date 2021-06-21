import React, { useEffect, useState } from "react";
import './App.css';
import moment from "moment";
import Nav from "./components/Nav";
import Graph from "./components/Graph";
import {
  useQuery,
  gql
} from "@apollo/client";

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

function App() {

  const [glucoseData, setGlucoseData] = useState([])
  const [glucoseRanges, setGlucoseRanges] = useState([])
  const [selectedDates, setSelectedDates] = useState({
    start: "",
    end: ""
  })

  const { loading, error, data } = useQuery(GET_RANGES_AND_DATA);

  // On load of data, set initial state
  useEffect(()=> {
    if (!loading) {
      setGlucoseData(data.data)
      let rangesToArrays = []
      data.ranges.forEach((r)=> {
        rangesToArrays.push([r.low_bound, r.high_bound, r.color])
      })
      setGlucoseRanges(rangesToArrays)
      let startDT = data.data[0].result_dt_tm
      let startD = moment(startDT.slice(0, startDT.search(" "))).format()
      let endDT = data.data[data.data.length - 1].result_dt_tm
      let endD = moment(endDT.slice(0, endDT.search(" "))).format()
      setSelectedDates({
        start: startD,
        end: endD
      })
    }
  }, [data])

  if (error) return `${error}`;

  return (
    <>
      {!loading && glucoseData.length ? 
        <div className="App">
          <Nav selectedDates={selectedDates} setSelectedDates={setSelectedDates} glucoseData={glucoseData}/>
          <Graph selectedDates={selectedDates} glucoseData={glucoseData} glucoseRanges={glucoseRanges}/>
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